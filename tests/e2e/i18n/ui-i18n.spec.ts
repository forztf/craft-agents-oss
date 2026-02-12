/**
 * Playwright UI 区域 i18n 自动化测试套件
 *
 * 专门测试 components/ui 区域的国际化改造：
 * 1. 验证所有UI组件翻译文件的格式规范（2空格缩进、换行）
 * 2. 检查翻译键的完整性（英文和中文对应）
 * 3. 测试已改造组件的翻译质量
 * 4. JSON 文件的语法和结构验证
 *
 * 用法：
 *   bun run test:e2e ui-i18n.spec.ts  - 运行 UI 区域 i18n 测试
 */

import { test, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

// 测试报告数据结构
interface UITranslationTestReport {
  timestamp: string
  summary: {
    totalFiles: number
    formatIssues: number
    missingTranslations: number
    translationQualityIssues: number
  }
  findings: {
    formatErrors: Array<{
      file: string
      issue: string
      severity: 'error' | 'warning'
    }>
    missingKeys: Array<{
      component: string
      enMissing: string[]
      zhMissing: string[]
    }>
    qualityChecks: Array<{
      component: string
      check: string
      result: 'pass' | 'fail' | 'warning'
      details: string
    }>
  }
}

// 全局测试报告
const testReport: UITranslationTestReport = {
  timestamp: new Date().toISOString(),
  summary: {
    totalFiles: 0,
    formatIssues: 0,
    missingTranslations: 0,
    translationQualityIssues: 0,
  },
  findings: {
    formatErrors: [],
    missingKeys: [],
    qualityChecks: [],
  },
}

// UI 区域的根路径
const PROJECT_ROOT = path.resolve(__dirname, '..', '..')
const UI_COMPONENTS_PATH = path.join(PROJECT_ROOT, 'apps', 'electron', 'src', 'renderer', 'components', 'ui')
const LOCALES_PATH = path.join(PROJECT_ROOT, 'i18n', 'locales')

/**
 * 验证 JSON 文件格式
 * 检查：2空格缩进、换行、尾随空格
 */
function validateJsonFormat(filePath: string): Array<{ issue: string; severity: 'error' | 'warning' }> {
  const issues: Array<{ issue: string; severity: 'error' | 'warning' }> = []

  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const lines = content.split('\n')

    // 检查 UTF-8 BOM
    if (content.charCodeAt(0) === 0xFEFF) {
      issues.push({ issue: '文件包含 UTF-8 BOM，应删除', severity: 'warning' })
    }

    // 检查尾随空格
    const trailingSpaceLines: number[] = []
    lines.forEach((line, index) => {
      // 跳过最后一行（如果是空行）
      if (index === lines.length - 1 && !line) return

      if (line !== line.trimEnd() && line.trim()) {
        trailingSpaceLines.push(index + 1)
      }
    })
    if (trailingSpaceLines.length > 0 && trailingSpaceLines.length <= 3) {
      issues.push({
        issue: `第 ${trailingSpaceLines.join(', ')} 行有尾随空格`,
        severity: 'warning',
      })
    } else if (trailingSpaceLines.length > 3) {
      issues.push({
        issue: `有 ${trailingSpaceLines.length} 行包含尾随空格`,
        severity: 'warning',
      })
    }

    // 检查缩进（应该使用 2 个空格）
    const indentErrors: number[] = []
    lines.forEach((line, index) => {
      // 跳过空行和纯文本行（JSON 键值）
      if (!line.trim()) return

      const leadingSpace = line.search(/\S/)
      if (leadingSpace > 0) {
        // 检查是否为 2 个空格的倍数
        if (leadingSpace % 2 !== 0) {
          indentErrors.push(index + 1)
        }
        // 检查是否使用了 Tab
        if (line.substring(0, leadingSpace).includes('\t')) {
          indentErrors.push(index + 1)
        }
      }
    })
    if (indentErrors.length > 0 && indentErrors.length <= 3) {
      issues.push({
        issue: `第 ${indentErrors.join(', ')} 行缩进不正确（应使用 2 空格）`,
        severity: 'error',
      })
    } else if (indentErrors.length > 3) {
      issues.push({
        issue: `有 ${indentErrors.length} 行缩进不正确（应使用 2 空格）`,
        severity: 'error',
      })
    }

    // 检查换行（文件应该以换行符结尾）
    if (content && !content.endsWith('\n')) {
      issues.push({ issue: '文件末尾缺少换行符', severity: 'warning' })
    }

    // 检查空行过多（连续超过 2 个空行）
    let consecutiveEmptyLines = 0
    for (let i = 0; i < lines.length; i++) {
      if (!lines[i].trim()) {
        consecutiveEmptyLines++
      } else {
        consecutiveEmptyLines = 0
      }
      if (consecutiveEmptyLines > 2) {
        issues.push({
          issue: `第 ${i + 1} 附近有过多空行（连续超过 2 个）`,
          severity: 'warning',
        })
        break
      }
    }

    // 尝试解析 JSON，验证语法
    try {
      JSON.parse(content)
    } catch (e) {
      issues.push({
        issue: `JSON 语法错误: ${e instanceof Error ? e.message : String(e)}`,
        severity: 'error',
      })
    }
  } catch (error) {
    issues.push({
      issue: `文件读取失败: ${error instanceof Error ? error.message : String(error)}`,
      severity: 'error',
    })
  }

  return issues
}

