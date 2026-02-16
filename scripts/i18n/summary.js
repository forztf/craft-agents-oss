#!/usr/bin/env node

import { spawnSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..', '..')

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

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf-8'))
}

function writeText(p, s) {
  fs.mkdirSync(path.dirname(p), { recursive: true })
  fs.writeFileSync(p, s)
}

function listHardZhReports() {
  const dir = path.join(projectRoot, 'test-results', 'i18n')
  if (!fs.existsSync(dir)) return []
  const files = fs.readdirSync(dir)
    .filter(f => /^hard-zh-\d{8}-\d{6}\.json$/.test(f))
    .map(f => path.join(dir, f))
  files.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)
  return files
}

function runScan(outRel) {
  const scanPath = path.join(projectRoot, 'scripts', 'i18n', 'scan.js')
  const outAbs = path.join(projectRoot, outRel)
  const res = spawnSync(process.execPath, [scanPath, `--out=${outRel}`], { cwd: projectRoot, stdio: 'inherit' })
  if (res.status !== 0) throw new Error('scan failed')
  return readJson(outAbs)
}

function tryGitAuthors(relFile) {
  const res = spawnSync('git', ['log', '-n', '2', '--pretty=format:%an', '--', relFile], { cwd: projectRoot, encoding: 'utf-8' })
  if (res.status !== 0) return []
  const raw = String(res.stdout || '').trim()
  if (!raw) return []
  const list = raw.split(/\r?\n/).map(s => s.trim()).filter(Boolean)
  return Array.from(new Set(list))
}

function formatDateStamp(d) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
}

function csvEscape(v) {
  const s = String(v ?? '')
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const startedAt = Date.now()

  const baseReportPath = args.in
    ? path.resolve(projectRoot, args.in)
    : (listHardZhReports()[0] ?? null)
  if (!baseReportPath || !fs.existsSync(baseReportPath)) {
    process.stderr.write('未找到 hard-zh 基线报告，请先运行: npm run i18n:audit\n')
    process.exit(1)
  }

  const base = readJson(baseReportPath)
  const baseIssues = base.summary?.issues ?? 0

  const currentScanRel = args.currentOut
    ? String(args.currentOut)
    : `test-results/i18n/scan-current-${formatDateStamp(new Date())}.json`
  const current = runScan(currentScanRel)
  const currentIssues = current.summary?.issues ?? 0

  const pageMapPath = path.join(projectRoot, 'test-results', 'i18n', 'page-zh-map.json')
  const pageMap = fs.existsSync(pageMapPath) ? readJson(pageMapPath) : null

  const fixed = Math.max(0, baseIssues - currentIssues)
  const falsePositives = 0

  const subtasksRel = args.subtasksOut ? String(args.subtasksOut) : 'test-results/i18n/i18n-subtasks.csv'
  const subtasksAbs = path.join(projectRoot, subtasksRel)
  const rows = []
  rows.push(['pageOrComponent', 'ownerCandidates', 'status', 'durationSec', 'leaksInitial', 'leaksNow'].map(csvEscape).join(','))

  const pages = Array.isArray(pageMap?.pages) ? pageMap.pages : []
  for (const p of pages) {
    const files = Array.isArray(p.files) ? p.files : []
    const owners = new Set()
    for (const f of files) {
      for (const a of tryGitAuthors(f)) owners.add(a)
    }
    const leaksInitial = Number(p.issues || 0)
    const status = leaksInitial === 0 ? 'done' : (currentIssues === 0 ? 'done' : 'pending')
    rows.push([
      p.page ?? '(unknown)',
      Array.from(owners).join(' | ') || '-',
      status,
      '-',
      String(leaksInitial),
      String(currentIssues === 0 ? 0 : '-'),
    ].map(csvEscape).join(','))
  }

  writeText(subtasksAbs, rows.join('\n') + '\n')

  const summaryRel = args.out ? String(args.out) : `test-results/i18n/i18n-leak-summary-${formatDateStamp(new Date())}.md`
  const summaryAbs = path.join(projectRoot, summaryRel)

  const durationSec = Math.round((Date.now() - startedAt) / 1000)
  const lines = []
  lines.push(`# i18n 漏翻译补漏总结`)
  lines.push('')
  lines.push(`- 基线报告: ${toPosix(path.relative(projectRoot, baseReportPath))}`)
  lines.push(`- 当前扫描: ${toPosix(currentScanRel)}`)
  lines.push(`- 子任务清单: ${toPosix(subtasksRel)}`)
  if (pageMapPath && fs.existsSync(pageMapPath)) lines.push(`- 页面漏译地图: ${toPosix(path.relative(projectRoot, pageMapPath))}`)
  lines.push('')
  lines.push(`## 总览`)
  lines.push('')
  lines.push(`- 总页面/部件数: ${pages.length}`)
  lines.push(`- 初始硬编码中文数: ${baseIssues}`)
  lines.push(`- 修复数: ${fixed}`)
  lines.push(`- 当前漏译数: ${currentIssues}`)
  lines.push(`- 误报数: ${falsePositives}`)
  lines.push(`- 脚本耗时: ${durationSec}s`)
  lines.push('')
  lines.push(`## 固化建议`)
  lines.push('')
  lines.push(`- MR 门禁执行: bun run test:i18n:full`)
  lines.push(`- 每周定期执行: npm run i18n:audit + bun run test:i18n:zh-leak`)
  lines.push(`- 规则沉淀: scripts/i18n/rules.json 统一维护白名单与阈值`)
  lines.push('')

  writeText(summaryAbs, lines.join('\n') + '\n')
  process.stdout.write(`${toPosix(path.relative(projectRoot, summaryAbs))}\n`)
  process.exit(0)
}

main()
