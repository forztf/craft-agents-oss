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

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

function toPosix(p) {
  return p.replace(/\\/g, '/')
}

function shouldIgnorePath(filePath, rules) {
  const norm = toPosix(filePath)
  return rules.ignorePathContains.some(s => norm.includes(s))
}

function walkFiles(rootDir, rules) {
  const out = []
  const includeExts = new Set(rules.includeExtensions)

  const walk = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const ent of entries) {
      const full = path.join(dir, ent.name)
      if (shouldIgnorePath(full, rules)) continue
      if (ent.isDirectory()) {
        walk(full)
        continue
      }
      if (!ent.isFile()) continue
      const ext = path.extname(ent.name)
      if (includeExts.has(ext)) out.push(full)
    }
  }

  walk(rootDir)
  return out
}

function stripJsTsComments(text) {
  let s = text.replace(/\/\*[\s\S]*?\*\//g, ' ')
  s = s.replace(/(^|[^:])\/\/.*$/gm, '$1')
  return s
}

function isAllowedText(text, rules) {
  const trimmed = text.trim()
  for (const pat of rules.allowTextPatterns) {
    try {
      if (new RegExp(pat).test(trimmed)) return true
    } catch {
      continue
    }
  }
  return false
}

function indexToLineCol(text, index) {
  let line = 1
  let lastNl = -1
  for (let i = 0; i < index; i++) {
    if (text.charCodeAt(i) === 10) {
      line++
      lastNl = i
    }
  }
  const col = index - lastNl
  return { line, col }
}

function buildPageEntry(namespace, entryFiles, maxDepth, rules) {
  const queue = [...entryFiles]
  const visited = new Set()
  const result = new Set()

  const resolveImport = (fromFile, spec) => {
    const baseDir = path.dirname(fromFile)
    const rendererRoot = path.join(projectRoot, 'apps', 'electron', 'src', 'renderer')
    const base = spec.startsWith('@/') ? path.join(rendererRoot, spec.slice(2)) : path.resolve(baseDir, spec)
    const candidates = [
      base,
      `${base}.ts`,
      `${base}.tsx`,
      `${base}.js`,
      `${base}.jsx`,
      path.join(base, 'index.ts'),
      path.join(base, 'index.tsx'),
      path.join(base, 'index.js'),
      path.join(base, 'index.jsx'),
    ]
    for (const c of candidates) {
      if (fs.existsSync(c) && fs.statSync(c).isFile()) return c
    }
    return null
  }

  let depth = 0
  while (queue.length > 0 && depth <= maxDepth) {
    const size = queue.length
    for (let i = 0; i < size; i++) {
      const file = queue.shift()
      if (!file) continue
      if (visited.has(file)) continue
      visited.add(file)
      if (shouldIgnorePath(file, rules)) continue
      result.add(file)
      const ext = path.extname(file)
      if (!['.ts', '.tsx', '.js', '.jsx'].includes(ext)) continue
      let content = ''
      try {
        content = fs.readFileSync(file, 'utf-8')
      } catch {
        continue
      }
      const importMatches = content.matchAll(/from\s+['"]([^'"]+)['"]/g)
      for (const m of importMatches) {
        const spec = m[1]
        if (!spec) continue
        if (!(spec.startsWith('.') || spec.startsWith('@/'))) continue
        const resolved = resolveImport(file, spec)
        if (resolved && !visited.has(resolved)) queue.push(resolved)
      }
    }
    depth++
  }

  return { namespace, files: Array.from(result).sort() }
}

function findUseTranslationNamespaces(fileContent) {
  const out = new Set()
  const re = /useTranslation\(\s*['"]([^'"]+)['"]\s*\)/g
  let m
  while ((m = re.exec(fileContent)) !== null) {
    if (m[1]) out.add(m[1])
  }
  return Array.from(out)
}

function scanFile(filePath, rules) {
  const raw = fs.readFileSync(filePath, 'utf-8')
  const ext = path.extname(filePath)
  const content = ['.ts', '.tsx', '.js', '.jsx'].includes(ext) ? stripJsTsComments(raw) : raw

  const issues = []
  const zhRe = new RegExp(`[\\u4E00-\\u9FFF]{${rules.minChineseRun},}`, 'g')
  let m
  while ((m = zhRe.exec(content)) !== null) {
    const text = m[0]
    if (!text) continue
    if (isAllowedText(text, rules)) continue
    const { line, col } = indexToLineCol(content, m.index)
    const start = Math.max(0, m.index - rules.contextChars)
    const end = Math.min(content.length, m.index + text.length + rules.contextChars)
    const context = content.slice(start, end).replace(/\s+/g, ' ').trim()
    issues.push({
      file: toPosix(path.relative(projectRoot, filePath)),
      line,
      col,
      text,
      context,
    })
    zhRe.lastIndex = m.index + text.length
  }
  return issues
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const rulesPath = args.rules ? path.resolve(projectRoot, args.rules) : path.join(projectRoot, 'scripts', 'i18n', 'rules.json')
  const rules = readJson(rulesPath)

  const scanRoots = (args.root ? [args.root] : rules.scanRoots).map(p => path.resolve(projectRoot, p))
  const page = typeof args.page === 'string' && args.page.trim() ? args.page.trim() : null
  const importDepth = args.depth ? Math.max(0, Number(args.depth)) : 3

  const allFiles = []
  for (const root of scanRoots) {
    if (!fs.existsSync(root)) continue
    allFiles.push(...walkFiles(root, rules))
  }

  const pageFiles = new Set()
  if (page) {
    for (const f of allFiles) {
      const ext = path.extname(f)
      if (!['.ts', '.tsx', '.js', '.jsx'].includes(ext)) continue
      const content = fs.readFileSync(f, 'utf-8')
      if (content.includes(`useTranslation('${page}'`) || content.includes(`useTranslation("${page}"`)) {
        const entry = buildPageEntry(page, [f], importDepth, rules)
        for (const pf of entry.files) pageFiles.add(pf)
      }
    }
  }

  const targetFiles = page ? Array.from(pageFiles) : allFiles
  const issues = []
  for (const f of targetFiles) {
    if (shouldIgnorePath(f, rules)) continue
    try {
      issues.push(...scanFile(f, rules))
    } catch {
      continue
    }
  }

  const byFile = {}
  for (const it of issues) {
    byFile[it.file] ??= []
    byFile[it.file].push(it)
  }

  const namespaces = {}
  if (!page) {
    for (const f of allFiles) {
      const ext = path.extname(f)
      if (!['.ts', '.tsx', '.js', '.jsx'].includes(ext)) continue
      let content = ''
      try {
        content = fs.readFileSync(f, 'utf-8')
      } catch {
        continue
      }
      const nss = findUseTranslationNamespaces(content)
      for (const ns of nss) {
        namespaces[ns] ??= []
        namespaces[ns].push(toPosix(path.relative(projectRoot, f)))
      }
    }
  }

  const payload = {
    timestamp: new Date().toISOString(),
    page: page ?? undefined,
    roots: scanRoots.map(r => toPosix(path.relative(projectRoot, r))),
    summary: {
      filesScanned: targetFiles.length,
      issues: issues.length,
    },
    issuesByFile: byFile,
    namespaces: page ? undefined : namespaces,
  }

  const outPath = args.out ? path.resolve(projectRoot, args.out) : null
  const json = JSON.stringify(payload, null, 2)
  if (outPath) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true })
    fs.writeFileSync(outPath, json)
  } else {
    process.stdout.write(json + '\n')
  }

  const fail = args.fail === true || args.fail === 'true'
  process.exit(fail && issues.length > 0 ? 1 : 0)
}

main()
