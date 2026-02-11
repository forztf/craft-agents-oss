/**
 * i18n 工具函数
 *
 * 提供测试和验证国际化改造所需的工具函数
 */

import type { Page } from '@playwright/test'

/**
 * i18n 问题类型
 */
export interface I18nIssue {
  type: 'hardcoded-text' | 'missing-translation' | 'ui-untranslated' | 'key-not-found'
  location: string
  description: string
  severity: 'error' | 'warning' | 'info'
}

/**
 * 文本检测结果
 */
export interface TextDetectionResult {
  text: string
  selector: string
  type: 'button' | 'input' | 'textarea' | 'span' | 'div' | 'a' | 'label' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'other'
}

/**
 * 需要忽略的词汇列表（常见术语、技术名词等）
 */
export const IGNORE_WORDS = new Set([
  // 技术术语
  'API', 'AI', 'JSON', 'URL', 'HTTP', 'HTTPS', 'SSH', 'TLS', 'SSL',
  'Git', 'Bash', 'CLI', 'SDK', 'MCP', 'API', 'OAuth',
  'npm', 'Node', 'TypeScript', 'JavaScript', 'Vite', 'Electron',
  // 模型名称
  'Claude', 'ChatGPT', 'OpenAI', 'Anthropic', 'Opus', 'Sonnet', 'Haiku',
  'Codex', 'Gemini', 'Droid', 'Ollama',
  // 常见缩写
  'OK', 'ID', 'JSON', 'XML', 'HTML', 'CSS',
  'CPU', 'GPU', 'RAM', 'SSD', 'HDD',
  // 常见单字符
  '×', '→', '←', '↑', '↓', '+', '-', '*', '/', '%',
  // 通用符号和常见不翻译词汇
  '-', '|', '/', '\\',
  // 测试用占位符
  'Lorem ipsum', 'test', 'example.com',
  // 短文本（可能是图标或分隔符）
  '', ' ', '  ', '\n', '\t',
])

/**
 * 不需要翻译的模式（正则表达式）
 */
export const IGNORE_PATTERNS = [
  // 纯数字
  /^\d+$/,
  // 纯符号
  /^[^a-zA-Z\u4e00-\u9fa5]+$/,
  // 短于 3 个字符且不包含中文
  /^.{0,2}$/,
  // URL
  /^https?:\/\//,
  // 文件路径
  /^[\/\\~]/,
  // 技术变量名格式
  /^[a-z][a-zA-Z0-9_]*$/,
  // 常见技术术语
  /^(Enter|Esc|Ctrl|Cmd|Shift|Alt|Tab)$/i,
  // 版本号
  /^\d+\.\d+(\.\d+)?$/,
  // 单个字母
  /^[a-zA-Z]$/,
  // 仅包含标点符号
  /^[^\w\u4e00-\u9fa5]+$/,
  // 路径分隔符
  /^[\/\\]+$/,
  // 代码片段
  /^\s*[\w\[\]{}()<>=,.;:"'!@#$%^&*|~`-]+\s*$/,
  // 短于 3 个字符
  /^.{0,2}$/,
  // 单个中文字符
  /^[\u4e00-\u9fa5]$/,
  // 常见表情符号
  /^[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]+$/u,
]

/**
 * 可能需要翻译的英文文本模式
 */
export const SUSPICIOUS_PATTERNS = [
  // 通用 UI 文本（按钮、操作）
  /\b(Click here|Click|Submit|Cancel|Save|Delete|Edit|Add|Remove|Close|Open|Load|Loading|Save|Saved)\b/gi,
  /\b(Yes|No|OK|Apply|Back|Next|Previous|Skip|Finish|Done|Retry|Try again)\b/gi,
  // 错误和状态
  /\b(Error|Warning|Success|Info|Alert|Notice|Message|Notification)\b/gi,
  /\b(An error occurred|Failed to|Please enter|is required|Invalid|Missing|Not found|Access denied)\b/gi,
  /\b(Loading...|Updating...|Saving...|Processing...|Connecting...)\b/gi,
  // 设置和配置
  /\b(General|Settings|Preferences|Configuration|Options|Setup|Install|Update)\b/gi,
  /\b(Enable|Disable|Turn on|Turn off|Show|Hide|Default|Reset)\b/gi,
  // 输入提示
  /\b(Please|Enter your|Type|Search|Filter|Select|Choose|Pick)\b/gi,
  /\b(Email|Password|Username|Name|Title|Description|Note|Comment)\b/gi,
  // 文件和目录
  /\b(File|Folder|Directory|Path|Location|Browse|Open|Download|Upload)\b/gi,
  // 导航
  /\b(Home|Dashboard|Home|Profile|Help|Support|About|Contact|Terms|Privacy)\b/gi,
  /\b(Menu|Close|Back|Forward|Refresh|History|Favorites|Bookmarks)\b/gi,
]

/**
 * 检查文本是否应该被忽略（不需要翻译）
 */
export function shouldIgnoreText(text: string): boolean {
  const trimmed = text.trim()

  // 检查是否在忽略列表中
  if (IGNORE_WORDS.has(trimmed)) {
    return true
  }

  // 检查是否匹配忽略模式
  for (const pattern of IGNORE_PATTERNS) {
    if (pattern.test(trimmed)) {
      return true
    }
  }

  return false
}

/**
 * 检查文本是否可能是需要翻译的硬编码文本
 */
export function isSuspiciousText(text: string): boolean {
  const trimmed = text.trim()

  // 先跳过应该忽略的文本
  if (shouldIgnoreText(trimmed) || !trimmed) {
    return false
  }

  // 检查是否包含中文（说明已经翻译或原本就是中文）
  if (/[\u4e00-\u9fa5]/.test(trimmed)) {
    return false
  }

  // 检查是否包含空格（可能是短语而非单词）
  const hasSpaces = /\s+/.test(trimmed)

  // 长文本或包含空格的英文文本需要翻译
  if (trimmed.length > 10 || hasSpaces) {
    return true
  }

  // 检查是否匹配可疑模式
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(trimmed)) {
      return true
    }
  }

  return false
}

