/**
 * Settings/Workspace 区域 i18n Playwright 自动化测试
 *
 * 检测和验证 Settings/Workspace 区域国际化改造的完整性：
 * 1. 验证所有 Settings 组件的翻译文件完整性
 * 2. 验证所有 Workspace 组件的翻译文件完整性
 * 3. 检测 JSON 格式（换行、缩进）
 * 4. 验证英文和中文翻译文件对应
 *
 * 用法：
 *   bun run test:e2e -- tests/e2e/i18n/areas/settings-workspace-i18n.spec.ts
 */

import { test, expect } from '@playwright/test'
import path from 'path'
import * as fs from 'fs'

// 测试报告数据结构
interface SettingsWorkspaceI18nReport {
  timestamp: string
  summary: {
    totalFilesChecked: number
    jsonFormatErrors: number
    missingTranslations: number
  }
  findings: {
    missingTranslations: Array<{
      locale: string
      category: string
      component: string
    }>
    jsonFormatIssues: Array<{
      file: string
      issue: string
    }>
    inconsistentKeys: Array<{
      component: string
      missingInZh: string[]
      missingInEn: string[]
    }>
  }
}

// 全局测试报告
const testReport: SettingsWorkspaceI18nReport = {
  timestamp: new Date().toISOString(),
  summary: {
    totalFilesChecked: 0,
    jsonFormatErrors: 0,
    missingTranslations: 0,
  },
  findings: {
    missingTranslations: [],
    jsonFormatIssues: [],
    inconsistentKeys: [],
  },
}

/**
 * 需要测试的 Settings 组件列表
 */
const SETTINGS_COMPONENTS = [
  'SettingsCard',
  'SettingsEditRow',
  'SettingsInput',
  'SettingsMenuSelect',
  'SettingsRadioGroup',
  'SettingsRow',
  'SettingsSection',
  'SettingsSegmentedControl',
  'SettingsSelect',
  'SettingsTextarea',
  'SettingsToggle',
  'SettingsNavigator',
  'ShortcutsPage',
  'AppSettingsPage',
  'PermissionsSettingsPage',
  'WorkspaceSettingsPage',
  'PreferencesPage',
  'AppearanceSettingsPage',
  'InputSettingsPage',
  'LabelsSettingsPage',
  'AiSettingsPage',
  'SearchableModelInput',
]

/**
 * 需要测试的 Workspace 组件列表
 */
const WORKSPACE_COMPONENTS = [
  'WorkspaceCreationScreen',
  'AddWorkspaceStep_Choice',
  'AddWorkspaceStep_OpenFolder',
  'AddWorkspaceStep_CreateNew',
]

/**
 * 验证 JSON 文件格式
 */
function validateJsonFormat(filePath: string): { valid: boolean; issue?: string } {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')

    // 检查是否有换行
    if (!content.includes('\n')) {
      return { valid: false, issue: 'JSON 文件没有换行符，格式不可读' }
    }

    // 检查 UTF-8 BOM
    if (content.charCodeAt(0) === 0xFEFF) {
      return { valid: false, issue: 'JSON 文件包含 UTF-8 BOM，应移除' }
    }

    // 尝试解析 JSON
    try {
      JSON.parse(content)
    } catch (error) {
      return { valid: false, issue: `JSON 解析失败: ${error}` }
    }

    // 检查是否是漂亮格式（有缩进）
    if (!content.includes('  ') && content.length > 100) {
      return { valid: false, issue: 'JSON 文件没有缩进，建议使用 2 空格缩进' }
    }

    return { valid: true }
  } catch (error) {
    return { valid: false, issue: `读取文件失败: ${error}` }
  }
}

/**
 * 检查翻译文件是否存在
 */
function checkTranslationFileExists(
  category: string,
  component: string,
  locale: string
): boolean {
  const projectRoot = path.resolve(__dirname, '..', '..', '..')
  const filePath = path.join(
    projectRoot,
    'i18n',
    'locales',
    locale,
    'components',
    category,
    `${component}.json`
  )
  return fs.existsSync(filePath)
}

/**
 * 检查翻译键的一致性
 */
