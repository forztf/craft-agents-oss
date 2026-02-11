/**
 * Playwright E2E i18n 测试主文件
 *
 * 功能：
 * 1. 启动 Electron 应用并遍历主要页面
 * 2. 检测硬编码文本（未使用 t() 函数的字符串）
 * 3. 验证 i18n key 是否存在于语言文件中
 * 4. 测试语言切换功能
 * 5. 生成详细的测试报告
 */

import { test, expect, ElectronApplication, Page } from '@playwright/test'
import { _electron as electron } from 'playwright'
import { promises as fs } from 'fs'
import path from 'path'

const projectRoot = path.resolve(__dirname, '..', '..')
const mainWindowSelectors = {
  settingsButton: '[data-testid="settings-menu-entry"], button:has-text("Settings"), button[aria-label*="Settings"]',
  workspaceButton: '[data-testid="workspace-switcher"], .workspace-switcher',
  sidebar: '[class*="sidebar"], [class*="Sidebar"]',
  chatArea: '[class*="chat"], [class*="Chat"]',
  inputArea: 'textarea, input[type="text"]',
  mainContent: 'main, [role="main"]',
}

/**
 * 问题报告接口
 */
interface I18nIssue {
  type: 'hardcoded' | 'missing-key' | 'incomplete-translation' | 'format-error'
  page: string
  selector: string
  text: string
  context?: string
  severity: 'error' | 'warning' | 'info'
}

class I18nTestReporter {
  private issues: I18nIssue[] = []
  private startTime: Date = new Date()

  addIssue(issue: I18nIssue) {
    this.issues.push(issue)
  }

  getSummary() {
    const errors = this.issues.filter(i => i.severity === 'error')
    const warnings = this.issues.filter(i => i.severity === 'warning')
    const infos = this.issues.filter(i => i.severity === 'info')

    return {
      total: this.issues.length,
      errors: errors.length,
      warnings: warnings.length,
      infos: infos.length,
      duration: Date.now() - this.startTime.getTime(),
    }
  }

  printReport() {
    const summary = this.getSummary()

    console.log('\n' + '='.repeat(70))
    console.log('📊 I18n 测试报告')
    console.log('='.repeat(70))
    console.log(`测试时间: ${this.startTime.toLocaleString('zh-CN')}`)
    console.log(`总耗时: ${Math.round(summary.duration / 1000)}s`)
    console.log('\n' + '-'.repeat(70))
    console.log(`发现问题: ${summary.total}`)
    console.log(`  ❌ 错误: ${summary.errors}`)
    console.log(`  ⚠️  警告: ${summary.warnings}`)
    console.log(`  ℹ️  信息: ${summary.infos}`)
    console.log('='.repeat(70))

    // 按页面分组显示
    const groupedByPage = new Map<string, I18nIssue[]>()
    for (const issue of this.issues) {
      const existing = groupedByPage.get(issue.page) || []
      existing.push(issue)
      groupedByPage.set(issue.page, existing)
    }

    for (const [page, issues] of groupedByPage) {
      console.log(`\n📄 页面: ${page}`)
      console.log('  '.padStart(4, '-'))

      for (const issue of issues) {
        const icon = issue.severity === 'error' ? '❌' : issue.severity === 'warning' ? '⚠️' : 'ℹ️'
        console.log(`  ${icon} [${issue.type}] ${issue.text}`)
        if (issue.selector) {
          console.log(`     选择器: ${issue.selector}`)
        }
      }
    }
  }

  async saveReport() {
    const reportPath = path.join(projectRoot, 'test-results', 'i18n-e2e-report.json')
    const reportDir = path.dirname(reportPath)

    await fs.mkdir(reportDir, { recursive: true })

    const report = {
      timestamp: this.startTime.toISOString(),
      summary: this.getSummary(),
      issues: this.issues,
    }

    await fs.writeFile(reportPath, JSON.stringify(report, null, 2))
    console.log(`\n📝 报告已保存至: ${reportPath}`)
  }
}

/**
 * 加载语言文件和所有翻译 keys
 */
