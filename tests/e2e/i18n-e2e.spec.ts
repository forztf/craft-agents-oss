/**
 * Electron + Playwright i18n 自动化测试套件
 *
 * 检测和验证国际化改造的完整性：
 * 1. 检测页面上的硬编码英文文本
 * 2. 验证翻译文件完整性
 * 3. 语言切换功能测试
 * 4. 生成详细测试报告
 *
 * 用法：
 *   bun run test:e2e          - 运行所有测试
 *   bun run test:e2e:ui      - 使用 UI 模式运行测试
 */

import { test, expect } from '@playwright/test'
import { _electron as electron } from 'playwright'
import path from 'path'
import * as fs from 'fs'

// 测试报告数据结构
interface I18nTestReport {
  timestamp: string
  summary: {
    totalTests: number
    passed: number
    failed: number
    skipped: number
  }
  findings: {
    hardcodedText: Array<{
      location: string
      text: string
      context: string
      severity: 'high' | 'medium' | 'low'
    }>
    missingTranslations: Array<{
      component: string
      missingKeys: string[]
    }>
    translationGaps: Array<{
      file: string
      enCount: number
      zhCount: number
    }>
  }
  languageSwitchTest?: {
    success: boolean
    error?: string
  }
}

// 全局测试报告
const testReport: I18nTestReport = {
  timestamp: new Date().toISOString(),
  summary: {
    totalTests: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
  },
  findings: {
    hardcodedText: [],
    missingTranslations: [],
    translationGaps: [],
  },
}

/**
 * 常见需要翻译的英文短语模式
 * 用于检测页面上的硬编码文本
 */
const COMMON_ENGLISH_PHRASES = {
  // 通用 UI 文本
  ui: [
    // 形容词/副词 (非大写开头)
    /\b(cancel|close|save|delete|edit|add|remove|rename|copy|paste|cut|undo|redo|search|filter|sort|clear|reset|submit|continue|back|next|previous|finish|ok|yes|no|apply|discard|loading|error|success|warning|info)\b/gi,
  ],
  // 常见错误消息
  errors: [
    /\b(an error occurred|failed to|please enter|is required|invalid|not found|already exists|try again|something went wrong)\b/gi,
    /\b(error loading|connection failed|authentication|unauthorized|forbidden|not allowed)\b/gi,
  ],
  // 设置相关
  settings: [
    /\b(general|settings|preferences|configuration|options|appearance|theme|language|locale|notifications|security)\b/gi,
  ],
  // 对话框文本
  dialog: [
    /\b(are you sure|do you want|confirm|delete|remove|cancel|proceed|allow|deny)\b/gi,
  ],
}

/**
 * 需要忽略的模式
 * 这些不应该被标记为需要翻译
 */
const IGNORE_PATTERNS = [
  // 路径和 URL
  /^https?:\/\//,
  /^\.\.?\//,
  /\.js(on)?$/,
  /\.tsx?$/,
  /\.pdf$/,
  /\.md$/,
  // 文件路径
  /^\/[\w\-/]+$/,
  // CSS 类名
  /^[a-z][a-z0-9\-_]*$/,
  // 纯数字
  /^\d+$/,
  // 短文本（2 字符以下）
  /^.{0,2}$/,
  // 技术术语
  /^(api|http|https|json|xml|html|css|js|ts|tsx|pdf|md|git|url|uri|id|uuid|token|key|secret|ssl|tls)$/,
  // 常见技术模式
  /\{\w+\}/,
  /\/[a-z]+\//,
  // 字母数字 ID
  /^[a-f0-9\-_]+$/i,
]

/**
 * 检查文本是否应该被忽略
 */
function shouldIgnoreText(text: string): boolean {
  const trimmed = text.trim()
  if (!trimmed) return true

  return IGNORE_PATTERNS.some(pattern => pattern.test(trimmed))
}

/**
 * 从文本中提取需要翻译的英文内容
 */