/**
 * 检查翻译键的完整性
 */
function checkTranslationKeyIntegrity(
  enFilePath: string,
  zhFilePath: string,
  component: string
): { enMissing: string[]; zhMissing: string[]; mismatchedKeys: string[] } {
  const result = {
    enMissing: [] as string[],
    zhMissing: [] as string[],
    mismatchedKeys: [] as string[],
  }

  try {
    const enContent = JSON.parse(fs.readFileSync(enFilePath, 'utf-8'))
    const zhContent = JSON.parse(fs.readFileSync(zhFilePath, 'utf-8'))

    const enKeys = Object.keys(enContent)
    const zhKeys = Object.keys(zhContent)

    // 检查英文有但中文没有的键
    result.enMissing = enKeys.filter(k => !zhKeys.includes(k))

    // 检查中文有但英文没有的键
    result.zhMissing = zhKeys.filter(k => !enKeys.includes(k))

    // 检查值类型是否匹配
    enKeys.forEach(key => {
      if (zhKeys.includes(key)) {
        const enValue = enContent[key]
        const zhValue = zhContent[key]
        const enType = typeof enValue
        const zhType = typeof zhValue

        if (enType !== zhType) {
          result.mismatchedKeys.push(
            `${key}: en=${enType}, zh=${zhType}`
          )
        }
      }
    })
  } catch (error) {
    // JSON 解析错误已在格式检查中报告
  }

  return result
}

/**
 * 检查翻译质量
 */