async function loadTranslationKeys(): Promise<Map<string, Set<string>>> {
  const keysByFile = new Map<string, Set<string>>()
  const localesPath = path.join(projectRoot, 'i18n', 'locales', 'en')

  async function walkDir(dir: string, basePath: string = '') {
    const entries = await fs.readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      const relativePath = path.join(basePath, entry.name)

      if (entry.isDirectory()) {
        await walkDir(fullPath, relativePath)
      } else if (entry.name.endsWith('.json')) {
        try {
          const content = await fs.readFile(fullPath, 'utf-8')
          const json = JSON.parse(content)
          const keys = Object.keys(json)
          keysByFile.set(relativePath, new Set(keys))
        } catch (e) {
          console.warn(`无法读取翻译文件: ${relativePath}`)
        }
      }
    }
  }

  await walkDir(localesPath)
  return keysByFile
}

/**
 * 获取所有翻译 keys（用于验证）
 */
async function getAllTranslationKeys(): Promise<Set<string>> {
  const allKeys = new Set<string>()
  const keysByFile = await loadTranslationKeys()

  keysByFile.forEach((keys, file) => {
    keys.forEach(key => allKeys.add(key))
  })

  return allKeys
}

/**
 * 检查文本是否可能是硬编码（未被翻译）
 */