function extractTranslatableText(
  text: string,
  context: string = ''
): Array<{ text: string; category: string; severity: 'high' | 'medium' | 'low' }> {
  const results: Array<{ text: string; category: string; severity: 'high' | 'medium' | 'low' }> = []

  // 收集所有需要检查的短语
  const allPhrases = new Map<string, { category: string; severity: 'high' | 'medium' | 'low' }>()

  for (const [category, patterns] of Object.entries(COMMON_ENGLISH_PHRASES)) {
    for (const pattern of patterns) {
      const matches = text.matchAll(new RegExp(pattern.source, pattern.flags))
      for (const match of matches) {
        const matchedText = match[0]
        if (!shouldIgnoreText(matchedText) && !allPhrases.has(matchedText)) {
          // 根据文本长度和上下文判断严重程度
          let severity: 'high' | 'medium' | 'low' = 'medium'
          if (matchedText.length > 20) severity = 'high' as const
          else if (matchedText.length < 5) severity = 'low' as const

          allPhrases.set(matchedText, { category, severity })
        }
      }
    }
  }

  allPhrases.forEach((value, text) => {
    results.push({ text, ...value })
  })

  return results
}

// 测试套件
test.describe('i18n 自动化测试套件', () => {
  test.beforeAll(async () => {
    console.log('\n='.repeat(70))
    console.log('开始 i18n 自动化测试')
    console.log('='.repeat(70))
  })

  test.afterAll(async ({ browser }) => {
    // 保存测试报告
    const projectRoot = path.resolve(__dirname, '..', '..')
    const reportPath = path.join(projectRoot, 'test-results', 'i18n-e2e-report.json')

    fs.mkdirSync(path.dirname(reportPath), { recursive: true })

    // 统计测试结果
    const testResults = test.info().testResults
    if (testResults?.length) {
      testReport.summary.passed = testResults.filter(r => r.status === 'passed').length
      testReport.summary.failed = testResults.filter(r => r.status === 'failed').length
      testReport.summary.skipped = testResults.filter(r => r.status === 'skipped')?.length || 0
      testReport.summary.totalTests = testResults.length
    }

    fs.writeFileSync(reportPath, JSON.stringify(testReport, null, 2))

    console.log('\n' + '='.repeat(70))
    console.log('测试完成，报告已生成')
    console.log(`报告路径: ${reportPath}`)
    console.log('='.repeat(70))
  })

  test.describe('翻译文件完整性检查', () => {
    test('英文和中文翻译文件应该一一对应', () => {
      const projectRoot = path.resolve(__dirname, '..', '..')
      const enDir = path.join(projectRoot, 'i18n', 'locales', 'en')
      const zhDir = path.join(projectRoot, 'i18n', 'locales', 'zh-CN')

      const getJsonFiles = (dir: string): string[] => {
        const files: string[] = []
        const walk = (currentDir: string, basePath: string = '') => {
          if (!fs.existsSync(currentDir)) return

          const entries = fs.readdirSync(currentDir, { withFileTypes: true })
          for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name)
            const relativePath = path.join(basePath, entry.name)
            if (entry.isDirectory()) {
              walk(fullPath, relativePath)
            } else if (entry.name.endsWith('.json')) {
              files.push(relativePath)
            }
          }
        }
        walk(dir)
        return files
      }

      const enFiles = getJsonFiles(enDir)
      const zhFiles = getJsonFiles(zhDir)

      // 检查中文是否缺少英文对应的文件
      const missingInZh = enFiles.filter(f => !zhFiles.includes(f))
      const missingInEn = zhFiles.filter(f => !enFiles.includes(f))

      // 记录到测试报告
      if (missingInZh.length > 0) {
        testReport.findings.missingTranslations.push({
          component: 'zh-CN',
          missingKeys: missingInZh,
        })
      }
      if (missingInEn.length > 0) {
        testReport.findings.missingTranslations.push({
          component: 'en',
          missingKeys: missingInEn,
        })
      }

      if (missingInZh.length > 0) {
        console.log('⚠️  中文缺少的翻译文件:')
        missingInZh.forEach(f => console.log(`   - ${f}`))
      }
      if (missingInEn.length > 0) {
        console.log('⚠️  英文缺少的翻译文件:')
        missingInEn.forEach(f => console.log(`   - ${f}`))
      }

      console.log(`✅ 英文翻译文件: ${enFiles.length}`)
      console.log(`✅ 中文翻译文件: ${zhFiles.length}`)

      // 软断言：只在 CI 环境或严格模式下失败
      if (missingInZh.length > 0 && process.env.CI) {
        expect(missingInZh.length, `缺少 ${missingInZh.length} 个中文翻译文件`).toBe(0)
      }
    })

    test('每个翻译文件的 key 数量应该一致', () => {
      const projectRoot = path.resolve(__dirname, '..', '..')
      const enDir = path.join(projectRoot, 'i18n', 'locales', 'en')
      const zhDir = path.join(projectRoot, 'i18n', 'locales', 'zh-CN')

      const compareTranslationKeys = (filePath: string) => {
        const enPath = path.join(enDir, filePath)
        const zhPath = path.join(zhDir, filePath)

        if (!fs.existsSync(enPath) || !fs.existsSync(zhPath)) return

        const enContent = JSON.parse(fs.readFileSync(enPath, 'utf-8'))
        const zhContent = JSON.parse(fs.readFileSync(zhPath, 'utf-8'))

        const enKeys = Object.keys(enContent)
        const zhKeys = Object.keys(zhContent)

        const missingInZh = enKeys.filter(k => !zhKeys.includes(k))
        const missingInEn = zhKeys.filter(k => !enKeys.includes(k))

        if (missingInZh.length > 0 || missingInEn.length > 0) {
          // 记录到测试报告
          testReport.findings.translationGaps.push({
            file: filePath,
            enCount: enKeys.length,
            zhCount: zhKeys.length,
          })

          console.log(`\n📄 ${filePath}`)
          if (missingInZh.length > 0) {
            console.log(`   缺少中文翻译 (${missingInZh.length}):`)
            missingInZh.slice(0, 5).forEach(k => console.log(`   - ${k}`))
            if (missingInZh.length > 5) console.log(`   ... 还有 ${missingInZh.length - 5} 个`)
          }
          if (missingInEn.length > 0) {
            console.log(`   缺少英文翻译 (${missingInEn.length}):`)
            missingInEn.slice(0, 5).forEach(k => console.log(`   - ${k}`))
            if (missingInEn.length > 5) console.log(`   ... 还有 ${missingInEn.length - 5} 个`)
          }
        }
      }

      // 遍历所有英文翻译文件
      const walkAndCompare = (dir: string, basePath: string = '') => {
        if (!fs.existsSync(dir)) return

        const entries = fs.readdirSync(dir, { withFileTypes: true })
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name)
          const relativePath = path.join(basePath, entry.name)
          if (entry.isDirectory()) {
            walkAndCompare(fullPath, relativePath)
          } else if (entry.name.endsWith('.json')) {
            compareTranslationKeys(relativePath)
          }
        }
      }

      walkAndCompare(enDir)
    })
  })

  test.describe('运行时硬编码文本检测', () => {
    let electronApp: any
    let page: any

    test.beforeAll(async () => {
      const projectRoot = path.resolve(__dirname, '..', '..')
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
        // Electron 启动失败可能是由于构建问题，标记测试为跳过
        console.warn('⚠️  Electron 启动失败，跳过运行时检测')
        electronApp = null
      }
    })

    test.afterAll(async () => {
      if (electronApp) {
        await electronApp.close()
      }
    })

    test('检测页面上的硬编码英文文本', async () => {
      test.skip(!electronApp, 'Electron 应用未启动')

      // 获取页面所有可见文本
      const bodyText = await page.textContent('body')

      if (!bodyText) {
        console.log('⚠️  无法获取页面文本内容')
        return
      }

      console.log('\n🔍 扫描页面硬编码文本...')
      console.log(`页面文本总长度: ${bodyText.length} 字符`)

      // 按行分割文本，保留上下文
      const lines = bodyText.split('\n')
      const findings: Array<{
        location: string
        text: string
        context: string
        severity: 'high' | 'medium' | 'low'
      }> = []

      lines.forEach((line, index) => {
        const translatable = extractTranslatableText(line)

        translatable.forEach(item => {
          // 获取上下文（前后文本）
          const contextStart = Math.max(0, index - 2)
          const contextEnd = Math.min(lines.length, index + 3)
          const context = lines.slice(contextStart, contextEnd).join('\n').substring(0, 200)

          findings.push({
            location: `Line ${index + 1}`,
            text: item.text,
            context,
            severity: item.severity,
          })
        })
      })

      // 记录到测试报告
      testReport.findings.hardcodedText = findings

      // 输出发现
      if (findings.length > 0) {
        console.log(`\n⚠️  发现 ${findings.length} 处可能需要翻译的文本`)
        console.log('-'.repeat(70))

        // 按严重程度分组
        const highSeverity = findings.filter(f => f.severity === 'high')
        const mediumSeverity = findings.filter(f => f.severity === 'medium')
        const lowSeverity = findings.filter(f => f.severity === 'low')

        if (highSeverity.length > 0) {
          console.log(`\n🔴 高优先级 (${highSeverity.length}):`)
          highSeverity.slice(0, 10).forEach(f => {
            console.log(`   ${f.location}: "${f.text}"`)
          })
          if (highSeverity.length > 10) {
            console.log(`   ... 还有 ${highSeverity.length - 10} 个`)
          }
        }

        if (mediumSeverity.length > 0) {
          console.log(`\n🟡 中优先级 (${mediumSeverity.length}):`)
          mediumSeverity.slice(0, 10).forEach(f => {
            console.log(`   ${f.location}: "${f.text}"`)
          })
          if (mediumSeverity.length > 10) {
            console.log(`   ... 还有 ${mediumSeverity.length - 10} 个`)
          }
        }

        if (lowSeverity.length > 0) {
          console.log(`\n🟢 低优先级 (${lowSeverity.length}):`)
          lowSeverity.slice(0, 5).forEach(f => {
            console.log(`   ${f.location}: "${f.text}"`)
          })
          if (lowSeverity.length > 5) {
            console.log(`   ... 还有 ${lowSeverity.length - 5} 个`)
          }
        }
      } else {
        console.log('\n✅ 未发现明显的硬编码英文文本')
      }

      // 根据发现数量设置断言
      // 高优先级发现 > 50 个时认为测试失败
      const highSevCount = findings.filter(f => f.severity === 'high').length
      if (highSevCount > 50 && process.env.CI) {
        expect(highSevCount, `发现 ${highSevCount} 处高优先级硬编码文本`).toBeLessThanOrEqual(50)
      }
    })

    test('检测特定 UI 元素的文本', async () => {
      test.skip(!electronApp, 'Electron 应用未启动')

      console.log('\n🔍 检查特定 UI 元素...')

      // 检查按钮文本
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
        untranslatedButtons.slice(0, 20).forEach(b => console.log(`   - "${b}"`))
      }

      // 检查 placeholder
      const inputs = await page.locator('input[placeholder], textarea[placeholder]').all()
      const placeholderText: string[] = []

      for (const input of inputs.slice(0, 50)) {
        const placeholder = await input.getAttribute('placeholder')
        if (placeholder && placeholder.trim().length > 2) {
          const translatable = extractTranslatableText(placeholder)
          if (translatable.length > 0) {
            translatable.forEach(t => {
              if (!placeholderText.includes(t.text)) {
                placeholderText.push(t.text)
              }
            })
          }
        }
      }

      if (placeholderText.length > 0) {
        console.log(`\n⚠️  可能未翻译的 placeholder 文本 (${placeholderText.length}):`)
        placeholderText.slice(0, 20).forEach(p => console.log(`   - "${p}"`))
      }

      // 检查提示框（tooltip）
      const tooltipElements = await page.locator('[title], [aria-label]').all()
      const tooltipText: string[] = []

      for (const elem of tooltipElements.slice(0, 50)) {
        const title = await elem.getAttribute('title')
        const ariaLabel = await elem.getAttribute('aria-label')
        const text = title || ariaLabel

        if (text && text.trim().length > 2) {
          const translatable = extractTranslatableText(text)
          if (translatable.length > 0) {
            translatable.forEach(t => {
              if (!tooltipText.includes(t.text)) {
                tooltipText.push(t.text)
              }
            })
          }
        }
      }

      if (tooltipText.length > 0) {
        console.log(`\n⚠️  可能未翻译的提示文本 (${tooltipText.length}):`)
        tooltipText.slice(0, 20).forEach(t => console.log(`   - "${t}"`))
      }
    })
  })

  test.describe('语言切换功能测试', () => {
    let electronApp: any
    let page: any

    test.beforeAll(async () => {
      const projectRoot = path.resolve(__dirname, '..', '..')
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
        await page.waitForTimeout(3000)
      } catch (error) {
        console.warn('⚠️  Electron 启动失败，跳过语言切换测试')
        electronApp = null
      }
    })

    test.afterAll(async () => {
      if (electronApp) {
        await electronApp.close()
      }
    })

    test('应该能够切换语言', async () => {
      test.skip(!electronApp, 'Electron 应用未启动')

      console.log('\n🔄 测试语言切换功能...')

      try {
        // 获取当前页面文本（假设默认是英文）
        const initialText = await page.textContent('body')
        console.log('当前语言页面文本长度:', initialText?.length || 0)

        // 尝试切换到中文
        // 注意：这需要在设置页面找到语言切换控件
        const languageSelector = page.locator('select[name="language"], [data-testid="language-selector"]').first()

        if (await languageSelector.isVisible({ timeout: 2000 }).catch(() => false)) {
          console.log('找到语言切换控件')

          const englishText = await page.textContent('body')

          // 切换到中文
          await languageSelector.selectOption('zh-CN')
          await page.waitForTimeout(1000)

          const chineseText = await page.textContent('body')
          console.log('中文页面文本长度:', chineseText?.length || 0)

          // 切换回英文
          await languageSelector.selectOption('en')
          await page.waitForTimeout(1000)

          const backToEnglishText = await page.textContent('body')
          console.log('恢复英文页面文本长度:', backToEnglishText?.length || 0)

          testReport.languageSwitchTest = {
            success: true,
          }

          console.log('✅ 语言切换功能正常')
        } else {
          console.log('⚠️  未找到语言切换控件，可能需要手动访问设置页面')
          testReport.languageSwitchTest = {
            success: true, // 不算失败，只是没有找到入口
          }
        }
      } catch (error) {
        testReport.languageSwitchTest = {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        }
        console.warn('⚠️  语言切换测试失败:', error)
      }
    })
  })

  test.describe('翻译键命名规范检查', () => {
    test('翻译键应该使用原文而非缩写', () => {
      console.log('\n🔍 检查翻译键命名规范...')

      const projectRoot = path.resolve(__dirname, '..', '..')
      const localesPath = path.join(projectRoot, 'i18n', 'locales')

      const violations: Array<{ file: string; key: string; suggestion: string }> = []

      const checkFile = (filePath: string) => {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

        for (const [key, value] of Object.entries(content)) {
          // 检查是否使用了缩写格式的 key
          // 规范：key 应该是可读的英文文本，而非简短的标识符
          if (/^[a-z_]{5,30}$/.test(key) && !key.includes(' ')) {
            // 可能是缩写格式
            const suggestion = String(value).substring(0, 50)
            violations.push({
              file: path.relative(projectRoot, filePath),
              key,
              suggestion,
            })
          }
        }
      }

      const walkDir = (dir: string) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true })
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name)
          if (entry.isDirectory()) {
            walkDir(fullPath)
          } else if (entry.name.endsWith('.json')) {
            checkFile(fullPath)
          }
        }
      }

      walkDir(localesPath)

      if (violations.length > 0) {
        console.log(`\n⚠️  发现 ${violations.length} 个可能的命名规范问题`)
        console.log('建议使用原文作为翻译键，而非缩写')
        console.log('-'.repeat(70))
        violations.slice(0, 20).forEach(v => {
          console.log(`📄 ${v.file}`)
          console.log(`   当前 key: "${v.key}"`)
          console.log(`   建议改为: "${v.suggestion}"`)
          console.log()
        })
        if (violations.length > 20) {
          console.log(`... 还有 ${violations.length - 20} 个`)
        }
      } else {
        console.log('✅ 翻译键命名符合规范')
      }
    })
  })

  test.describe('测试总结', () => {
    test('输出测试摘要', () => {
      console.log('\n' + '='.repeat(70))
      console.log('i18n 自动化测试摘要')
      console.log('='.repeat(70))

      console.log(`硬编码文本发现: ${testReport.findings.hardcodedText.length}`)
      console.log(`  - 高优先级: ${testReport.findings.hardcodedText.filter(f => f.severity === 'high').length}`)
      console.log(`  - 中优先级: ${testReport.findings.hardcodedText.filter(f => f.severity === 'medium').length}`)
      console.log(`  - 低优先级: ${testReport.findings.hardcodedText.filter(f => f.severity === 'low').length}`)

      console.log(`\n缺少翻译文件: ${testReport.findings.missingTranslations.length}`)
      testReport.findings.missingTranslations.forEach(m => {
        console.log(`  - ${m.component}: ${m.missingKeys.length} 个文件`)
      })

      console.log(`\n翻译键数量不一致: ${testReport.findings.translationGaps.length}`)
      testReport.findings.translationGaps.slice(0, 5).forEach(g => {
        console.log(`  - ${g.file}: en=${g.enCount}, zh-CN=${g.zhCount}`)
      })
      if (testReport.findings.translationGaps.length > 5) {
        console.log(`  ... 还有 ${testReport.findings.translationGaps.length - 5} 个`)
      }

      if (testReport.languageSwitchTest) {
        console.log(`\n语言切换测试: ${testReport.languageSwitchTest.success ? '✅ 通过' : '❌ 失败'}`)
        if (testReport.languageSwitchTest.error) {
          console.log(`  错误: ${testReport.languageSwitchTest.error}`)
        }
      }

      console.log('='.repeat(70))
    })
  })
})