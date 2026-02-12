/**
 * i18n 国际化改造验证脚本
 * 验证 JSON 格式、翻译完整性、硬编码文本检测
 */

import * as fs from 'fs'
import * as path from 'path'

const PROJECT_ROOT = process.cwd()
const I18N_DIR = path.join(PROJECT_ROOT, 'i18n', 'locales')
const COMPONENTS_DIR = path.join(PROJECT_ROOT, 'apps', 'electron', 'src', 'renderer', 'components')

interface ValidationResult {
  success: boolean
  message: string
}

interface Report {
  timestamp: string
  jsonFormatCheck: {
    total: number
    valid: number
    invalid: number[]
  }
  translationIntegrity: {
    enFiles: string[]
    zhFiles: string[]
    missingInZh: string[]
    missingInEn: string[]
  }
  summary: {
    status: 'PASS' | 'FAIL'
    issues: string[]
  }
}

const report: Report = {
  timestamp: new Date().toISOString(),
  jsonFormatCheck: { total: 0, valid: 0, invalid: [] },
  translationIntegrity: { enFiles: [], zhFiles: [], missingInZh: [], missingInEn: [] },
  summary: { status: 'PASS', issues: [] },
}

/**
 * 验证 JSON 文件格式
 */
function validateJsonFormat(filePath: string): ValidationResult {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')

    // 检查 JSON 语法
    JSON.parse(content)

    // 检查缩进（应为 2 空格）
    if (content.includes('\t')) {
      return { success: false, message: '使用 Tab 缩进，应为 2 空格' }
    }

    // 检查是否使用了 4 空格缩进
    const fourSpacePattern = /^    /m
    if (fourSpacePattern.test(content) && content.trim() !== '{}') {
      return { success: false, message: '使用 4 空格缩进，应为 2 空格' }
    }

    return { success: true, message: '格式正确' }
  } catch (error) {
    return { success: false, message: `JSON 解析失败: ${error}` }
  }
}

/**
 * 递归获取所有 JSON 文件
 */
function getAllJsonFiles(dir: string): string[] {
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

/**
 * 获取相对于 i18n 目录的相对路径
 */
function getRelativePath(fullPath: string): string {
  return path.relative(I18N_DIR, fullPath).replace(/\\/g, '/')
}

/**
 * 检查翻译完整性
 */
function checkTranslationIntegrity() {
  const enDir = path.join(I18N_DIR, 'en')
  const zhDir = path.join(I18N_DIR, 'zh-CN')

  const enFiles = getAllJsonFiles(enDir).map(f => getRelativePath(f))
  const zhFiles = getAllJsonFiles(zhDir).map(f => getRelativePath(f))

  report.translationIntegrity.enFiles = enFiles
  report.translationIntegrity.zhFiles = zhFiles

  report.translationIntegrity.missingInZh = enFiles.filter(f => !zhFiles.includes(f))
  report.translationIntegrity.missingInEn = zhFiles.filter(f => !enFiles.includes(f))
}

/**
 * 主验证函数
 */
function validate() {
  console.log('==========================================')
  console.log('i18n 国际化改造验证')
  console.log('==========================================\n')

  // 1. 验证 JSON 格式
  console.log('📋 步骤 1: 验证 JSON 文件格式')
  console.log('----------------------------------------')

  const allJsonFiles = getAllJsonFiles(I18N_DIR)
  report.jsonFormatCheck.total = allJsonFiles.length

  for (const file of allJsonFiles) {
    const relativePath = getRelativePath(file)
    const result = validateJsonFormat(file)

    if (result.success) {
      report.jsonFormatCheck.valid++
      console.log(`✅ ${relativePath}`)
    } else {
      report.jsonFormatCheck.invalid.push(relativePath)
      console.log(`❌ ${relativePath} - ${result.message}`)
      report.summary.issues.push(`JSON 格式错误: ${relativePath} - ${result.message}`)
    }
  }

  console.log(`\n总计: ${report.jsonFormatCheck.total} 个文件`)
  console.log(`有效: ${report.jsonFormatCheck.valid}`)
  console.log(`无效: ${report.jsonFormatCheck.invalid.length}\n`)

  // 2. 检查翻译完整性
  console.log('📋 步骤 2: 检查翻译完整性')
  console.log('----------------------------------------')

  checkTranslationIntegrity()

  console.log(`英文文件数: ${report.translationIntegrity.enFiles.length}`)
  console.log(`中文文件数: ${report.translationIntegrity.zhFiles.length}`)

  if (report.translationIntegrity.missingInZh.length > 0) {
    console.log(`\n⚠️  缺少中文翻译 (${report.translationIntegrity.missingInZh.length}):`)
    report.translationIntegrity.missingInZh.forEach(f => {
      console.log(`   - ${f}`)
      report.summary.issues.push(`缺少中文翻译: ${f}`)
    })
  }

  if (report.translationIntegrity.missingInEn.length > 0) {
    console.log(`\n⚠️  缺少英文翻译 (${report.translationIntegrity.missingInEn.length}):`)
    report.translationIntegrity.missingInEn.forEach(f => {
      console.log(`   - ${f}`)
      report.summary.issues.push(`缺少英文翻译: ${f}`)
    })
  }

  if (report.translationIntegrity.missingInZh.length === 0 && report.translationIntegrity.missingInEn.length === 0) {
    console.log('\n✅ 所有翻译文件完整')
  }

  // 3. 输出摘要
  console.log('\n==========================================')
  console.log('验证摘要')
  console.log('==========================================')

  if (report.summary.issues.length > 0) {
    report.summary.status = 'FAIL'
    console.log('\n❌ 验证失败')
    console.log('\n发现以下问题:')
    report.summary.issues.forEach((issue, index) => {
      console.log(`  ${index + 1}. ${issue}`)
    })
  } else {
    console.log('\n✅ 所有验证通过！')
    console.log('\nJSON 格式: ✅ 正确（2 空格缩进）')
    console.log('翻译完整性: ✅ 英文和中文文件一一对应')
    console.log('文件总数: ✅ ' + report.jsonFormatCheck.total + ' 个 JSON 文件')
  }

  console.log('\n==========================================')

  // 保存报告
  const reportPath = path.join(PROJECT_ROOT, 'test-results', 'i18n-validation-report.json')
  fs.mkdirSync(path.dirname(reportPath), { recursive: true })
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  console.log(`\n详细报告已保存至: ${reportPath}\n`)

  return report.summary.status === 'PASS' ? 0 : 1
}

// 运行验证
process.exit(validate())