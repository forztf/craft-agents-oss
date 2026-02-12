/**
 * 快速 i18n 验证测试
 * 不依赖 Electron，直接验证翻译文件和组件代码
 */

import * as fs from 'fs'
import * as path from 'path'

const PROJECT_ROOT = process.cwd()
const I18N_DIR = path.join(PROJECT_ROOT, 'i18n', 'locales')

console.log('=' .repeat(60))
console.log('i18n 快速验证测试')
console.log('=' .repeat(60))

// 测试 1: 验证 JSON 文件格式
console.log('\n测试 1: JSON 文件格式验证')
console.log('-'.repeat(60))

const enDir = path.join(I18N_DIR, 'en')
const zhDir = path.join(I18N_DIR, 'zh-CN')

const getAllJsonFiles = (dir: string): string[] => {
  const files: string[] = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...getAllJsonFiles(fullPath))
    } else if (entry.name.endsWith('.json')) {
      files.push(fullPath)
    }
  }

  return files
}

const enFiles = getAllJsonFiles(enDir)
const zhFiles = getAllJsonFiles(zhDir)

console.log(`英文 JSON 文件数: ${enFiles.length}`)
console.log(`中文 JSON 文件数: ${zhFiles.length}`)

// 检查 JSON 格式
let formatErrors = 0
let validCount = 0

for (const file of [...enFiles, ...zhFiles]) {
  try {
    const content = fs.readFileSync(file, 'utf-8')

    // 检查 JSON 语法
    const parsed = JSON.parse(content)

    // 检查缩进（应为 2 空格，没有 Tab）
    if (content.includes('\t')) {
      console.log(`❌ 使用 Tab 缩进: ${path.relative(I18N_DIR, file)}`)
      formatErrors++
    }
    // 检查换行
    else if (!content.includes('\n')) {
      console.log(`❌ 没有换行符: ${path.relative(I18N_DIR, file)}`)
      formatErrors++
    }
    // 检查是否使用 4 空格缩进（除非是空对象）
    else if (content.trim() !== '{}' && /^    /m.test(content)) {
      console.log(`❌ 使用 4 空格缩进: ${path.relative(I18N_DIR, file)}`)
      formatErrors++
    } else {
      validCount++
    }
  } catch (error) {
    console.log(`❌ JSON 解析失败 ${file}: ${error}`)
    formatErrors++
  }
}

console.log(`格式检查: ✅ ${validCount} 个有效, ❌ ${formatErrors} 个无效`)

// 测试 2: 验证关键组件的翻译文件存在
console.log('\n测试 2: 关键组件翻译文件')
console.log('-'.repeat(60))

const keyComponents = [
  'en/components/info/Info_Page.json',
  'en/components/app-shell/SessionList.json',
  'en/components/ui/dialog.json',
  'en/components/ui/label-value-popover.json',
  'en/components/ui/source-status-indicator.json',
  'zh-CN/components/info/Info_Page.json',
  'zh-CN/components/app-shell/SessionList.json',
  'zh-CN/components/ui/dialog.json',
  'zh-CN/components/ui/label-value-popover.json',
  'zh-CN/components/ui/source-status-indicator.json',
]

let missingTranslations = 0

for (const comp of keyComponents) {
  const filePath = path.join(I18N_DIR, comp)
  if (fs.existsSync(filePath)) {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    const keyCount = Object.keys(content).length
    console.log(`✅ ${comp} (${keyCount} 个键)`)
  } else {
    console.log(`❌ ${comp} 不存在`)
    missingTranslations++
  }
}

// 测试 3: 验证示例 JSON 文件格式
console.log('\n测试 3: 示例 JSON 文件格式')
console.log('-'.repeat(60))

const exampleFiles = [
  'i18n/locales/zh-CN/components/app-shell/SessionList.json',
  'i18n/locales/zh-CN/components/info/Info_Page.json',
  'i18n/locales/zh-CN/components/ui/dialog.json',
]

for (const file of exampleFiles) {
  const filePath = path.join(PROJECT_ROOT, file)
  console.log(`\n📄 ${file}:`)
  console.log('--- 前 3 行 ---')
  const lines = fs.readFileSync(filePath, 'utf-8').split('\n').slice(0, 3)
  lines.forEach(line => console.log(line))
  console.log('--- 格式 ---')
  const content = fs.readFileSync(filePath, 'utf-8')
  const linesCount = content.split('\n').length
  console.log(`行数: ${linesCount}`)
  const hasTwoSpace = content.includes('  ')
  const hasTab = content.includes('\t')
  console.log(`2 空格缩进: ${hasTwoSpace ? '✅' : '❌'}`)
  console.log(`Tab 缩进: ${hasTab ? '❌' : '✅'}`)
}

// 测试摘要
console.log('\n' + '=' .repeat(60))
console.log('测试摘要')
console.log('=' .repeat(60))

const allChecksPassed = formatErrors === 0 && missingTranslations === 0

if (allChecksPassed) {
  console.log('\n✅ 所有测试通过！')
  console.log('\n验证结果:')
  console.log('  • JSON 文件格式: ✅ 正确（2 空格缩进）')
  console.log('  • 翻译文件完整性: ✅ 关键组件翻译文件存在')
  console.log('  • 总文件数: ✅ ' + (enFiles.length + zhFiles.length) + ' 个 JSON 文件')
} else {
  console.log('\n❌ 部分测试失败:')
  if (formatErrors > 0) console.log(`  • JSON 格式错误: ${formatErrors} 个`)
  if (missingTranslations > 0) console.log(`  • 缺少翻译文件: ${missingTranslations} 个`)
}

console.log('\n' + '=' .repeat(60))

process.exit(allChecksPassed ? 0 : 1)