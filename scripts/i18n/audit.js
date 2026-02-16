#!/usr/bin/env node

import { spawnSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..', '..')

function toPosix(p) {
  return p.replace(/\\/g, '/')
}

function nowStamp() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}

function pickPageOwners(issueFile, namespacesIndex) {
  const owners = []
  for (const [ns, files] of Object.entries(namespacesIndex)) {
    if (!Array.isArray(files)) continue
    if (files.includes(issueFile)) owners.push(ns)
  }
  const pages = owners.filter(o => o.startsWith('pages/'))
  if (pages.length > 0) return pages
  return owners.length > 0 ? owners : ['(unmapped)']
}

function main() {
  const stamp = nowStamp()
  const outDir = path.join(projectRoot, 'test-results', 'i18n')
  const hardListPath = path.join(outDir, `hard-zh-${stamp}.json`)
  const pageMapPath = path.join(outDir, 'page-zh-map.json')

  const scanPath = path.join(projectRoot, 'scripts', 'i18n', 'scan.js')
  const res = spawnSync(process.execPath, [scanPath, `--out=${hardListPath}`], {
    cwd: projectRoot,
    stdio: 'inherit',
  })
  if (res.error) {
    console.error(res.error)
    process.exit(1)
  }
  if (!fs.existsSync(hardListPath)) {
    console.error('hardcoded zh report missing')
    process.exit(1)
  }

  const report = readJson(hardListPath)
  const namespacesIndex = report.namespaces || {}
  const issuesByFile = report.issuesByFile || {}

  const pages = {}
  let totalIssues = 0
  for (const [file, issues] of Object.entries(issuesByFile)) {
    const owners = pickPageOwners(file, namespacesIndex)
    for (const owner of owners) {
      pages[owner] ??= { files: new Set(), issues: 0 }
      pages[owner].files.add(file)
      pages[owner].issues += Array.isArray(issues) ? issues.length : 0
    }
    totalIssues += Array.isArray(issues) ? issues.length : 0
  }

  const pageEntries = Object.entries(pages)
    .map(([page, meta]) => ({
      page,
      files: Array.from(meta.files).sort(),
      issues: meta.issues,
    }))
    .sort((a, b) => b.issues - a.issues || a.page.localeCompare(b.page))

  const pageMap = {
    timestamp: report.timestamp,
    hardList: toPosix(path.relative(projectRoot, hardListPath)),
    summary: {
      pages: pageEntries.length,
      issues: totalIssues,
    },
    pages: pageEntries,
  }

  writeJson(pageMapPath, pageMap)
  process.stdout.write(`${toPosix(path.relative(projectRoot, hardListPath))}\n`)
  process.stdout.write(`${toPosix(path.relative(projectRoot, pageMapPath))}\n`)
  process.exit(0)
}

main()