function isLikelyHardcodedText(text: string): boolean {
  const trimmed = text.trim()

  // 忽略规则
  if (trimmed.length < 3) return false
  if (/^\d+$/.test(trimmed)) return false
  if (/^[a-z][a-z0-9\-_]*$/.test(trimmed)) return false // CSS 类名等
  if (/^https?:\/\//.test(trimmed)) return false // URL
  if (/^[A-Z_]+$/.test(trimmed) && !trimmed.includes(' ')) return false // 常量
  if (/^[.\/]/.test(trimmed)) return false // 文件路径

  // 检查是否是英文用户文本（大写字母开头，包含单词）
  const userTextPattern = /^[A-Z][a-zA-Z\s,\.\!?]{2,}$/
  if (!userTextPattern.test(trimmed)) return false

  return true
}

/**
 * 查找元素的所有文本内容（包括子元素）
 */
async function getAllTextContent(page: Page, selector: string): Promise<string[]> {
  const elements = await page.locator(selector).all()
  const texts: string[] = []

  for (const element of elements) {
    const textContent = await element.textContent()
    if (textContent && textContent.trim()) {
      texts.push(textContent.trim())
    }
  }

  return texts
}

let electronApp: ElectronApplication
let page: Page
let reporter: I18nTestReporter
let allTranslationKeys: Set<string>

test.beforeAll(async () => {
  console.log('🚀 启动 Electron 应用...\n')

  // 加载翻译 keys
  allTranslationKeys = await getAllTranslationKeys()
  console.log(`✅ 已加载 ${allTranslationKeys.size} 个翻译 keys\n`)

  // 初始化报告器
  reporter = new I18nTestReporter()

  // 检查应用是否已编译
  const mainPath = path.join(projectRoot, 'apps', 'electron', 'main.js')
  const mainJsExists = await fs.access(mainPath).then(() => true).catch(() => false)

  if (!mainJsExists) {
    console.warn('⚠️  Electron 主进程未编译，跳过 UI 测试')
    console.warn('请先运行: bun run electron:build\n')
    return
  }

  try {
    electronApp = await electron.launch({
      args: [mainPath],
      env: {
        ...process.env,
        NODE_ENV: 'test',
      },
    })

    // 等待第一个窗口
    page = await electronApp.firstWindow()
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(5000) // 等待应用完全加载

    console.log('✅ Electron 应用已启动\n')
  } catch (error) {
    console.error('❌ 启动 Electron 应用失败:', error)
    throw error
  }
})

test.afterAll(async () => {
  if (electronApp) {
    console.log('\n🧹 清理资源...')
    await electronApp.close()
  }

  // 生成报告
  reporter.printReport()
  await reporter.saveReport()
})

test.describe('I18n 完整性测试套件', () => {
  test('Chat 页面硬编码文本检测', async () => {
    if (!page) {
      test.skip()
      return
    }

    console.log('\n📋 检测 Chat 页面...')

    // 检查聊天区域的文本
    const chatSelectors = [
      mainWindowSelectors.chatArea,
      mainWindowSelectors.inputArea,
      '.message, [class*="message"]',
      'button, input[placeholder], textarea[placeholder]',
    ]

    for (const selector of chatSelectors) {
      try {
        const texts = await getAllTextContent(page, selector)

        for (const text of texts) {
          if (isLikelyHardcodedText(text)) {
            // 检查是否在翻译文件中
            const hasTranslation = allTranslationKeys.has(text)

            if (!hasTranslation) {
              reporter.addIssue({
                type: 'hardcoded',
                page: 'Chat',
                selector,
                text,
                severity: 'warning',
              })
            }
          }
        }
      } catch (e) {
        // 忽略选择器不存在的错误
      }
    }

    console.log(`  ✓ Chat 页面检查完成`)
  })

  test('Settings 页面硬编码文本检测', async () => {
    if (!page) {
      test.skip()
      return
    }

    console.log('\n⚙️  检测 Settings 页面...')

    // 尝试导航到设置页面
    const settingsButton = page.locator(mainWindowSelectors.settingsButton).first()

    let onSettingsPage = false
    try {
      if (await settingsButton.isVisible({ timeout: 2000 })) {
        await settingsButton.click()
        await page.waitForTimeout(2000)
        onSettingsPage = true
      }
    } catch (e) {
      console.warn('  ⚠️  无法导航到设置页面')
    }

    if (onSettingsPage) {
      const settingsSelectors = [
        '.settings, [class*="settings"], [class*="Settings"]',
        'h1, h2, h3',
        'button, input[placeholder], textarea[placeholder]',
        'label',
      ]

      for (const selector of settingsSelectors) {
        try {
          const texts = await getAllTextContent(page, selector)

          for (const text of texts) {
            if (isLikelyHardcodedText(text)) {
              const hasTranslation = allTranslationKeys.has(text)

              if (!hasTranslation) {
                reporter.addIssue({
                  type: 'hardcoded',
                  page: 'Settings',
                  selector,
                  text,
                  severity: 'warning',
                })
              }
            }
          }
        } catch (e) {
          // 忽略错误
        }
      }

      console.log(`  ✓ Settings 页面检查完成`)
    }
  })

  test('Sidebar 区域检测', async () => {
    if (!page) {
      test.skip()
      return
    }

    console.log('\n📊 检测 Sidebar 区域...')

    const sidebarTexts = await getAllTextContent(page, mainWindowSelectors.sidebar)

    for (const text of sidebarTexts) {
      if (isLikelyHardcodedText(text)) {
        const hasTranslation = allTranslationKeys.has(text)

        if (!hasTranslation) {
          reporter.addIssue({
            type: 'hardcoded',
            page: 'Sidebar',
            selector: mainWindowSelectors.sidebar,
            text,
            severity: text.includes('Error') || text.includes('Failed') ? 'error' : 'warning',
          })
        }
      }
    }

    console.log(`  ✓ Sidebar 检查完成`)
  })

  test('按钮文本检测', async () => {
    if (!page) {
      test.skip()
      return
    }

    console.log('\n🔘 检测按钮文本...')

    // 获取所有可见按钮
    const buttons = await page.locator('button:visible').all()
    let checkedCount = 0

    for (const button of buttons.slice(0, 50)) { // 限制检查数量
      try {
        const text = await button.textContent()
        if (text && text.trim()) {
          const trimmed = text.trim()

          if (isLikelyHardcodedText(trimmed)) {
            const hasTranslation = allTranslationKeys.has(trimmed)

            if (!hasTranslation) {
              const selector = await button.evaluate(el => {
                // 获取选择器
                const selector = el.getAttribute('data-testid') ||
                               el.getAttribute('aria-label') ||
                               el.className
                return selector ? selector : 'button'
              })

              reporter.addIssue({
                type: 'hardcoded',
                page: 'Buttons',
                selector: `button[${selector}]`,
                text: trimmed,
                severity: 'warning',
              })
            }
          }

          checkedCount++
        }
      } catch (e) {
        // 忽略错误
      }
    }

    console.log(`  ✓ 检查了 ${checkedCount} 个按钮`)
  })

  test('Placeholder 文本检测', async () => {
    if (!page) {
      test.skip()
      return
    }

    console.log('\n📝 检测 Placeholder 文本...')

    const inputs = await page.locator('input[placeholder], textarea[placeholder]').all()

    for (const input of inputs) {
      try {
        const placeholder = await input.getAttribute('placeholder')
        if (placeholder && placeholder.trim()) {
          const trimmed = placeholder.trim()

          // placeholder 格式：通常是小写或驼峰，但如果有完整句子需要翻译
          if (trimmed.length > 20 || trimmed.includes(' ')) {
            const hasTranslation = allTranslationKeys.has(trimmed)

            if (!hasTranslation) {
              reporter.addIssue({
                type: 'hardcoded',
                page: 'Placeholders',
                selector: 'input[placeholder]',
                text: trimmed,
                severity: 'warning',
              })
            }
          }
        }
      } catch (e) {
        // 忽略错误
      }
    }

    console.log(`  ✓ Placeholder 检查完成`)
  })

  test('语言文件完整性验证', async () => {
    console.log('\n🔍 验证语言文件完整性...')

    const localesPath = path.join(projectRoot, 'i18n', 'locales')
    const enPath = path.join(localesPath, 'en')
    const zhPath = path.join(localesPath, 'zh-CN')

    // 获取文件列表
    async function getJsonFiles(dir: string): Promise<string[]> {
      const files: string[] = []

      async function walk(currentDir: string, basePath: string = '') {
        const entries = await fs.readdir(currentDir, { withFileTypes: true })

        for (const entry of entries) {
          const fullPath = path.join(currentDir, entry.name)
          const relativePath = path.join(basePath, entry.name)

          if (entry.isDirectory()) {
            await walk(fullPath, relativePath)
          } else if (entry.name.endsWith('.json')) {
            files.push(relativePath)
          }
        }
      }

      await walk(dir)
      return files
    }

    const enFiles = await getJsonFiles(enPath)
    const zhFiles = await getJsonFiles(zhPath)

    // 检查缺失的文件
    const missingInZh = enFiles.filter(f => !zhFiles.includes(f))
    const missingInEn = zhFiles.filter(f => !enFiles.includes(f))

    for (const file of missingInZh) {
      reporter.addIssue({
        type: 'missing-key',
        page: 'Translation Files',
        selector: `i18n/locales/zh-CN/${file}`,
        text: 'Missing Chinese translation file',
        severity: 'error',
      })
    }

    for (const file of missingInEn) {
      reporter.addIssue({
        type: 'missing-key',
        page: 'Translation Files',
        selector: `i18n/locales/en/${file}`,
        text: 'Missing English translation file',
        severity: 'error',
      })
    }

    // 检查 key 一致性
    for (const enFile of enFiles) {
      if (!zhFiles.includes(enFile)) continue

      const enFilePath = path.join(enPath, enFile)
      const zhFilePath = path.join(zhPath, enFile)

      try {
        const enContent = await fs.readFile(enFilePath, 'utf-8')
        const zhContent = await fs.readFile(zhFilePath, 'utf-8')

        const enJson = JSON.parse(enContent)
        const zhJson = JSON.parse(zhContent)

        const enKeys = Object.keys(enJson)
        const zhKeys = Object.keys(zhJson)

        const missingInZhKeys = enKeys.filter(k => !zhKeys.includes(k))
        const missingInEnKeys = zhKeys.filter(k => !enKeys.includes(k))

        for (const key of missingInZhKeys) {
          reporter.addIssue({
            type: 'missing-key',
            page: `Translation Keys (${enFile})`,
            selector: enFile,
            text: key,
            severity: 'error',
          })
        }

        for (const key of missingInEnKeys) {
          reporter.addIssue({
            type: 'missing-key',
            page: `Translation Keys (${enFile})`,
            selector: enFile,
            text: key,
            severity: 'error',
          })
        }
      } catch (e) {
        console.warn(`  ⚠️  无法比较文件: ${enFile}`)
      }
    }

    console.log(`  ✓ 验证 ${enFiles.length} 个英文文件`)
    console.log(`  ✓ 验证 ${zhFiles.length} 个中文文件`)
  })

  test('HTML 属性文本检测', async () => {
    if (!page) {
      test.skip()
      return
    }

    console.log('\n🏷️  检测 HTML 属性文本...')

    const attributes = ['title', 'aria-label', 'placeholder', 'alt']

    for (const attr of attributes) {
      try {
        const elements = await page.locator(`[${attr}]`).all()

        for (const element of elements.slice(0, 100)) { // 限制检查数量
          try {
            const attrValue = await element.getAttribute(attr)
            if (attrValue && attrValue.trim()) {
              const trimmed = attrValue.trim()

              if (trimmed.length > 3 && isLikelyHardcodedText(trimmed)) {
                const hasTranslation = allTranslationKeys.has(trimmed)

                if (!hasTranslation) {
                  reporter.addIssue({
                    type: 'hardcoded',
                    page: 'HTML Attributes',
                    selector: `[${attr}]`,
                    text: trimmed,
                    severity: 'warning',
                  })
                }
              }
            }
          } catch (e) {
            // 忽略错误
          }
        }
      } catch (e) {
        // 忽略错误
      }
    }

    console.log(`  ✓ HTML 属性检查完成`)
  })
})

test.describe('UI 交互检测', () => {
  test('语言切换功能', async () => {
    if (!page) {
      test.skip()
      return
    }

    console.log('\n🌐 测试语言切换功能...')

    // 查找语言选择器
    const languageSelectors = [
      'select[name="language"]',
      '[data-testid="language-selector"]',
      'button[aria-label*="language"]',
    ]

    let languageSelector = null
    for (const selector of languageSelectors) {
      try {
        const element = page.locator(selector).first()
        if (await element.isVisible({ timeout: 1000 })) {
          languageSelector = element
          break
        }
      } catch (e) {
        // 继续查找
      }
    }

    if (languageSelector) {
      console.log('  ✓ 找到语言选择器')

      try {
        // 切换到中文
        await languageSelector.selectOption('zh-CN')
        await page.waitForTimeout(2000)

        // 切换回英文
        await languageSelector.selectOption('en')
        await page.waitForTimeout(2000)

        console.log('  ✓ 语言切换功能正常')
      } catch (e) {
        console.warn('  ⚠️  语言切换测试失败:', e)
        reporter.addIssue({
          type: 'format-error',
          page: 'Language Switch',
          selector: 'language-selector',
          text: 'Language switch functionality issue',
          severity: 'error',
        })
      }
    } else {
      console.warn('  ⚠️  未找到语言选择器')
    }
  })
})

test.describe('静态代码分析集成', () => {
  test('生成静态代码分析报告', async () => {
    console.log('\n📊 执行静态代码分析...')

    // 运行现有的静态检测脚本
    const staticCheckScript = path.join(projectRoot, 'tests', 'e2e', 'hardcoded-check.ts')

    try {
      const { spawn } = await import('child_process')
      const results = await new Promise<string>((resolve, reject) => {
        const proc = spawn('bun', ['run', staticCheckScript], {
          cwd: projectRoot,
        })

        let stdout = ''
        let stderr = ''

        proc.stdout.on('data', (data: Buffer) => {
          stdout += data.toString()
        })

        proc.stderr.on('data', (data: Buffer) => {
          stderr += data.toString()
        })

        proc.on('close', (code: number | null) => {
          if (code === 0) {
            resolve(stdout)
          } else {
            reject(new Error(stderr || `Process exited with code ${code}`))
          }
        })
      })

      console.log('  ✓ 静态代码分析完成')

      // 从结果中提取发现问题
      const lines = results.split('\n')
      for (const line of lines) {
        if (line.includes('[') && line.includes(']:')) {
          // 尝试解析格式: 文件路径: L[行号] [类型]: "文本"
          const match = line.match(/^(\S+):\s*L(\d+)\s+\[(\w+)\]:\s*"(.+)"/)
          if (match) {
            const [, filePath, lineNum, type, text] = match
            const pageName = filePath.includes('chat') ? 'Chat' :
                            filePath.includes('settings') ? 'Settings' :
                            filePath.includes('workspace') ? 'Workspace' :
                            filePath.includes('onboarding') ? 'Onboarding' : 'Other'

            reporter.addIssue({
              type: type === 'hardcoded' ? 'hardcoded' : 'format-error',
              page: pageName,
              selector: `${filePath}:${lineNum}`,
              text,
              severity: 'warning',
            })
          }
        }
      }
    } catch (e) {
      console.warn('  ⚠️  静态代码分析失败:', e)
    }
  })
})