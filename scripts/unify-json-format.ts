/**
 * 统一所有 JSON 文件格式规范
 * - 空 JSON: `{\n}\n` (2 行)
 * - 有内容 JSON: 2 空格缩进，每行一个键，结尾有换行符
 */

import * as fs from 'fs'
import * as path from 'path'

const PROJECT_ROOT = process.cwd()
const I18N_DIR = path.join(PROJECT_ROOT, 'i18n', 'locales')

function formatJsonFile(filePath: string): boolean {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')

    // 检查文件是否为空对象且格式正确
    if (content.trim() === '{}') {
      const formatted = '{\n}\n'
      if (content !== formatted) {
        fs.writeFileSync(filePath, formatted, 'utf-8')
        console.log(`✅ 已格式化 (空对象): ${path.relative(PROJECT_ROOT, filePath)}`)
        return true
      }
      return false // 已是正确格式
    }

    // 检查是否已经是格式化的
    if (content.includes('\n') && content.includes('  ') && content.endsWith('\n')) {
      return false // 已格式化，跳过
    }

    // 解析 JSON
    const parsed = JSON.parse(content)

    // 格式化为 2 空格缩进
    const formatted = JSON.stringify(parsed, null, 2) + '\n'

    // 写回文件
    fs.writeFileSync(filePath, formatted, 'utf-8')
    console.log(`✅ 已格式化: ${path.relative(PROJECT_ROOT, filePath)}`)
    return true
  } catch (error) {
    console.error(`❌ 格式化失败 ${filePath}:`, error)
    return false
  }
}

function walk(dir: string): { formatted: number; skipped: number; failed: number } {
  const stats = { formatted: 0, skipped: 0, failed: 0 }
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(fullPath)
    } else if (entry.name.endsWith('.json')) {
      if (formatJsonFile(fullPath)) {
        stats.formatted++
      } else {
        stats.skipped++
      }
    }
  }

  return stats
}

console.log('========================================')
console.log('统一 JSON 文件格式')
console.log('========================================\n')

const stats = walk(I18N_DIR)

console.log()
console.log('========================================')
console.log('完成')
console.log('========================================')
console.log(`✅ 已格式化: ${stats.formatted} 个文件`)
console.log(`⏭️  已跳过: ${stats.skipped} 个文件`)
console.log(`❌ 格式化失败: ${stats.failed} 个文件`)
console.log()`