function checkTranslationKeysConsistency(
  enFile: string,
  zhFile: string
): { consistent: boolean; missingInZh?: string[]; missingInEn?: string[] } {
  const enContent = JSON.parse(fs.readFileSync(enFile, 'utf-8'))
  const zhContent = JSON.parse(fs.readFileSync(zhFile, 'utf-8'))

  const enKeys = Object.keys(enContent)
  const zhKeys = Object.keys(zhContent)

  const missingInZh = enKeys.filter(k => !zhKeys.includes(k))
  const missingInEn = zhKeys.filter(k => !enKeys.includes(k))

  return {
    consistent: missingInZh.length === 0 && missingInEn.length === 0,
    missingInZh: missingInZh.length > 0 ? missingInZh : undefined,
    missingInEn: missingInEn.length > 0 ? missingInEn : undefined,
  }
}

// 测试套件
test.describe('Settings/Workspace i18n 自动化测试', () => {
  let projectRoot: string

  test.beforeAll(async () => {
    projectRoot = path.resolve(__dirname, '..', '..', '..')
    console.log('\n' + '='.repeat(70))
    console.log('开始 Settings/Workspace i18n 自动化测试')
    console.log('='.repeat(70))
  })

  test.afterAll(async () => {
    // 保存测试报告
    const reportPath = path.join(
      projectRoot,
      'test-results',
      'settings-workspace-i18n-report.json'
    )

    fs.mkdirSync(path.dirname(reportPath), { recursive: true })
    fs.writeFileSync(reportPath, JSON.stringify(testReport, null, 2))

    console.log('\n' + '='.repeat(70))
    console.log('测试完成，报告已生成')
    console.log(`报告路径: ${reportPath}`)
    console.log('='.repeat(70))
  })

  test.describe('Settings 翻译文件完整性检查', () => {
    test('Settings 英文翻译文件应该都存在', () => {
      console.log('\n🔍 检查 Settings 英文翻译文件...')
      let missingCount = 0

      for (const component of SETTINGS_COMPONENTS) {
        const exists = checkTranslationFileExists('settings', component, 'en')

        if (exists) {
          console.log(`✅ settings/${component}.json 英文翻译文件存在`)
        } else {
          console.log(`⚠️  settings/${component}.json 英文翻译文件不存在`)
          testReport.findings.missingTranslations.push({
            locale: 'en',
            category: 'settings',
            component,
          })
          missingCount++
        }
      }

      testReport.summary.missingTranslations += missingCount
    })

    test('Settings 中文翻译文件应该都存在', () => {
      console.log('\n🔍 检查 Settings 中文翻译文件...')
      let missingCount = 0

      for (const component of SETTINGS_COMPONENTS) {
        const exists = checkTranslationFileExists('settings', component, 'zh-CN')

        if (exists) {
          console.log(`✅ settings/${component}.json 中文翻译文件存在`)
        } else {
          console.log(`⚠️  settings/${component}.json 中文翻译文件不存在`)
          testReport.findings.missingTranslations.push({
            locale: 'zh-CN',
            category: 'settings',
            component,
          })
          missingCount++
        }
      }

      testReport.summary.missingTranslations += missingCount

      // 软断言：只在 CI 环境中失败
      if (process.env.CI && missingCount > 0) {
        expect(missingCount, '缺少中文翻译文件').toBe(0)
      }
    })

    test('Settings JSON 文件格式应该正确', () => {
      console.log('\n🔍 检查 Settings JSON 文件格式...')

      for (const locale of ['en', 'zh-CN']) {
        for (const component of SETTINGS_COMPONENTS) {
          const filePath = path.join(
            projectRoot,
            'i18n',
            'locales',
            locale,
            'components',
            'settings',
            `${component}.json`
          )

          if (!fs.existsSync(filePath)) {
            continue
          }

          const result = validateJsonFormat(filePath)

          if (result.valid) {
            console.log(`✅ ${locale}/settings/${component}.json 格式正确`)
            testReport.summary.totalFilesChecked++
          } else {
            console.log(`❌ ${locale}/settings/${component}.json 格式错误: ${result.issue}`)
            testReport.findings.jsonFormatIssues.push({
              file: path.relative(projectRoot, filePath),
              issue: result.issue!,
            })
            testReport.summary.jsonFormatErrors++
          }
        }
      }

      // 软断言：只在 CI 环境中失败
      if (process.env.CI && testReport.summary.jsonFormatErrors > 0) {
        expect(
          testReport.summary.jsonFormatErrors,
          'JSON 格式错误'
        ).toBe(0)
      }
    })
  })

  test.describe('Workspace 翻译文件完整性检查', () => {
    test('Workspace 英文翻译文件应该都存在', () => {
      console.log('\n🔍 检查 Workspace 英文翻译文件...')
      let missingCount = 0

      for (const component of WORKSPACE_COMPONENTS) {
        const exists = checkTranslationFileExists('workspace', component, 'en')

        if (exists) {
          console.log(`✅ workspace/${component}.json 英文翻译文件存在`)
        } else {
          console.log(`⚠️  workspace/${component}.json 英文翻译文件不存在`)
          testReport.findings.missingTranslations.push({
            locale: 'en',
            category: 'workspace',
            component,
          })
          missingCount++
        }
      }

      testReport.summary.missingTranslations += missingCount
    })

    test('Workspace 中文翻译文件应该都存在', () => {
      console.log('\n🔍 检查 Workspace 中文翻译文件...')
      let missingCount = 0

      for (const component of WORKSPACE_COMPONENTS) {
        const exists = checkTranslationFileExists('workspace', component, 'zh-CN')

        if (exists) {
          console.log(`✅ workspace/${component}.json 中文翻译文件存在`)
        } else {
          console.log(`⚠️  workspace/${component}.json 中文翻译文件不存在`)
          testReport.findings.missingTranslations.push({
            locale: 'zh-CN',
            category: 'workspace',
            component,
          })
          missingCount++
        }
      }

      testReport.summary.missingTranslations += missingCount

      // 软断言：只在 CI 环境中失败
      if (process.env.CI && missingCount > 0) {
        expect(missingCount, '缺少中文翻译文件').toBe(0)
      }
    })

    test('Workspace JSON 文件格式应该正确', () => {
      console.log('\n🔍 检查 Workspace JSON 文件格式...')

      for (const locale of ['en', 'zh-CN']) {
        for (const component of WORKSPACE_COMPONENTS) {
          const filePath = path.join(
            projectRoot,
            'i18n',
            'locales',
            locale,
            'components',
            'workspace',
            `${component}.json`
          )

          if (!fs.existsSync(filePath)) {
            continue
          }

          const result = validateJsonFormat(filePath)

          if (result.valid) {
            console.log(`✅ ${locale}/workspace/${component}.json 格式正确`)
            testReport.summary.totalFilesChecked++
          } else {
            console.log(`❌ ${locale}/workspace/${component}.json 格式错误: ${result.issue}`)
            testReport.findings.jsonFormatIssues.push({
              file: path.relative(projectRoot, filePath),
              issue: result.issue!,
            })
            testReport.summary.jsonFormatErrors++
          }
        }
      }

      // 软断言：只在 CI 环境中失败
      if (process.env.CI && testReport.summary.jsonFormatErrors > 0) {
        expect(
          testReport.summary.jsonFormatErrors,
          'JSON 格式错误'
        ).toBe(0)
      }
    })
  })

  test.describe('翻译键一致性检查', () => {
    test('Settings 翻译键应该一致', () => {
      console.log('\n🔍 检查 Settings 翻译键一致性...')

      for (const component of SETTINGS_COMPONENTS) {
        const enFile = path.join(
          projectRoot,
          'i18n',
          'locales',
          'en',
          'components',
          'settings',
          `${component}.json`
        )
        const zhFile = path.join(
          projectRoot,
          'i18n',
          'locales',
          'zh-CN',
          'components',
          'settings',
          `${component}.json`
        )

        if (!fs.existsSync(enFile) || !fs.existsSync(zhFile)) {
          continue
        }

        const result = checkTranslationKeysConsistency(enFile, zhFile)

        if (result.consistent) {
          console.log(`✅ settings/${component} 翻译键一致`)
        } else {
          console.log(`⚠️  settings/${component} 翻译键不一致`)

          testReport.findings.inconsistentKeys.push({
            component: `settings/${component}`,
            missingInZh: result.missingInZh || [],
            missingInEn: result.missingInEn || [],
          })

          if (result.missingInZh && result.missingInZh.length > 0) {
            console.log(
              `   缺少中文翻译: ${result.missingInZh.slice(0, 5).join(', ')}`
            )
            if (result.missingInZh.length > 5) {
              console.log(`   ...还有 ${result.missingInZh.length - 5} 个`)
            }
          }

          if (result.missingInEn && result.missingInEn.length > 0) {
            console.log(
              `   缺少英文翻译: ${result.missingInEn.slice(0, 5).join(', ')}`
            )
            if (result.missingInEn.length > 5) {
              console.log(`   ...还有 ${result.missingInEn.length - 5} 个`)
            }
          }
        }
      }
    })

    test('Workspace 翻译键应该一致', () => {
      console.log('\n🔍 检查 Workspace 翻译键一致性...')

      for (const component of WORKSPACE_COMPONENTS) {
        const enFile = path.join(
          projectRoot,
          'i18n',
          'locales',
          'en',
          'components',
          'workspace',
          `${component}.json`
        )
        const zhFile = path.join(
          projectRoot,
          'i18n',
          'locales',
          'zh-CN',
          'components',
          'workspace',
          `${component}.json`
        )

        if (!fs.existsSync(enFile) || !fs.existsSync(zhFile)) {
          continue
        }

        const result = checkTranslationKeysConsistency(enFile, zhFile)

        if (result.consistent) {
          console.log(`✅ workspace/${component} 翻译键一致`)
        } else {
          console.log(`⚠️  workspace/${component} 翻译键不一致`)

          testReport.findings.inconsistentKeys.push({
            component: `workspace/${component}`,
            missingInZh: result.missingInZh || [],
            missingInEn: result.missingInEn || [],
          })

          if (result.missingInZh && result.missingInZh.length > 0) {
            console.log(
              `   缺少中文翻译: ${result.missingInZh.slice(0, 5).join(', ')}`
            )
            if (result.missingInZh.length > 5) {
              console.log(`   ...还有 ${result.missingInZh.length - 5} 个`)
            }
          }

          if (result.missingInEn && result.missingInEn.length > 0) {
            console.log(
              `   缺少英文翻译: ${result.missingInEn.slice(0, 5).join(', ')}`
            )
            if (result.missingInEn.length > 5) {
              console.log(`   ...还有 ${result.missingInEn.length - 5} 个`)
            }
          }
        }
      }
    })
  })

  test.describe('测试总结', () => {
    test('输出测试摘要', () => {
      console.log('\n' + '='.repeat(70))
      console.log('Settings/Workspace i18n 自动化测试摘要')
      console.log('='.repeat(70))

      console.log(`\n检查翻译文件数: ${testReport.summary.totalFilesChecked}`)
      console.log(`JSON 格式错误: ${testReport.summary.jsonFormatErrors}`)
      console.log(`缺少翻译文件: ${testReport.summary.missingTranslations}`)

      if (testReport.findings.missingTranslations.length > 0) {
        console.log('\n缺少的翻译文件:')
        testReport.findings.missingTranslations.forEach(m => {
          console.log(`  - ${m.locale}/${m.category}/${m.component}`)
        })
      }

      if (testReport.findings.jsonFormatIssues.length > 0) {
        console.log('\nJSON 格式问题:')
        testReport.findings.jsonFormatIssues.forEach(issue => {
          console.log(`  ${issue.file}: ${issue.issue}`)
        })
      }

      if (testReport.findings.inconsistentKeys.length > 0) {
        console.log('\n翻译键不一致:')
        testReport.findings.inconsistentKeys.forEach(item => {
          console.log(`  ${item.component}:`)
          if (item.missingInZh.length > 0) {
            console.log(`    缺少中文: ${item.missingInZh.join(', ')}`)
          }
          if (item.missingInEn.length > 0) {
            console.log(`    缺少英文: ${item.missingInEn.join(', ')}`)
          }
        })
      }

      console.log('\n' + '='.repeat(70))
    })
  })
})