#!/usr/bin/env bun
/**
 * 修复导入路径：将 @/i18n/index 改为 @/contexts/I18nContext
 */

import { readdirSync, statSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const projectRoot = process.cwd()
const rendererDir = join(projectRoot, 'apps/electron/src/renderer/components')

function findFiles(dir: string, files: string[] = []): string[] {
  const entries = readdirSync(dir)
  for (const entry of entries) {
    const fullPath = join(dir, entry)
    const stat = statSync(fullPath)
    if (stat.isDirectory()) {
      findFiles(fullPath, files)
    } else if (entry.endsWith('.tsx') || entry.endsWith('.ts')) {
      files.push(fullPath)
    }
  }
  return files
}

const files = findFiles(rendererDir)
let fixedCount = 0

console.log('🔧 修复导入路径...\n')

for (const file of files) {
  let content = readFileSync(file, 'utf-8')
  const original = content

  if (content.includes("from '@/i18n/index'")) {
    content = content.replace(/from '@\/i18n\/index'/g, "from '@/contexts/I18nContext'")
    writeFileSync(file, content, 'utf-8')
    console.log(`  ✓ ${file.replace(projectRoot, '')}`)
    fixedCount++
  }
}

console.log(`\n🎉 完成！已修复 ${fixedCount} 个文件`)