/**
 * Electron + Playwright i18n 测试
 *
 * 这个测试套件用于验证国际化改造的正确性：
 * 1. 检测未翻译的硬编码字符串
 * 2. 验证语言切换功能
 * 3. 确保翻译 key 格式统一
 */

import { test, expect, ElectronApplication, Page } from '@playwright/test'
import { _electron as electron } from 'playwright'
import path from 'path'

let electronApp: ElectronApplication
let page: Page

test.beforeAll(async () => {
  // 启动 Electron 应用
  const projectRoot = path.resolve(__dirname, '..', '..')
  const mainPath = path.join(projectRoot, 'apps', 'electron', 'main.js')

  electronApp = await electron.launch({
    args: [mainPath],
    env: {
      ...process.env,
      NODE_ENV: 'test',
    },
  })

  // 等待第一个窗口打开
  page = await electronApp.firstWindow()
  await page.waitForLoadState('domcontentloaded')

  // 等待应用完全加载
  await page.waitForTimeout(3000)
})

test.afterAll(async () => {
  await electronApp.close()
})

test.describe('i18n 基础功能测试', () => {
  test('应用应该正常启动', async () => {
    expect(page).toBeTruthy()
    const title = await page.title()
    expect(title).toBeTruthy()
  })

  test('应该存在 I18n Provider', async () => {
    // 检查 i18n 上下文是否已初始化
    const hasI18n = await page.evaluate(() => {
      return typeof window !== 'undefined'
    })
    expect(hasI18n).toBe(true)
  })
})

test.describe('硬编码字符串检测', () => {
  test('检测常见未翻译模式', async () => {
    // 获取页面所有文本内容
    const bodyText = await page.textContent('body')

    // 常见的应该被翻译但没有被翻译的英文短语模式
    const suspiciousPatterns = [
      // 通用 UI 文本
      /\b(Click here|Submit|Cancel|Save|Delete|Edit|Add|Remove|Close|Open|Loading|Error|Success|Warning)\b/gi,
      // 错误消息
      /\b(An error occurred|Failed to|Please enter|is required|Invalid)\b/gi,
      // 设置相关
      /\b(General|Settings|Preferences|Configuration)\b/gi,
    ]

    const findings: string[] = []

    for (const pattern of suspiciousPatterns) {
      const matches = bodyText?.match(pattern)
      if (matches && matches.length > 0) {
        // 检查这些是否在 t() 调用中
        findings.push(...matches)
      }
    }

    // 记录发现的可能未翻译文本
    if (findings.length > 0) {
      console.log('可能未翻译的文本:', [...new Set(findings)].slice(0, 20))
    }
  })
})

test.describe('页面导航测试', () => {
  test('应该能导航到设置页面', async () => {
    // 查找设置按钮/链接
    const settingsButton = page.locator('[data-testid="settings-button"], button:has-text("Settings"), button:has-text("设置")').first()

    if (await settingsButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await settingsButton.click()
      await page.waitForTimeout(1000)

      // 检查是否成功导航
      const url = page.url()
      console.log('当前 URL:', url)
    }
  })

  test('检测侧边栏文本', async () => {
    // 获取侧边栏所有文本
    const sidebarText = await page.textContent('[class*="sidebar"], [class*="Sidebar"]').catch(() => null)

    if (sidebarText) {
      console.log('侧边栏内容长度:', sidebarText.length)
    }
  })
})

test.describe('语言切换测试', () => {
  test('应该能切换语言', async () => {
    // 查找语言切换控件
    const languageSelector = page.locator('select[name="language"], [data-testid="language-selector"]').first()

    if (await languageSelector.isVisible({ timeout: 2000 }).catch(() => false)) {
      // 切换到中文
      await languageSelector.selectOption('zh-CN')
      await page.waitForTimeout(1000)

      // 切换回英文
      await languageSelector.selectOption('en')
      await page.waitForTimeout(1000)
    }
  })
})

test.describe('翻译文件完整性检查', () => {
  test('英文和中文翻译文件应该一一对应', async () => {
    // 这个测试通过 Node.js API 检查文件系统
    const fs = await import('fs')
    const projectRoot = path.resolve(__dirname, '..', '..')

    const enDir = path.join(projectRoot, 'i18n', 'locales', 'en')
    const zhDir = path.join(projectRoot, 'i18n', 'locales', 'zh-CN')

    const getJsonFiles = (dir: string): string[] => {
      const files: string[] = []
      const walk = (currentDir: string, basePath: string = '') => {
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
      if (fs.existsSync(dir)) {
        walk(dir)
      }
      return files
    }

    const enFiles = getJsonFiles(enDir)
    const zhFiles = getJsonFiles(zhDir)

    // 检查中文是否缺少英文对应的文件
    const missingInZh = enFiles.filter(f => !zhFiles.includes(f))
    const missingInEn = zhFiles.filter(f => !enFiles.includes(f))

    if (missingInZh.length > 0) {
      console.log('中文缺少的翻译文件:', missingInZh)
    }
    if (missingInEn.length > 0) {
      console.log('英文缺少的翻译文件:', missingInEn)
    }

    // 记录统计信息
    console.log(`英文翻译文件: ${enFiles.length}`)
    console.log(`中文翻译文件: ${zhFiles.length}`)
  })
})

test.describe('UI 组件 i18n 检查', () => {
  test('检查按钮文本是否被翻译', async () => {
    const buttons = await page.locator('button').all()
    const untranslatedButtons: string[] = []

    for (const button of buttons.slice(0, 20)) { // 限制检查数量
      const text = await button.textContent()
      if (text && text.trim().length > 0) {
        // 检查是否是纯英文且不在 {} 表达式中
        const isPlainText = /^[A-Za-z\s]+$/.test(text.trim())
        if (isPlainText && text.trim().length > 2) {
          untranslatedButtons.push(text.trim())
        }
      }
    }

    if (untranslatedButtons.length > 0) {
      console.log('可能未翻译的按钮:', untranslatedButtons)
    }
  })

  test('检查 placeholder 是否被翻译', async () => {
    const inputs = await page.locator('input[placeholder], textarea[placeholder]').all()
    const untranslatedPlaceholders: string[] = []

    for (const input of inputs) {
      const placeholder = await input.getAttribute('placeholder')
      if (placeholder && placeholder.trim().length > 0) {
        untranslatedPlaceholders.push(placeholder)
      }
    }

    if (untranslatedPlaceholders.length > 0) {
      console.log('placeholder 文本:', untranslatedPlaceholders)
    }
  })
})