function checkTranslationQuality(
  enFilePath: string,
  zhFilePath: string,
  component: string
): Array<{ check: string; result: 'pass' | 'fail' | 'warning'; details: string }> {
  const qualityResults: Array<{ check: string; result: 'pass' | 'fail' | 'warning'; details: string }> = []

  try {
    const enContent = JSON.parse(fs.readFileSync(enFilePath, 'utf-8'))
    const zhContent = JSON.parse(fs.readFileSync(zhFilePath, 'utf-8'))

    const enKeys = Object.keys(enContent)

    // 检查 1: 翻译值不应为空
    const emptyTranslations = zhKeys.filter(k => !zhContent[k] || zhContent[k].trim() === '')
    if (emptyTranslations.length > 0) {
      qualityResults.push({
        check: '非空翻译',
        result: 'fail',
        details: `${emptyTranslations.length} 个键的翻译值为空: ${emptyTranslations.slice(0, 3).join(', ')}${emptyTranslations.length > 3 ? '...' : ''}`,
      })
    } else {
      qualityResults.push({
        check: '非空翻译',
        result: 'pass',
        details: '所有翻译值非空',
      })
    }

    // 检查 2: 中文翻译不应与英文完全相同
    const identicalTranslations = enKeys.filter(
      k => zhContent[k] === enContent[k] && enContent[k].length > 2
    )
    if (identicalTranslations.length > 0) {
      qualityResults.push({
        check: '翻译差异化',
        result: 'warning',
        details: `${identicalTranslations.length} 个键的中文翻译与英文相同: ${identicalTranslations.slice(0, 3).join(', ')}${identicalTranslations.length > 3 ? '...' : ''}`,
      })
    } else {
      qualityResults.push({
        check: '翻译差异化',
        result: 'pass',
        details: '中文翻译与英文有差异',
      })
    }

    // 检查 3: 中文翻译应包含中文字符
    const nonChineseTranslations = enKeys.filter(
      k => !/[\u4e00-\u9fa5]/.test(zhContent[k]) && enContent[k].length > 2
    )
    if (nonChineseTranslations.length > 0) {
      qualityResults.push({
        check: '中文字符',
        result: 'warning',
        details: `${nonChineseTranslations.length} 个键的翻译不包含中文字符: ${nonChineseTranslations.slice(0, 3).join(', ')}${nonChineseTranslations.length > 3 ? '...' : ''}`,
      })
    } else {
      qualityResults.push({
        check: '中文字符',
        result: 'pass',
        details: '所有翻译包含中文字符',
      })
    }

    // 检查 4: 占位符一致性
    const placeholderMismatch = enKeys.filter(k => {
      const enTemplate = enContent[k]
      const zhTemplate = zhContent[k]

      if (typeof enTemplate !== 'string' || typeof zhTemplate !== 'string') {
        return false
      }

      // 提取占位符模式：{{name}}, {name}, %s, %d 等
      const enPlaceholders = (enTemplate.match(/\{[^}]+\}|%[sd]/g) || []).sort()
      const zhPlaceholders = (zhTemplate.match(/\{[^}]+\}|%[sd]/g) || []).sort()

      return JSON.stringify(enPlaceholders) !== JSON.stringify(zhPlaceholders)
    })
    if (placeholderMismatch.length > 0) {
      qualityResults.push({
        check: '占位符一致性',
        result: 'fail',
        details: `${placeholderMismatch.length} 个键的占位符不匹配: ${placeholderMismatch.slice(0, 3).join(', ')}${placeholderMismatch.length > 3 ? '...' : ''}`,
      })
    } else {
      qualityResults.push({
        check: '占位符一致性',
        result: 'pass',
        details: '所有占位符匹配',
      })
    }
  } catch (error) {
    // JSON 解析错误已在格式检查中报告
  }

  return qualityResults
}

