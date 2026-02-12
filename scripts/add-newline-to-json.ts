/**
 * 为所有 JSON 文件添加结尾换行符
 */

import * as fs from 'fs'
import * as path from 'path'

const PROJECT_ROOT = process.cwd()
const I18N_DIR = path.join(PROJECT_ROOT, 'i18n', 'locales')

function addTrailingNewline(filePath: string): boolean {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')

    // 检查是否已有结尾换行符
    if (content.endsWith('\n')) {
      return false // 已有结尾换行符，跳过
    }

    // 添加结尾换行符
    fs.writeFileSync(filePath, content + '\n', 'utf-8')
    console.log(`✅ 已添加换行符: ${path.relative(PROJECT_ROOT, filePath)}`)
    return true
  } catch (error) {
    console.error(`❌ 处理失败 ${filePath}:`, error)
    return false
  }
}

function walk(dir: string): { modified: number; skipped: number } {
  const stats = { modified: 0, skipped: 0 }
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(fullPath)
    } else if (entry.name.endsWith('.json')) {
      if (addTrailingNewline(fullPath)) {
        stats.modified++
      } else {
        stats.skipped++
      }
    }
  }

  return stats
}

console.log('========================================')
console.log('为 JSON 文件添加结尾换行符')
console.log('========================================\n')

const stats = walk(I18N_DIR)

console.log()
console.log('========================================')
console.log('完成')
console.log('========================================')
console.log(`✅ 已修改: ${stats.modified} 个文件`)
console.log(`⏭️  已跳过: ${stats.skipped} 个文件`)
console.log()