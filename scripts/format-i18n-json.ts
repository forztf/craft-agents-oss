/**
 * 批量格式化 i18n 翻译 JSON 文件
 * 将所有单行格式的JSON文件转换为标准格式（2空格缩进、换行）
 */

import * as fs from 'fs'
import * as path from 'path'

const PROJECT_ROOT = process.cwd()
const I18N_DIR = path.join(PROJECT_ROOT, 'i18n', 'locales')

/**
 * 格式化 JSON 文件
 */
function formatJsonFile(filePath: string): boolean {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')

    // 检查是否已经是格式化的（有换行且有缩进）
    const lines = content.split('\n')
    if (lines.length > 2 && content.includes('  ')) {
      return false // 已经格式化，跳过
    }

    // 解析 JSON
    const parsed = JSON.parse(content)

    // 格式化为 2 空格缩进
    const formatted = JSON.stringify(parsed, null, 2)

    // 写回文件（确保有结尾换行符）
    fs.writeFileSync(filePath, formatted + '\n', 'utf-8')
    console.log(`✅ 已格式化: ${path.relative(PROJECT_ROOT, filePath)}`)
    return true
  } catch (error) {
    console.error(`❌ 格式化失败 ${filePath}:`, error)
    return false
  }
}

/**
 * 递归查找并格式化所有 JSON 文件
 */
function formatAllJsonFiles(dir: string): { formatted: number; skipped: number; failed: number } {
  const stats = { formatted: 0, skipped: 0, failed: 0 }

  const walk = (currentDir: string) => {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name)

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
  }

  walk(dir)
  return stats
}

/**
 * 主函数
 */
function main() {
  console.log('========================================')
  console.log('批量格式化 i18n 翻译 JSON 文件')
  console.log('========================================\n')

  if (!fs.existsSync(I18N_DIR)) {
    console.error('❌ i18n 目录不存在:', I18N_DIR)
    process.exit(1)
  }

  console.log('📂 开始扫描目录:', I18N_DIR)
  console.log()

  const stats = formatAllJsonFiles(I18N_DIR)

  console.log()
  console.log('========================================')
  console.log('格式化完成')
  console.log('========================================')
  console.log(`✅ 已格式化: ${stats.formatted} 个文件`)
  console.log(`⏭️  已跳过: ${stats.skipped} 个文件`)
  console.log(`❌ 格式化失败: ${stats.failed} 个文件`)
  console.log()
}

main()