test.describe('UI 区域 i18n 自动化测试套件', () => {
  test.beforeAll(async () => {
    console.log('\n' + '='.repeat(70))
    console.log('UI 区域 i18n 自动化测试开始')
    console.log('='.repeat(70))
  })

  test.afterAll(() => {
    // 保存测试报告
    const reportPath = path.join(PROJECT_ROOT, 'test-results', 'ui-i18n-report.json')
    fs.mkdirSync(path.dirname(reportPath), { recursive: true })

    fs.writeFileSync(reportPath, JSON.stringify(testReport, null, 2))

    console.log('\n' + '='.repeat(70))
    console.log('测试完成，报告已生成')
    console.log(`报告路径: ${reportPath}`)
    console.log('='.repeat(70))
  })

  test.describe('JSON 文件格式验证', () => {
    let uiTranslationFiles: { en: string[]; zh: string[] }

    test.beforeAll(() => {
      const enUiPath = path.join(LOCALES_PATH, 'en', 'components', 'ui')
      const zhUiPath = path.join(LOCALES_PATH, 'zh-CN', 'components', 'ui')

      const jsonFiles = (dir: string): string[] => {
        if (!fs.existsSync(dir)) return []
        const files = fs.readdirSync(dir, { withFileTypes: true })
        return files
          .filter(f => f.isFile() && f.name.endsWith('.json'))
          .map(f => f.name)
      }

      uiTranslationFiles = {
        en: jsonFiles(enUiPath),
        zh: jsonFiles(zhUiPath),
      }

      testReport.summary.totalFiles = Math.max(uiTranslationFiles.en.length, uiTranslationFiles.zh.length)

      console.log(`\n📊 找到 ${uiTranslationFiles.en.length} 个英文翻译文件`)
      console.log(`📊 找到 ${uiTranslationFiles.zh.length} 个中文翻译文件`)
    })

    test('英文翻译文件格式应该规范', () => {
      const enUiPath = path.join(LOCALES_PATH, 'en', 'components', 'ui')

      uiTranslationFiles.en.forEach(file => {
        const filePath = path.join(enUiPath, file)
        const issues = validateJsonFormat(filePath)

        if (issues.length > 0) {
          issues.forEach(issue => {
            testReport.findings.formatErrors.push({
              file: path.relative(PROJECT_ROOT, filePath),
              ...issue,
            })
            if (issue.severity === 'error') {
              testReport.summary.formatIssues++
            }
          })
        }
      })

      // 输出格式错误
      const errors = testReport.findings.formatErrors.filter(e => e.severity === 'error')
      const warnings = testReport.findings.formatErrors.filter(e => e.severity === 'warning')

      if (errors.length > 0) {
        console.log(`\n❌ 发现 ${errors.length} 个格式错误:`)
        errors.slice(0, 10).forEach(err => {
          console.log(`   ${path.basename(err.file)}: ${err.issue}`)
        })
        if (errors.length > 10) {
          console.log(`   ... 还有 ${errors.length - 10} 个`)
        }
      }

      if (warnings.length > 0) {
        console.log(`\n⚠️  发现 ${warnings.length} 个格式警告:`)
        warnings.slice(0, 10).forEach(warn => {
          console.log(`   ${path.basename(warn.file)}: ${warn.issue}`)
        })
        if (warnings.length > 10) {
          console.log(`   ... 还有 ${warnings.length - 10} 个`)
        }
      }

      if (errors.length === 0 && warnings.length === 0) {
        console.log('\n✅ 所有文件格式规范')
      }

      // 在 CI 环境中，格式错误会导致测试失败
      if (process.env.CI && errors.length > 0) {
        expect(errors.length, `发现 ${errors.length} 个格式错误`).toBe(0)
      }
    })

    test('中文翻译文件格式应该规范', () => {
      const zhUiPath = path.join(LOCALES_PATH, 'zh-CN', 'components', 'ui')

      uiTranslationFiles.zh.forEach(file => {
        const filePath = path.join(zhUiPath, file)
        const issues = validateJsonFormat(filePath)

        if (issues.length > 0) {
          issues.forEach(issue => {
            testReport.findings.formatErrors.push({
              file: path.relative(PROJECT_ROOT, filePath),
              ...issue,
            })
            if (issue.severity === 'error') {
              testReport.summary.formatIssues++
            }
          })
        }
      })

      // 输出格式错误（如果之前未输出）
      const errors = testReport.findings.formatErrors.filter(e =>
        e.file.includes('zh-CN') && e.severity === 'error'
      )
      const warnings = testReport.findings.formatErrors.filter(e =>
        e.file.includes('zh-CN') && e.severity === 'warning'
      )

      if (errors.length > 0) {
        console.log(`\n❌ 中文文件发现 ${errors.length} 个格式错误:`)
        errors.slice(0, 10).forEach(err => {
          console.log(`   ${path.basename(err.file)}: ${err.issue}`)
        })
        if (errors.length > 10) {
          console.log(`   ... 还有 ${errors.length - 10} 个`)
        }
      }

      if (warnings.length > 0) {
        console.log(`\n⚠️  中文文件发现 ${warnings.length} 个格式警告:`)
        warnings.slice(0, 10).forEach(warn => {
          console.log(`   ${path.basename(warn.file)}: ${warn.issue}`)
        })
        if (warnings.length > 10) {
          console.log(`   ... 还有 ${warnings.length - 10} 个`)
        }
      }

      // 在 CI 环境中，格式错误会导致测试失败
      if (process.env.CI && errors.length > 0) {
        expect(errors.length, `发现 ${errors.length} 个格式错误`).toBe(0)
      }
    })
  })

  test.describe('翻译键完整性检查', () => {
    let componentFiles: string[]

    test.beforeAll(() => {
      const enUiPath = path.join(LOCALES_PATH, 'en', 'components', 'ui')
      componentFiles = fs.readdirSync(enUiPath, { withFileTypes: true })
        .filter(f => f.isFile() && f.name.endsWith('.json'))
        .map(f => f.name)
    })

    test('英文和中文翻译文件的键应该一一对应', () => {
      const enUiPath = path.join(LOCALES_PATH, 'en', 'components', 'ui')
      const zhUiPath = path.join(LOCALES_PATH, 'zh-CN', 'components', 'ui')

      componentFiles.forEach(file => {
        const enFilePath = path.join(enUiPath, file)
        const zhFilePath = path.join(zhUiPath, file)

        if (!fs.existsSync(zhFilePath)) {
          console.log(`\n⚠️  缺少中文翻译文件: ${file}`)
          testReport.findings.missingKeys.push({
            component: file,
            enMissing: [],
            zhMissing: ['<file missing>'],
          })
          testReport.summary.missingTranslations++
          return
        }

        const integrity = checkTranslationKeyIntegrity(enFilePath, zhFilePath, file)

        if (integrity.enMissing.length > 0 || integrity.zhMissing.length > 0) {
          testReport.findings.missingKeys.push(integrity)
          testReport.summary.missingTranslations += integrity.enMissing.length + integrity.zhMissing.length

          console.log(`\n📄 ${file}`)
          if (integrity.enMissing.length > 0) {
            console.log(`   中文缺少 ${integrity.enMissing.length} 个键:`)
            integrity.enMissing.slice(0, 5).forEach(k => console.log(`   - ${k}`))
            if (integrity.enMissing.length > 5) {
              console.log(`   ... 还有 ${integrity.enMissing.length - 5} 个`)
            }
          }
          if (integrity.zhMissing.length > 0) {
            console.log(`   英文缺少 ${integrity.zhMissing.length} 个键:`)
            integrity.zhMissing.slice(0, 5).forEach(k => console.log(`   - ${k}`))
            if (integrity.zhMissing.length > 5) {
              console.log(`   ... 还有 ${integrity.zhMissing.length - 5} 个`)
            }
          }
          if (integrity.mismatchedKeys.length > 0) {
            console.log(`   值类型不匹配:`)
            integrity.mismatchedKeys.slice(0, 5).forEach(k => console.log(`   - ${k}`))
            if (integrity.mismatchedKeys.length > 5) {
              console.log(`   ... 还有 ${integrity.mismatchedKeys.length - 5} 个`)
            }
          }
        }
      })

      // 计算统计
      const componentsWithIssues = testReport.findings.missingKeys.length
      if (componentsWithIssues === 0) {
        console.log('\n✅ 所有组件翻译键完整')
      } else {
        console.log(`\n⚠️  ${componentsWithIssues} 个组件存在翻译键问题`)
      }

      // 在 CI 环境中，缺少的键会导致测试失败
      if (process.env.CI) {
        const totalMissing = testReport.summary.missingTranslations
        expect(totalMissing, `缺少 ${totalMissing} 个翻译键`).toBe(0)
      }
    })
  })

  test.describe('翻译质量检查', () => {
    let componentFiles: string[]

    test.beforeAll(() => {
      const enUiPath = path.join(LOCALES_PATH, 'en', 'components', 'ui')
      componentFiles = fs.readdirSync(enUiPath, { withFileTypes: true })
        .filter(f => f.isFile() && f.name.endsWith('.json'))
        .map(f => f.name)
    })

    test('翻译质量应该符合规范', () => {
      const enUiPath = path.join(LOCALES_PATH, 'en', 'components', 'ui')
      const zhUiPath = path.join(LOCALES_PATH, 'zh-CN', 'components', 'ui')

      componentFiles.forEach(file => {
        const enFilePath = path.join(enUiPath, file)
        const zhFilePath = path.join(zhUiPath, file)

        if (!fs.existsSync(zhFilePath)) {
          return
        }

        const qualityResults = checkTranslationQuality(enFilePath, zhFilePath, file)

        qualityResults.forEach(qr => {
          testReport.findings.qualityChecks.push({
            component: file,
            ...qr,
          })

          if (qr.result === 'fail') {
            testReport.summary.translationQualityIssues++
          }
        })
      })

      // 输出质量检查结果
      const failedChecks = testReport.findings.qualityChecks.filter(qc => qc.result === 'fail')
      const warningChecks = testReport.findings.qualityChecks.filter(qc => qc.result === 'warning')

      if (failedChecks.length > 0) {
        console.log(`\n❌ ${failedChecks.length} 个质量检查失败:`)
        failedChecks.slice(0, 10).forEach(fail => {
          console.log(`   ${fail.component} - ${fail.check}: ${fail.details}`)
        })
        if (failedChecks.length > 10) {
          console.log(`   ... 还有 ${failedChecks.length - 10} 个`)
        }
      }

      if (warningChecks.length > 0) {
        console.log(`\n⚠️  ${warningChecks.length} 个质量检查警告:`)
        warningChecks.slice(0, 10).forEach(warn => {
          console.log(`   ${warn.component} - ${warn.check}: ${warn.details}`)
        })
        if (warningChecks.length > 10) {
          console.log(`   ... 还有 ${warningChecks.length - 10} 个`)
        }
      }

      if (failedChecks.length === 0 && warningChecks.length === 0) {
        console.log('\n✅ 所有翻译质量检查通过')
      } else {
        console.log(`\n📊 质量检查: ${testReport.findings.qualityChecks.length} 项检查`)
        console.log(`   通过: ${testReport.findings.qualityChecks.filter(qc => qc.result === 'pass').length}`)
        console.log(`   失败: ${failedChecks.length}`)
        console.log(`   警告: ${warningChecks.length}`)
      }

      // 在 CI 环境中，失败的质量检查会导致测试失败
      if (process.env.CI && failedChecks.length > 0) {
        expect(failedChecks.length, `${failedChecks.length} 个质量检查失败`).toBe(0)
      }
    })
  })

  test.describe('已改造组件的特定检查', () => {
    test('label-value-popover 组件翻译应该完整', () => {
      const enFile = path.join(LOCALES_PATH, 'en', 'components', 'ui', 'label-value-popover.json')
      const zhFile = path.join(LOCALES_PATH, 'zh-CN', 'components', 'ui', 'label-value-popover.json')

      expect(fs.existsSync(enFile), '英文翻译文件不存在').toBeTruthy()
      expect(fs.existsSync(zhFile), '中文翻译文件不存在').toBeTruthy()

      const enContent = JSON.parse(fs.readFileSync(enFile, 'utf-8'))
      const zhContent = JSON.parse(fs.readFileSync(zhFile, 'utf-8'))

      console.log(`\n📄 label-value-popover.json`)
      console.log(`   英文键数: ${Object.keys(enContent).length}`)
      console.log(`   中文键数: ${Object.keys(zhContent).length}`)

      // 验证特定键存在
      const requiredKeys = ['Remove', 'Select date', 'Enter number...', 'Enter value...']
      requiredKeys.forEach(key => {
        expect(enContent[key], `英文缺少键: ${key}`).toBeDefined()
        expect(zhContent[key], `中文缺少键: ${key}`).toBeDefined()
      })

      // 验证中文翻译包含中文字符
      Object.values(zhContent).forEach(value => {
        if (typeof value === 'string' && value.length > 2) {
          const hasChinese = /[\u4e00-\u9fa5]/.test(value)
          if (!hasChinese) {
            console.log(`   警告: "${value}" 不包含中文字符`)
          }
        }
      })

      console.log('   ✅ label-value-popover 组件检查通过')
    })

    test('source-status-indicator 组件翻译应该完整', () => {
      const enFile = path.join(LOCALES_PATH, 'en', 'components', 'ui', 'source-status-indicator.json')
      const zhFile = path.join(LOCALES_PATH, 'zh-CN', 'components', 'ui', 'source-status-indicator.json')

      expect(fs.existsSync(enFile), '英文翻译文件不存在').toBeTruthy()
      expect(fs.existsSync(zhFile), '中文翻译文件不存在').toBeTruthy()

      const enContent = JSON.parse(fs.readFileSync(enFile, 'utf-8'))
      const zhContent = JSON.parse(fs.readFileSync(zhFile, 'utf-8'))

      console.log(`\n📄 source-status-indicator.json`)
      console.log(`   英文键数: ${Object.keys(enContent).length}`)
      console.log(`   中文键数: ${Object.keys(zhContent).length}`)

      // 验证特定键存在（状态相关的键）
      const statusKeys = [
        'Connected',
        'Needs Authentication',
        'Connection Failed',
        'Not Tested',
        'Disabled',
      ]
      statusKeys.forEach(key => {
        expect(enContent[key], `英文缺少键: ${key}`).toBeDefined()
        expect(zhContent[key], `中文缺少键: ${key}`).toBeDefined()
      })

      console.log('   ✅ source-status-indicator 组件检查通过')
    })

    test('Dialog 组件应该包含必要的翻译键', () => {
      const enFile = path.join(LOCALES_PATH, 'en', 'components', 'ui', 'dialog.json')
      const zhFile = path.join(LOCALES_PATH, 'zh-CN', 'components', 'ui', 'dialog.json')

      if (!fs.existsSync(enFile) || !fs.existsSync(zhFile)) {
        console.log('\n⚠️  Dialog 组件翻译文件不存在')
        test.skip()
        return
      }

      const enContent = JSON.parse(fs.readFileSync(enFile, 'utf-8'))
      const zhContent = JSON.parse(fs.readFileSync(zhFile, 'utf-8'))

      console.log(`\n📄 dialog.json`)
      console.log(`   英文键数: ${Object.keys(enContent).length}`)
      console.log(`   中文键数: ${Object.keys(zhContent).length}`)

      // 验证必要的键存在
      const expectedKeys = ['Close']
      expectedKeys.forEach(key => {
        expect(enContent[key], `英文缺少键: ${key}`).toBeDefined()
        expect(zhContent[key], `中文缺少键: ${key}`).toBeDefined()
      })

      console.log('   ✅ Dialog 组件检查通过')
    })

    test('slash-command-menu 组件翻译应该完整', () => {
      const enFile = path.join(LOCALES_PATH, 'en', 'components', 'ui', 'slash-command-menu.json')
      const zhFile = path.join(LOCALES_PATH, 'zh-CN', 'components', 'ui', 'slash-command-menu.json')

      expect(fs.existsSync(enFile), '英文翻译文件不存在').toBeTruthy()
      expect(fs.existsSync(zhFile), '中文翻译文件不存在').toBeTruthy()

      const enContent = JSON.parse(fs.readFileSync(enFile, 'utf-8'))
      const zhContent = JSON.parse(fs.readFileSync(zhFile, 'utf-8'))

      console.log(`\n📄 slash-command-menu.json`)
      console.log(`   英文键数: ${Object.keys(enContent).length}`)
      console.log(`   中文键数: ${Object.keys(zhContent).length}`)

      // 验证特定键存在
      const expectedKeys = [
        'Search commands...',
        'No commands found',
        'Use @ for skills and files',
      ]
      expectedKeys.forEach(key => {
        expect(enContent[key], `英文缺少键: ${key}`).toBeDefined()
        expect(zhContent[key], `中文缺少键: ${key}`).toBeDefined()
      })

      console.log('   ✅ slash-command-menu 组件检查通过')
    })
  })

  test.describe('测试总结', () => {
    test('输出 UI 区域 i18n 测试摘要', () => {
      console.log('\n' + '='.repeat(70))
      console.log('UI 区域 i18n 自动化测试摘要')
      console.log('='.repeat(70))

      console.log(`\n📊 文件统计:`)
      console.log(`   总文件数: ${testReport.summary.totalFiles}`)
      console.log(`   格式问题: ${testReport.summary.formatIssues}`)
      console.log(`   缺少翻译: ${testReport.summary.missingTranslations}`)
      console.log(`   质量问题: ${testReport.summary.translationQualityIssues}`)

      console.log(`\n🔍 详细发现:`)

      if (testReport.findings.formatErrors.length > 0) {
        const errors = testReport.findings.formatErrors.filter(e => e.severity === 'error').length
        const warnings = testReport.findings.formatErrors.filter(e => e.severity === 'warning').length
        console.log(`   格式错误: ${errors}`)
        console.log(`   格式警告: ${warnings}`)
      }

      if (testReport.findings.missingKeys.length > 0) {
        console.log(`   有问题的组件: ${testReport.findings.missingKeys.length}`)
      }

      if (testReport.findings.qualityChecks.length > 0) {
        const passed = testReport.findings.qualityChecks.filter(qc => qc.result === 'pass').length
        const failed = testReport.findings.qualityChecks.filter(qc => qc.result === 'fail').length
        const warnings = testReport.findings.qualityChecks.filter(qc => qc.result === 'warning').length
        console.log(`   质量检查: 通过 ${passed}, 失败 ${failed}, 警告 ${warnings}`)
      }

      // 测试建议
      console.log(`\n💡 测试建议:`)

      if (testReport.summary.formatIssues === 0 &&
          testReport.summary.missingTranslations === 0 &&
          testReport.summary.translationQualityIssues === 0) {
        console.log(`   ✅ 所有测试通过，UI 区域 i18n 状态良好`)
      } else {
        if (testReport.summary.formatIssues > 0) {
          console.log(`   ⚠️  请修复 ${testReport.summary.formatIssues} 个格式问题`)
        }
        if (testReport.summary.missingTranslations > 0) {
          console.log(`   ⚠️  请补充 ${testReport.summary.missingTranslations} 个缺失的翻译`)
        }
        if (testReport.summary.translationQualityIssues > 0) {
          console.log(`   ⚠️  请改进 ${testReport.summary.translationQualityIssues} 个质量问题`)
        }
      }

      console.log('='.repeat(70))
    })
  })
})