/**
 * 检测页面中可能未翻译的文本
 */
export async function detectUntranslatedText(
  page: Page,
  options: {
    selector?: string
    maxElements?: number
  } = {}
): Promise<TextDetectionResult[]> {
  const { selector = 'body', maxElements = 1000 } = options
  const results: TextDetectionResult[] = []

  // 获取页面上所有可见文本元素
  const elements = await page.locator(selector).all()
  const count = Math.min(elements.length, maxElements)

  for (let i = 0; i < count; i++) {
    const element = elements[i]
    const tagName = await element.evaluate(el => el.tagName.toLowerCase())

    // 检查元素的文本内容
    const text = await element.textContent()

    if (text && isSuspiciousText(text)) {
      // 获取元素的 selector
      let elementSelector = await element.evaluate(el => {
        // 尝试找到元素的唯一标识
        if ('dataset' in el) {
          const dataTestid = (el as HTMLElement).dataset.testid
          if (dataTestid) {
            return `[data-testid="${dataTestid}"]`
          }
        }

        // 获取元素的标签和其他属性来构建 selector
        const tagName = el.tagName.toLowerCase()
        const classes = (el as HTMLElement).className.split(' ').filter((c: string) => c).slice(0, 2).join('.')

        if (classes) {
          return `${tagName}.${classes}`
        }

        return tagName
      })

      results.push({
        text: text.trim(),
        selector: elementSelector,
        type: tagName as any,
      })

      // 限制结果数量
      if (results.length >= 50) {
        break
      }
    }
  }

  return results
}

/**
 * 检测页面输入框和文本域的 placeholder
 */
export async function detectUntranslatedPlaceholders(page: Page): Promise<TextDetectionResult[]> {
  const results: TextDetectionResult[] = []

  // 检查 input
  const inputs = await page.locator('input[placeholder], textarea[placeholder]').all()

  for (const input of inputs) {
    const placeholder = await input.getAttribute('placeholder')
    const tagName = await input.evaluate(el => el.tagName.toLowerCase())

    if (placeholder && placeholder.trim() && isSuspiciousText(placeholder)) {
      results.push({
        text: placeholder.trim(),
        selector: `input[placeholder="${placeholder}"]`,
        type: tagName as any,
      })
    }
  }

  return results
}

/**
 * 检测页面按钮文本
 */
export async function detectUntranslatedButtons(page: Page): Promise<TextDetectionResult[]> {
  const results: TextDetectionResult[] = []

  const buttons = await page.locator('button').all()

  for (const button of buttons) {
    const text = await button.textContent()

    if (text && text.trim() && isSuspiciousText(text)) {
      const buttonText = text.trim()

      // 获取按钮的 selector
      let buttonSelector = await button.evaluate(el => {
        if ('dataset' in el) {
          const dataTestid = (el as HTMLElement).dataset.testid
          if (dataTestid) {
            return `button[data-testid="${dataTestid}"]`
          }
        }
        return `button`
      })

      results.push({
        text: buttonText,
        selector: buttonSelector,
        type: 'button',
      })
    }
  }

  return results
}

/**
 * 检测标题元素
 */
