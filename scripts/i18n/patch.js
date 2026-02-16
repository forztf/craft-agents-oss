#!/usr/bin/env node

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

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf-8')
}

function writeText(filePath, text) {
  fs.writeFileSync(filePath, text)
}

function readJson(filePath) {
  return JSON.parse(readText(filePath))
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n')
}

function walkRendererFiles() {
  const root = path.join(projectRoot, 'apps', 'electron', 'src', 'renderer')
  const out = []
  const walk = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const ent of entries) {
      const full = path.join(dir, ent.name)
      const rel = full.replace(projectRoot + path.sep, '').replace(/\\/g, '/')
      if (rel.includes('node_modules') || rel.includes('__tests__') || rel.includes('/tests/')) continue
      if (ent.isDirectory()) {
        if (ent.name.startsWith('.')) continue
        walk(full)
        continue
      }
      if (!ent.isFile()) continue
      const ext = path.extname(ent.name)
      if (!['.ts', '.tsx', '.js', '.jsx'].includes(ext)) continue
      out.push(rel)
    }
  }
  if (fs.existsSync(root)) walk(root)
  return out
}

function findFilesUsingNamespace(namespace) {
  const files = walkRendererFiles()
  const out = []
  const a = `useTranslation('${namespace}'`
  const b = `useTranslation("${namespace}"`
  for (const rel of files) {
    const abs = path.join(projectRoot, rel)
    let s = ''
    try {
      s = readText(abs)
    } catch {
      continue
    }
    if (s.includes(a) || s.includes(b)) out.push(rel)
  }
  return out
}

function findNamespace(fileContent) {
  const m = fileContent.match(/useTranslation\(\s*['"]([^'"]+)['"]\s*\)/)
  return m?.[1] ?? null
}

function extractTKeys(fileContent) {
  const keys = new Set()
  const re = /\bt\(\s*['"]([^'"]+)['"]\s*(?:,|\))/g
  let m
  while ((m = re.exec(fileContent)) !== null) {
    if (m[1]) keys.add(m[1])
  }
  return Array.from(keys)
}

function ensureLocaleKey(namespace, key, zhValue, enValue) {
  const enPath = path.join(projectRoot, 'i18n', 'locales', 'en', `${namespace}.json`)
  const zhPath = path.join(projectRoot, 'i18n', 'locales', 'zh-CN', `${namespace}.json`)
  const loadOrEmpty = (p) => (fs.existsSync(p) ? JSON.parse(readText(p)) : {})

  const en = loadOrEmpty(enPath)
  const zh = loadOrEmpty(zhPath)

  if (!(key in en)) en[key] = enValue
  if (!(key in zh)) zh[key] = zhValue

  writeJson(enPath, en)
  writeJson(zhPath, zh)
}

function keyDefaults(namespace, key) {
  if (key === 'English') return { en: 'English', zh: '英语' }
  if (key === 'Simplified Chinese') return { en: 'Simplified Chinese', zh: '简体中文' }
  return { en: key, zh: key }
}

function patchI18nContext(relPath) {
  const abs = path.join(projectRoot, relPath)
  let s = readText(abs)
  const needle = "prefs.language === 'zh-CN' || prefs.language === '简体中文'"
  if (!s.includes(needle)) return { changed: false }

  const marker = "type Language = 'en' | 'zh-CN'"
  if (!s.includes(marker)) return { changed: false }

  const legacyConst = "const LEGACY_SIMPLIFIED_CHINESE = String.fromCharCode(0x7b80, 0x4f53, 0x4e2d, 0x6587)\n"
  if (!s.includes('LEGACY_SIMPLIFIED_CHINESE')) {
    s = s.replace(marker, `${marker}\n\n${legacyConst.trimEnd()}`)
  }

  s = s.replace(needle, "prefs.language === 'zh-CN' || prefs.language === LEGACY_SIMPLIFIED_CHINESE")

  writeText(abs, s)
  return { changed: true }
}

