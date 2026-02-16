#!/usr/bin/env node

import { _electron as electron } from 'playwright'
import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..', '..')

const SETTINGS_PAGE_IDS = [
  'app',
  'ai',
  'appearance',
  'input',
  'workspace',
  'permissions',
  'labels',
  'shortcuts',
  'preferences',
]

function settingsRoute(id) {
  return id && id !== 'app' ? `settings/${id}` : 'settings'
}

function parseArgs(argv) {
  const args = {}
  for (const raw of argv) {
    if (!raw.startsWith('--')) continue
    const eq = raw.indexOf('=')
    if (eq === -1) {
      args[raw.slice(2)] = true
      continue
    }
    const k = raw.slice(2, eq)
    const v = raw.slice(eq + 1)
    args[k] = v
  }
  return args
}

function toPosix(p) {
  return p.replace(/\\/g, '/')
}

async function fileExists(p) {
  try {
    await fs.access(p)
    return true
  } catch {
    return false
  }
}

async function navigateToRoute(page, route) {
  await page.evaluate((r) => {
    window.history.pushState({}, '', `craftagents://${r}`)
    window.dispatchEvent(new PopStateEvent('popstate', { state: {} }))
  }, route)
  await page.waitForTimeout(1200)
}

function resolveTargetRoutes(pageArg) {
  const settingsIds = new Set(SETTINGS_PAGE_IDS)
  const want = typeof pageArg === 'string' && pageArg.trim() ? pageArg.trim() : null
  if (want) {
    const last = want.split(/[/:]/).filter(Boolean).pop()
    if (last && settingsIds.has(last)) return [{ id: `settings/${last}`, route: settingsRoute(last) }]
  }
  const out = [{ id: 'allSessions', route: 'allSessions' }]
  for (const id of SETTINGS_PAGE_IDS) out.push({ id: `settings/${id}`, route: settingsRoute(id) })
  return out
}

async function findChineseLeaks(page, allowTextPatterns) {
  const leaks = await page.evaluate((allow) => {
    const allowRes = (allow || []).map((s) => {
      try {
        return new RegExp(s)
      } catch {
        return null
      }
    }).filter(Boolean)

    const isAllowed = (t) => allowRes.some((re) => re.test(String(t).trim()))
    const zhRe = /[\u4E00-\u9FFF]{2,}/

    const cssPath = (el) => {
      if (!el || el.nodeType !== 1) return ''
      const parts = []
      let cur = el
      while (cur && cur.nodeType === 1 && parts.length < 6) {
        const tag = cur.tagName.toLowerCase()
        const parent = cur.parentElement
        if (!parent) {
          parts.unshift(tag)
          break
        }
        const siblings = Array.from(parent.children).filter(c => c.tagName === cur.tagName)
        const idx = siblings.indexOf(cur) + 1
        parts.unshift(`${tag}:nth-of-type(${idx})`)
        cur = parent
      }
      return parts.join(' > ')
    }

    const out = []
    const seen = new Set()
    const root = document.body
    if (!root) return out

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    let node
    while ((node = walker.nextNode())) {
      const text = (node.nodeValue || '').replace(/\s+/g, ' ').trim()
      if (!text) continue
      if (!zhRe.test(text)) continue
      if (isAllowed(text)) continue
      const parent = node.parentElement
      const where = parent ? cssPath(parent) : ''
      const key = `${where}|${text}`
      if (seen.has(key)) continue
      seen.add(key)
      out.push({ text, where })
      if (out.length >= 50) break
    }
    return out
  }, allowTextPatterns)
  return Array.isArray(leaks) ? leaks : []
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const target = typeof args.page === 'string' ? args.page : undefined
  const outPath = typeof args.out === 'string'
    ? path.resolve(projectRoot, args.out)
    : path.join(projectRoot, 'test-results', 'i18n', 'zh-leak-report.json')

  const appDir = path.join(projectRoot, 'apps', 'electron')
  const mainPath = path.join(appDir, 'dist', 'main.cjs')
  if (!(await fileExists(mainPath))) {
    process.stderr.write('Electron 主进程未编译，请先运行: bun run electron:build\n')
    process.exit(1)
  }

  const testConfigDir = await fs.mkdtemp(path.join(os.tmpdir(), 'craft-agent-zh-leak-'))
  await fs.writeFile(
    path.join(testConfigDir, 'preferences.json'),
    JSON.stringify({ language: 'en' }, null, 2),
    'utf-8'
  )

  const routesToCheck = resolveTargetRoutes(target)
  const rules = JSON.parse(await fs.readFile(path.join(projectRoot, 'scripts', 'i18n', 'rules.json'), 'utf-8'))

  const start = Date.now()
  const runId = String(start)
  let electronApp
  let page
  const issues = []

  try {
    electronApp = await electron.launch({
      args: [appDir],
      env: {
        ...process.env,
        NODE_ENV: 'test',
        CRAFT_CONFIG_DIR: testConfigDir,
        CRAFT_APP_NAME: `Craft Agents E2E ${runId}`,
        CRAFT_DEEPLINK_SCHEME: `craftagents-e2e-${runId}`,
      },
    })
    page = await electronApp.firstWindow()
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(5000)

    for (const r of routesToCheck) {
      await navigateToRoute(page, r.route)
      const leaks = await findChineseLeaks(page, rules.allowTextPatterns || [])
      for (const leak of leaks) {
        issues.push({
          page: r.id,
          route: r.route,
          text: leak.text,
          where: leak.where,
        })
      }
    }
  } finally {
    if (electronApp) await electronApp.close().catch(() => undefined)
    await fs.rm(testConfigDir, { recursive: true, force: true }).catch(() => undefined)
  }

  const report = {
    timestamp: new Date().toISOString(),
    durationMs: Date.now() - start,
    routesChecked: routesToCheck.map(r => ({ id: r.id, route: r.route })),
    issues,
  }

  await fs.mkdir(path.dirname(outPath), { recursive: true })
  await fs.writeFile(outPath, JSON.stringify(report, null, 2))
  process.stdout.write(`${toPosix(path.relative(projectRoot, outPath))}\n`)

  process.exit(issues.length > 0 ? 1 : 0)
}

main()