export async function detectUntranslatedHeadings(page: Page): Promise<TextDetectionResult[]> {
  const results: TextDetectionResult[] = []

  const headingTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']

  for (const tag of headingTags) {
    const headings = await page.locator(tag).all()

    for (const heading of headings) {
      const text = await heading.textContent()

      if (text && text.trim() && isSuspiciousText(text)) {
        let headingSelector = await heading.evaluate(el => {
          if ('dataset' in el) {
            const dataTestid = (el as HTMLElement).dataset.testid
            if (dataTestid) {
              return `${tag}[data-testid="${dataTestid}"]`
            }
          }
          return tag
        })

        results.push({
          text: text.trim(),
          selector: headingSelector,
          type: tag as any,
        })
      }
    }
  }

  return results
}

/**
 * 检测页面特定区域的硬编码文本
 */
export async function detectHardcodedTextInRegion(
  page: Page,
  regionSelector: string
): Promise<TextDetectionResult[]> {
  const region = page.locator(regionSelector)
  const isVisible = await region.isVisible({ timeout: 2000 }).catch(() => false)

  if (!isVisible) {
    return []
  }

  return detectUntranslatedText(page, { selector: regionSelector })
}

/**
 * 生成 i18n 检测报告
 */
export function generateI18nReport(
  results: {
    untranslatedTexts?: TextDetectionResult[]
    placeholders?: TextDetectionResult[]
    buttons?: TextDetectionResult[]
    headings?: TextDetectionResult[]
    regions?: { name: string; results: TextDetectionResult[] }[]
  }
): string {
  const lines: string[] = []
  lines.push('\n' + '='.repeat(60))
  lines.push('i18n 检测报告')
  lines.push('='.repeat(60))
  lines.push('')

  const totalIssues =
    (results.untranslatedTexts?.length || 0) +
    (results.placeholders?.length || 0) +
    (results.buttons?.length || 0) +
    (results.headings?.length || 0) +
    (results.regions?.reduce((sum, r) => sum + r.results.length, 0) || 0)

  lines.push(`总共发现 ${totalIssues} 个潜在问题`)
  lines.push('')

  // 未翻译文本
  if (results.untranslatedTexts && results.untranslatedTexts.length > 0) {
    lines.push(`📝 未翻译文本 (${results.untranslatedTexts.length})`)
    lines.push('-'.repeat(40))

    const uniqueTexts = new Set(results.untranslatedTexts.map(t => t.text))
    for (const text of uniqueTexts) {
      lines.push(`  • "${text}"`)
    }
    lines.push('')
  }

  // Placeholder
  if (results.placeholders && results.placeholders.length > 0) {
    lines.push(`📝 未翻译 Placeholder (${results.placeholders.length})`)
    lines.push('-'.repeat(40))

    for (const item of results.placeholders.slice(0, 10)) {
      lines.push(`  • ${item.selector}: "${item.text}"`)
    }
    lines.push('')
  }

  // 按钮
  if (results.buttons && results.buttons.length > 0) {
    lines.push(`🔘 未翻译按钮 (${results.buttons.length})`)
    lines.push('-'.repeat(40))

    const uniqueButtons = new Set(results.buttons.map(b => b.text))
    for (const text of uniqueButtons) {
      lines.push(`  • "${text}"`)
    }
    lines.push('')
  }

  // 标题
  if (results.headings && results.headings.length > 0) {
    lines.push(`📋 未翻译标题 (${results.headings.length})`)
    lines.push('-'.repeat(40))

    for (const item of results.headings) {
      lines.push(`  • ${item.type}: "${item.text}"`)
    }
    lines.push('')
  }

  // 区域检测
  if (results.regions && results.regions.length > 0) {
    lines.push(`📂 区域检测`)
    lines.push('-'.repeat(40))

    for (const region of results.regions) {
      if (region.results.length > 0) {
        lines.push(`  ${region.name}: ${region.results.length} 个问题`)
      }
    }
    lines.push('')
  }

  lines.push('='.repeat(60))
  lines.push('报告生成完成')
  lines.push('='.repeat(60))

  return lines.join('\n')
}

/**
 * 将检测结果转换为 JSON 格式
 */
export function resultsToJson(results: {
  untranslatedTexts?: TextDetectionResult[]
  placeholders?: TextDetectionResult[]
  buttons?: TextDetectionResult[]
  headings?: TextDetectionResult[]
  regions?: { name: string; results: TextDetectionResult[] }[]
}): string {
  return JSON.stringify(
    {
      timestamp: new Date().toISOString(),
      summary: {
        total:
          (results.untranslatedTexts?.length || 0) +
          (results.placeholders?.length || 0) +
          (results.buttons?.length || 0) +
          (results.headings?.length || 0) +
          (results.regions?.reduce((sum, r) => sum + r.results.length, 0) || 0),
        untranslatedTexts: results.untranslatedTexts?.length || 0,
        placeholders: results.placeholders?.length || 0,
        buttons: results.buttons?.length || 0,
        headings: results.headings?.length || 0,
      },
      results,
    },
    null,
    2
  )
}
