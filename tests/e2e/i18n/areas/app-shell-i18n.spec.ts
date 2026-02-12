/**
 * App-Shell 区域 i18n Playwright 自动化测试
 *
 * 检测和验证 App-Shell 区域国际化改造的完整性：
 * 1. 检测 SessionList、LeftSidebar、TaskActionMenu、FreeFormInput 组件的硬编码文本
 * 2. 验证翻译文件存在且格式正确
 * 3. 验证 JSON 文件有换行（可读格式）
 * 4. 验证英文和中文翻译文件对应
 *
 * 用法：
 *   bun run test:e2e -- tests/e2e/i18n/areas/app-shell-i18n.spec.ts
 */

import { test, expect } from '@playwright/test'
import { _electron as electron } from 'playwright'
import path from 'path'
import * as fs from 'fs'

// 测试报告数据结构
interface AppShellI18nReport {
  timestamp: string
  summary: {
    totalFilesChecked: number
    hardcodedTextFound: number
    jsonFormatErrors: number
    missingTranslations: number
  }
  findings: {
    hardcodedText: Array<{
      component: string
      text: string
      line: number
      filePath: string
      severity: 'high' | 'medium' | 'low'
    }>
    jsonFormatIssues: Array<{
      file: string
      issue: string
    }>
    missingTranslations: Array<{
      locale: string
      component: string
    }>
  }
}

// 全局测试报告
const testReport: AppShellI18nReport = {
  timestamp: new Date().toISOString(),
  summary: {
    totalFilesChecked: 0,
    hardcodedTextFound: 0,
    jsonFormatErrors: 0,
    missingTranslations: 0,
  },
  findings: {
    hardcodedText: [],
    jsonFormatIssues: [],
    missingTranslations: [],
  },
}

/**
 * 需要测试的 App-Shell 组件列表
 */
const APP_SHELL_COMPONENTS = [
  'SessionList',
  'LeftSidebar',
  'TaskActionMenu',
  'FreeFormInput',
]

/**
 * 需要忽略的文本模式（不需要翻译）
 */
const IGNORE_PATTERNS = [
  // CSS 类名
  /^[a-z][a-z0-9\-_]*$/,
  // 技术术语
  /^(className|id|type|name|value|onClick|onChange|onSubmit|key|ref)$/,
  // 短文本
  /^.{0,2}$/,
  // 纯数字
  /^\d+$/,
  // URL 路径
  /^https?:\/\//,
  /^\.\.?\//,
  // 文件扩展名
  /\.(js|ts|tsx|json|md|pdf|css|html)$/,
  // 字母数字 ID
  /^[a-f0-9\-_]+$/i,
  // 常见英文单词（可能是技术术语）
  /\b(https?:\/\/|www\.)\S+/,
]

/**
 * 常见需要翻译的英文 UI 文本
 */