function patchSettingsPreferences(relPath) {
  const abs = path.join(projectRoot, relPath)
  let s = readText(abs)

  const beforeNs = "useTranslation('pages/settings/PreferencesPage')"
  if (s.includes(beforeNs)) {
    s = s.replace(beforeNs, "useTranslation('pages/PreferencesPage')")
  }

  const valueNeedle = "value={formState.language === 'zh-CN' || formState.language === '简体中文' ? 'zh-CN' : 'en'}"
  if (s.includes(valueNeedle)) {
    s = s.replace(valueNeedle, "value={formState.language === 'zh-CN' ? 'zh-CN' : 'en'}")
  }

  const updateNeedle = "updateField('language', v === 'zh-CN' ? '简体中文' : 'English')"
  if (s.includes(updateNeedle)) {
    s = s.replace(updateNeedle, "updateField('language', v)")
  }

  s = s.replace(
    /\{\s*value:\s*'en'\s*,\s*label:\s*'English'\s*\}/g,
    "{ value: 'en', label: t('English') }"
  )
  s = s.replace(
    /\{\s*value:\s*'zh-CN'\s*,\s*label:\s*'简体中文'\s*\}/g,
    "{ value: 'zh-CN', label: t('Simplified Chinese') }"
  )

  if (!s.includes('normalizeLanguagePreference')) {
    const insertAfter = 'const emptyFormState: PreferencesFormState = {'
    const idx = s.indexOf(insertAfter)
    if (idx !== -1) {
      const legacy = "const LEGACY_SIMPLIFIED_CHINESE = String.fromCharCode(0x7b80, 0x4f53, 0x4e2d, 0x6587)\n"
      const fn = "function normalizeLanguagePreference(value: unknown): string {\n  if (value === 'en' || value === 'zh-CN') return value\n  if (value === 'English') return 'en'\n  if (value === LEGACY_SIMPLIFIED_CHINESE) return 'zh-CN'\n  return typeof value === 'string' ? value : ''\n}\n"
      s = s.replace(insertAfter, `${legacy}\n${fn}\n${insertAfter}`)
    }
  }

  const parseNeedle = "language: prefs.language || '',"
  if (s.includes(parseNeedle)) {
    s = s.replace(parseNeedle, "language: normalizeLanguagePreference(prefs.language),")
  }

  writeText(abs, s)
  return { changed: true }
}

function ensureLocaleCoverageForFile(relPath) {
  const abs = path.join(projectRoot, relPath)
  const content = readText(abs)
  const ns = findNamespace(content)
  if (!ns) return { namespace: null, added: 0 }
  const keys = extractTKeys(content)
  let added = 0
  for (const key of keys) {
    const { en, zh } = keyDefaults(ns, key)
    const enPath = path.join(projectRoot, 'i18n', 'locales', 'en', `${ns}.json`)
    const zhPath = path.join(projectRoot, 'i18n', 'locales', 'zh-CN', `${ns}.json`)
    const loadOrEmpty = (p) => (fs.existsSync(p) ? JSON.parse(readText(p)) : {})
    const enJson = loadOrEmpty(enPath)
    const zhJson = loadOrEmpty(zhPath)
    const had = (key in enJson) && (key in zhJson)
    if (!had) {
      ensureLocaleKey(ns, key, zh, en)
      added++
    }
  }
  return { namespace: ns, added }
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const page = typeof args.page === 'string' ? args.page.trim() : null
  const fileArg = typeof args.file === 'string' ? args.file.trim() : null
  const auto = args.auto === undefined ? true : (args.auto === true || args.auto === 'true')

  const scanReportPath = args.in ? path.resolve(projectRoot, args.in) : null
  const report = scanReportPath ? readJson(scanReportPath) : null

  const touched = new Set()
  if (fileArg) {
    touched.add(fileArg)
  }
  if (page) {
    for (const f of findFilesUsingNamespace(page)) touched.add(f)
  }
  if (report?.issuesByFile) {
    for (const file of Object.keys(report.issuesByFile)) {
      touched.add(file)
    }
  }

  const files = Array.from(touched)
  const fixers = new Map([
    ['apps/electron/src/renderer/contexts/I18nContext.tsx', patchI18nContext],
    ['apps/electron/src/renderer/pages/settings/PreferencesPage.tsx', patchSettingsPreferences],
  ])

  const results = []
  if (auto) {
    for (const f of files) {
      const fixer = fixers.get(f)
      if (fixer) {
        const r = fixer(f)
        results.push({ file: f, ...r })
      }
      const cov = ensureLocaleCoverageForFile(f)
      results.push({ file: f, locale: cov })
    }
  }

  const out = args.out ? path.resolve(projectRoot, args.out) : null
  const payload = {
    timestamp: new Date().toISOString(),
    page: page ?? undefined,
    files,
    results,
  }
  const json = JSON.stringify(payload, null, 2)
  if (out) {
    fs.mkdirSync(path.dirname(out), { recursive: true })
    fs.writeFileSync(out, json)
  } else {
    process.stdout.write(json + '\n')
  }

  process.exit(0)
}

main()