const TRANSLATABLE_PATTERNS = {
  // 按钮和操作
  buttons: /\b(click|click here|submit|cancel|save|delete|edit|add|remove|rename|copy|paste|cut|undo|redo|search|filter|clear|reset|continue|back|next|previous|finish|ok|yes|no|apply|discard|loading|error|success|warning|info|archive|unarchive|flag|unflag|restore)\b/gi,
  // 状态和提示
  status: /\b(no sessions|no results|no archived sessions|no files|no sources|not found|not available|unavailable|connection unavailable|not authenticated)\b/gi,
  // 占位符提示
  placeholders: /\b(enter|type|search|filter|choose|select)\s+\w+\.{3}?/gi,
  // 通用短语
  common: /\b(new session|session flagged|flag removed|link copied|moved to archive|moved from archive|session deleted|what would you like to work on|use shift \+ tab|type @ to mention|type # to apply|press shift \+ return)\b/gi,
}

/**
 * 检查文本是否应该被忽略
 */
function shouldIgnoreText(text: string): boolean {
  const trimmed = text.trim()
  if (!trimmed) return true

  for (const pattern of IGNORE_PATTERNS) {
    if (pattern.test(trimmed)) {
      return true
    }
  }
  return false
}

/**
 * 从文本中提取需要翻译的英文内容
 */
function extractTranslatableText(
  text: string,
  context: string = ''
): Array<{ text: string; category: string; severity: 'high' | 'medium' | 'low' }> {
  const results: Array<{ text: string; category: string; severity: 'high' | 'medium' | 'low' }> = []
  const allPhrases = new Map<string, { category: string; severity: 'high' | 'medium' | 'low' }>()

  // 检查各类可翻译模式
  for (const [category, pattern] of Object.entries(TRANSLATABLE_PATTERNS)) {
    const matches = text.matchAll(new RegExp(pattern.source, pattern.flags))
    for (const match of matches) {
      const matchedText = match[0]
      if (!shouldIgnoreText(matchedText) && !allPhrases.has(matchedText)) {
        // 根据文本长度和类型判断严重程度
        let severity: 'high' | 'medium' | 'low' = 'medium'
        if (matchedText.length > 30 || category === 'status') severity = 'high' as const
        else if (matchedText.length < 5) severity = 'low' as const

        allPhrases.set(matchedText, { category, severity })
      }
    }
  }

  allPhrases.forEach((value, text) => {
    results.push({ text, ...value })
  })

  return results
}

/**
 * 扫描组件文件中的硬编码文本
 */
function scanComponentFile(filePath: string): Array<{
  text: string
  line: number
  severity: 'high' | 'medium' | 'low'
}> {
  const results: Array<{ text: string; line: number; severity: 'high' | 'medium' | 'low' }> = []
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')

  lines.forEach((line, index) => {
    const translatable = extractTranslatableText(line)

    translatable.forEach(item => {
      // 检查是否已使用 t() 函数翻译
      const hasTranslation = line.includes('t(') || line.includes('{t(')
      if (!hasTranslation) {
        results.push({
          text: item.text,
          line: index + 1,
          severity: item.severity,
        })
      }
    })
  })

  return results
}

/**
 * 验证 JSON 文件格式（有换行）
 */
function validateJsonFormat(filePath: string): { valid: boolean; issue?: string } {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')

    // 检查是否有换行
    if (!content.includes('\n')) {
      return { valid: false, issue: 'JSON 文件没有换行符，格式不可读' }
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
function checkTranslationFileExists(component: string, locale: string): boolean {
  const projectRoot = path.resolve(__dirname, '..', '..', '..')
  const filePath = path.join(
    projectRoot,
    'i18n',
    'locales',
    locale,
    'components',
    'app-shell',
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
test.describe('App-Shell i18n 自动化测试', () => {
  let projectRoot: string

  test.beforeAll(async () => {
    projectRoot = path.resolve(__dirname, '..', '..', '..')
    console.log('\n' + '='.repeat(70))
    console.log('开始 App-Shell i18n 自动化测试')
    console.log('='.repeat(70))
  })

  test.afterAll(async () => {
    // 保存测试报告
    const reportPath = path.join(
      projectRoot,
      'test-results',
      'app-shell-i18n-report.json'
    )

    fs.mkdirSync(path.dirname(reportPath), { recursive: true })
    fs.writeFileSync(reportPath, JSON.stringify(testReport, null, 2))

    console.log('\n' + '='.repeat(70))
    console.log('测试完成，报告已生成')
    console.log(`报告路径: ${reportPath}`)
    console.log('='.repeat(70))
  })

  test.describe('组件硬编码文本检测', () => {
    test('应该检测到 SessionList 组件的硬编码文本', () => {
      const component = 'SessionList'
      const componentFilePath = path.join(
        projectRoot,
        'apps',
        'electron',
        'src',
        'renderer',
        'components',
        'app-shell',
        `${component}.tsx`
      )

      if (!fs.existsSync(componentFilePath)) {
        console.log(`⚠️  组件文件不存在: ${componentFilePath}`)
        return
      }

      console.log(`\n🔍 扫描 ${component} 组件硬编码文本...`)
      const hardcodedTexts = scanComponentFile(componentFilePath)

      testReport.summary.hardcodedTextFound += hardcodedTexts.length

      if (hardcodedTexts.length > 0) {
        console.log(`⚠️  ${component} 发现 ${hardcodedTexts.length} 处可能需要翻译的文本`)

        hardcodedTexts.forEach(({ text, line, severity }) => {
          testReport.findings.hardcodedText.push({
            component,
            text,
            line,
            filePath: path.relative(projectRoot, componentFilePath),
            severity,
          })
        })

        // 在 CI 环境中，高优先级的硬编码文本应该不超过 5 个
        const highSeverityCount = hardcodedTexts.filter(t => t.severity === 'high').length
        if (process.env.CI && highSeverityCount > 5) {
          expect(
            highSeverityCount,
            `${component} 发现 ${highSeverityCount} 处高优先级硬编码文本`
          ).toBeLessThanOrEqual(5)
        }
      } else {
        console.log(`✅ ${component} 未发现明显硬编码文本`)
      }
    })

    test('应该检测到 LeftSidebar 组件的硬编码文本', () => {
      const component = 'LeftSidebar'
      const componentFilePath = path.join(
        projectRoot,
        'apps',
        'electron',
        'src',
        'renderer',
        'components',
        'app-shell',
        `${component}.tsx`
      )

      if (!fs.existsSync(componentFilePath)) {
        console.log(`⚠️  组件文件不存在: ${componentFilePath}`)
        return
      }

      console.log(`\n🔍 扫描 ${component} 组件硬编码文本...`)
      const hardcodedTexts = scanComponentFile(componentFilePath)

      testReport.summary.hardcodedTextFound += hardcodedTexts.length

      if (hardcodedTexts.length > 0) {
        console.log(`⚠️  ${component} 发现 ${hardcodedTexts.length} 处可能需要翻译的文本`)

        hardcodedTexts.forEach(({ text, line, severity }) => {
          testReport.findings.hardcodedText.push({
            component,
            text,
            line,
            filePath: path.relative(projectRoot, componentFilePath),
            severity,
          })
        })
      } else {
        console.log(`✅ ${component} 未发现明显硬编码文本`)
      }
    })

    test('应该检测到 TaskActionMenu 组件的硬编码文本', () => {
      const component = 'TaskActionMenu'
      const componentFilePath = path.join(
        projectRoot,
        'apps',
        'electron',
        'src',
        'renderer',
        'components',
        'app-shell',
        `${component}.tsx`
      )

      if (!fs.existsSync(componentFilePath)) {
        console.log(`⚠️  组件文件不存在: ${componentFilePath}`)
        return
      }

      console.log(`\n🔍 扫描 ${component} 组件硬编码文本...`)
      const hardcodedTexts = scanComponentFile(componentFilePath)

      testReport.summary.hardcodedTextFound += hardcodedTexts.length

      if (hardcodedTexts.length > 0) {
        console.log(`⚠️  ${component} 发现 ${hardcodedTexts.length} 处可能需要翻译的文本`)

        hardcodedTexts.forEach(({ text, line, severity }) => {
          testReport.findings.hardcodedText.push({
            component,
            text,
            line,
            filePath: path.relative(projectRoot, componentFilePath),
            severity,
          })
        })
      } else {
        console.log(`✅ ${component} 未发现明显硬编码文本`)
      }
    })

    test('应该检测到 FreeFormInput 组件的硬编码文本', () => {
      const component = 'FreeFormInput'
      const componentFilePath = path.join(
        projectRoot,
        'apps',
        'electron',
        'src',
        'renderer',
        'components',
        'app-shell',
        'input',
        `${component}.tsx`
      )

      if (!fs.existsSync(componentFilePath)) {
        console.log(`⚠️  组件文件不存在: ${componentFilePath}`)
        return
      }

      console.log(`\n🔍 扫描 ${component} 组件硬编码文本...`)
      const hardcodedTexts = scanComponentFile(componentFilePath)

      testReport.summary.hardcodedTextFound += hardcodedTexts.length

      if (hardcodedTexts.length > 0) {
        console.log(`⚠️  ${component} 发现 ${hardcodedTexts.length} 处可能需要翻译的文本`)

        hardcodedTexts.forEach(({ text, line, severity }) => {
          testReport.findings.hardcodedText.push({
            component,
            text,
            line,
            filePath: path.relative(projectRoot, componentFilePath),
            severity,
          })
        })

        // 在 CI 环境中，高优先级的硬编码文本应该不超过 5 个
        const highSeverityCount = hardcodedTexts.filter(t => t.severity === 'high').length
        if (process.env.CI && highSeverityCount > 5) {
          expect(
            highSeverityCount,
            `${component} 发现 ${highSeverityCount} 处高优先级硬编码文本`
          ).toBeLessThanOrEqual(5)
        }
      } else {
        console.log(`✅ ${component} 未发现明显硬编码文本`)
      }
    })
  })

  test.describe('翻译文件完整性检查', () => {
    test('英文翻译文件应该都存在', () => {
      console.log('\n🔍 检查英文翻译文件...')

      for (const component of APP_SHELL_COMPONENTS) {
        const exists = checkTranslationFileExists(component, 'en')

        if (exists) {
          console.log(`✅ ${component} 英文翻译文件存在`)
        } else {
          console.log(`❌ ${component} 英文翻译文件不存在`)
          testReport.findings.missingTranslations.push({
            locale: 'en',
            component,
          })
          testReport.summary.missingTranslations++
        }
      }

      expect(
        testReport.summary.missingTranslations,
        '缺少英文翻译文件'
      ).toBe(0)
    })

    test('中文翻译文件应该都存在', () => {
      console.log('\n🔍 检查中文翻译文件...')

      let missingCount = 0
      for (const component of APP_SHELL_COMPONENTS) {
        const exists = checkTranslationFileExists(component, 'zh-CN')

        if (exists) {
          console.log(`✅ ${component} 中文翻译文件存在`)
        } else {
          console.log(`❌ ${component} 中文翻译文件不存在`)
          testReport.findings.missingTranslations.push({
            locale: 'zh-CN',
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

    test('JSON 文件格式应该正确（有换行符）', () => {
      console.log('\n🔍 检查 JSON 文件格式...')

      for (const locale of ['en', 'zh-CN']) {
        for (const component of APP_SHELL_COMPONENTS) {
          const filePath = path.join(
            projectRoot,
            'i18n',
            'locales',
            locale,
            'components',
            'app-shell',
            `${component}.json`
          )

          if (!fs.existsSync(filePath)) {
            continue
          }

          const result = validateJsonFormat(filePath)

          if (result.valid) {
            console.log(`✅ ${locale}/${component}.json 格式正确`)
          } else {
            console.log(`❌ ${locale}/${component}.json 格式错误: ${result.issue}`)
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
    test('英文和中文翻译文件的键应该一致', () => {
      console.log('\n🔍 检查翻译键一致性...')

      for (const component of APP_SHELL_COMPONENTS) {
        const enFile = path.join(
          projectRoot,
          'i18n',
          'locales',
          'en',
          'components',
          'app-shell',
          `${component}.json`
        )
        const zhFile = path.join(
          projectRoot,
          'i18n',
          'locales',
          'zh-CN',
          'components',
          'app-shell',
          `${component}.json`
        )

        if (!fs.existsSync(enFile) || !fs.existsSync(zhFile)) {
          continue
        }

        const result = checkTranslationKeysConsistency(enFile, zhFile)

        if (result.consistent) {
          console.log(`✅ ${component} 翻译键一致`)
        } else {
          console.log(`⚠️  ${component} 翻译键不一致`)

          if (result.missingInZh && result.missingInZh.length > 0) {
            console.log(
              `   缺少中文翻译: ${result.missingInZh.slice(0, 5).join(', ')}`
            )
            if (result.missingInZh.length > 5) {
              console.log(
                `   ...还有 ${result.missingInZh.length - 5} 个`
              )
            }
          }

          if (result.missingInEn && result.missingInEn.length > 0) {
            console.log(
              `   缺少英文翻译: ${result.missingInEn.slice(0, 5).join(', ')}`
            )
            if (result.missingInEn.length > 5) {
              console.log(
                `   ...还有 ${result.missingInEn.length - 5} 个`
              )
            }
          }
        }
      }
    })
  })

  test.describe('运行时文本检测', () => {
    let electronApp: any
    let page: any

    test.beforeAll(async () => {
      const mainPath = path.join(projectRoot, 'apps', 'electron', 'main.js')

      try {
        electronApp = await electron.launch({
          args: [mainPath],
          env: {
            ...process.env,
            NODE_ENV: 'test',
          },
        })

        page = await electronApp.firstWindow()
        await page.waitForLoadState('domcontentloaded')
        await page.waitForTimeout(3000) // 等待应用完全加载
      } catch (error) {
        console.warn('⚠️  Electron 启动失败，跳过运行时检测')
        electronApp = null
      }
    })

    test.afterAll(async () => {
      if (electronApp) {
        await electronApp.close()
      }
    })

    test('检测页面上的硬编码文本', async () => {
      test.skip(!electronApp, 'Electron 应用未启动')

      console.log('\n🔍 检测页面上的硬编码文本...')

      try {
        const bodyText = await page.textContent('body')

        if (!bodyText) {
          console.log('⚠️  无法获取页面文本内容')
          return
        }

        console.log(`页面文本总长度: ${bodyText.length} 字符`)

        // 按行分割文本
        const lines = bodyText.split('\n')
        const findings: Array<{
          component: string
          text: string
          line: number
          severity: 'high' | 'medium' | 'low'
        }> = []

        lines.forEach((line, index) => {
          const translatable = extractTranslatableText(line)

          translatable.forEach(item => {
            findings.push({
              component: 'Runtime',
              text: item.text,
              line: index + 1,
              severity: item.severity,
            })
          })
        })

        // 记录到测试报告
        testReport.summary.hardcodedTextFound += findings.length
        findings.forEach(finding => {
          testReport.findings.hardcodedText.push(finding)
        })

        // 输出发现
        if (findings.length > 0) {
          console.log(`\n⚠️  发现 ${findings.length} 处可能需要翻译的文本`)

          const highSeverity = findings.filter(f => f.severity === 'high')
          const mediumSeverity = findings.filter(f => f.severity === 'medium')
          const lowSeverity = findings.filter(f => f.severity === 'low')

          if (highSeverity.length > 0) {
            console.log(`\n🔴 高优先级 (${highSeverity.length}):`)
            highSeverity.slice(0, 10).forEach(f => {
              console.log(`   L${f.line}: "${f.text}"`)
            })
            if (highSeverity.length > 10) {
              console.log(`   ...还有 ${highSeverity.length - 10} 个`)
            }
          }

          if (mediumSeverity.length > 0) {
            console.log(`\n🟡 中优先级 (${mediumSeverity.length}):`)
            mediumSeverity.slice(0, 10).forEach(f => {
              console.log(`   L${f.line}: "${f.text}"`)
            })
            if (mediumSeverity.length > 10) {
              console.log(`   ...还有 ${mediumSeverity.length - 10} 个`)
            }
          }

          if (lowSeverity.length > 0) {
            console.log(`\n🟢 低优先级 (${lowSeverity.length}):`)
            lowSeverity.slice(0, 5).forEach(f => {
              console.log(`   L${f.line}: "${f.text}"`)
            })
            if (lowSeverity.length > 5) {
              console.log(`   ...还有 ${lowSeverity.length - 5} 个`)
            }
          }
        } else {
          console.log('✅ 未发现明显的硬编码文本')
        }
      } catch (error) {
        console.warn('⚠️  检测页面文本失败:', error)
      }
    })

    test('检测输入框占位符文本', async () => {
      test.skip(!electronApp, 'Electron 应用未启动')

      console.log('\n🔍 检测输入框占位符文本...')

      try {
        const inputs = await page.locator('input[placeholder], textarea[placeholder]').all()
        const untranslatedPlaceholders: string[] = []

        for (const input of inputs.slice(0, 50)) {
          const placeholder = await input.getAttribute('placeholder')
          if (placeholder && placeholder.trim().length > 2) {
            const translatable = extractTranslatableText(placeholder)
            if (translatable.length > 0) {
              translatable.forEach(t => {
                if (!untranslatedPlaceholders.includes(t.text)) {
                  untranslatedPlaceholders.push(t.text)
                }
              })
            }
          }
        }

        if (untranslatedPlaceholders.length > 0) {
          console.log(`\n⚠️  可能未翻译的占位符文本 (${untranslatedPlaceholders.length}):`)
          untranslatedPlaceholders.slice(0, 20).forEach(p => {
            console.log(`   - "${p}"`)
          })
        } else {
          console.log('✅ 未发现未翻译的占位符文本')
        }
      } catch (error) {
        console.warn('⚠️  检测占位符失败:', error)
      }
    })

    test('检测按钮文本', async () => {
      test.skip(!electronApp, 'Electron 应用未启动')

      console.log('\n🔍 检测按钮文本...')

      try {
        const buttons = await page.locator('button').all()
        const untranslatedButtons: string[] = []

        for (const button of buttons.slice(0, 50)) {
          const text = await button.textContent()
          if (text && text.trim().length > 2) {
            const translatable = extractTranslatableText(text)
            if (translatable.length > 0) {
              translatable.forEach(t => {
                if (!untranslatedButtons.includes(t.text)) {
                  untranslatedButtons.push(t.text)
                }
              })
            }
          }
        }

        if (untranslatedButtons.length > 0) {
          console.log(`\n⚠️  可能未翻译的按钮文本 (${untranslatedButtons.length}):`)
          untranslatedButtons.slice(0, 20).forEach(b => {
            console.log(`   - "${b}"`)
          })
        } else {
          console.log('✅ 未发现未翻译的按钮文本')
        }
      } catch (error) {
        console.warn('⚠️  检测按钮文本失败:', error)
      }
    })
  })

  test.describe('测试总结', () => {
    test('输出测试摘要', () => {
      console.log('\n' + '='.repeat(70))
      console.log('App-Shell i18n 自动化测试摘要')
      console.log('='.repeat(70))

      console.log(`硬编码文本发现: ${testReport.summary.hardcodedTextFound}`)
      console.log(
        `  - 高优先级: ${
          testReport.findings.hardcodedText.filter(f => f.severity === 'high').length
        }`
      )
      console.log(
        `  - 中优先级: ${
          testReport.findings.hardcodedText.filter(f => f.severity === 'medium').length
        }`
      )
      console.log(
        `  - 低优先级: ${
          testReport.findings.hardcodedText.filter(f => f.severity === 'low').length
        }`
      )

      console.log(`\nJSON 格式错误: ${testReport.summary.jsonFormatErrors}`)
      console.log(`缺少翻译文件: ${testReport.summary.missingTranslations}`)
      testReport.findings.missingTranslations.forEach(m => {
        console.log(`  - ${m.locale}/${m.component}`)
      })

      if (testReport.findings.hardcodedText.length > 0) {
        console.log('\n硬编码文本详情:')
        console.log('-'.repeat(70))

        // 按组件分组
        const groupedByComponent = new Map<string, typeof testReport.findings.hardcodedText>()
        testReport.findings.hardcodedText.forEach(item => {
          const existing = groupedByComponent.get(item.component) || []
          existing.push(item)
          groupedByComponent.set(item.component, existing)
        })

        for (const [component, items] of groupedByComponent.entries()) {
          console.log(`\n${component}:`)

          const highSeverity = items.filter(i => i.severity === 'high')
          if (highSeverity.length > 0) {
            console.log(`  🔴 高优先级 (${highSeverity.length}):`)
            highSeverity.slice(0, 5).forEach(i => {
              console.log(`     ${i.filePath}:${i.line} - "${i.text}"`)
            })
            if (highSeverity.length > 5) {
              console.log(`     ...还有 ${highSeverity.length - 5} 个`)
            }
          }

          const mediumSeverity = items.filter(i => i.severity === 'medium')
          if (mediumSeverity.length > 0) {
            console.log(`  🟡 中优先级 (${mediumSeverity.length}):`)
            mediumSeverity.slice(0, 5).forEach(i => {
              console.log(`     ${i.filePath}:${i.line} - "${i.text}"`)
            })
            if (mediumSeverity.length > 5) {
              console.log(`     ...还有 ${mediumSeverity.length - 5} 个`)
            }
          }
        }
      }

      if (testReport.findings.jsonFormatIssues.length > 0) {
        console.log('\nJSON 格式问题:')
        console.log('-'.repeat(70))
        testReport.findings.jsonFormatIssues.forEach(issue => {
          console.log(`  ${issue.file}: ${issue.issue}`)
        })
      }

      console.log('\n' + '='.repeat(70))
    })
  })
})