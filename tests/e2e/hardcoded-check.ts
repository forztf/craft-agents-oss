/**
 * 硬编码字符串静态检测工具 (增强版)
 *
 * 用于在构建时/开发时扫描源代码中可能遗漏翻译的硬编码字符串
 *
 * 用法：
 *   bun run test:i18n
 *
 * 功能：
 *   1. 扫描 .tsx/.ts 文件中的硬编码字符串
 *   2. 检查 JSX 属性（placeholder, title, aria-label）
 *   3. 检查字符串字面量赋值
 *   4. 验证是否已使用 t() 函数
 *   5. 生成详细的 JSON 报告
 */

import * as fs from 'fs'
import * as path from 'path'

/**
 * 扫描结果类型
 */
interface HardcodedText {
  file: string
  line: number
  text: string
  type: 'jsx-text' | 'placeholder' | 'title' | 'aria-label' | 'string-literal' | 'label-attr' | 'value-attr'
  component?: string // 推测的组件名称
  context?: string // 上下文代码
  severity: 'high' | 'medium' | 'low'
}

/**
 * 扫描报告
 */
interface ScanReport {
  timestamp: string
  summary: {
    totalFiles: number
    totalIssues: number
    bySeverity: {
      high: number
      medium: number
      low: number
    }
    byType: Record<string, number>
  }
  issues: Record<string, HardcodedText[]>
  recommendations: string[]
}

/**
 * 不需要翻译的正则模式
 */
const IGNORE_PATTERNS = [
  // CSS 类名和 ID
  /^[a-z][a-z0-9\-_]*$/,
  // 技术术语和常量
  /^(className|id|type|name|value|onClick|onChange|onSubmit|href|src|alt|ref|key|data-[a-z-]+)$/,
  // 纯数字
  /^\d+$/,
  // URL
  /^https?:\/\/.+/,
  // 文件路径和导入
  /^\.\.?\//,
  /^[@/\w]+\//,
  /\.tsx?$/,
  /\.json$/,
  /\.md$/,
  // 变量名（小写驼峰）
  /^[a-z][a-zA-Z0-9]*$/,
  // 技术常量
  /^(api|http|https|json|xml|html|css|js|ts|tsx|pdf|md|git|url|uri|id|uuid|token|key|secret|ssl|tls)$/,
  // 状态码
  /^[0-9]{3}$/,
  // 短文本（2 字符以下）
  /^.{0,2}$/,
  // 字母数字 ID
  /^[a-f0-9\-_]{10,}$/i,
  // React/Frontend 专有属性
  /^(htmlFor|tabIndex|autoFocus|spellCheck|readOnly|disabled|required|placeholder)$/,
]

/**
 * 常见需要翻译的英文短语（用于优先级判断）
 */
const COMMON_PHRASES = [
  'cancel', 'close', 'save', 'delete', 'edit', 'add', 'remove', 'rename', 'copy',
  'paste', 'cut', 'undo', 'redo', 'search', 'filter', 'sort', 'clear', 'reset',
  'submit', 'continue', 'back', 'next', 'previous', 'finish', 'ok', 'yes', 'no',
  'apply', 'discard', 'loading', 'error', 'success', 'warning', 'info',
  'an error occurred', 'failed to', 'please enter', 'is required', 'invalid',
  'not found', 'already exists', 'try again', 'something went wrong',
  'are you sure', 'do you want', 'confirm', 'delete', 'remove', 'cancel',
  'general', 'settings', 'preferences', 'configuration', 'options',
  'appearance', 'theme', 'language', 'locale', 'notifications', 'security',
]

/**
 * 需要翻译的模式定义
 */
const TRANSLATE_PATTERNS = [
  {
    // JSX 文本内容（在 > 和 < 之间的英文文本）
    pattern: />([A-Z][a-zA-Z\s,.!?;:'"-]{4,100})</g,
    type: 'jsx-text' as const,
  },
  {
    // placeholder 属性
    pattern: /placeholder=(["'])([^"']{4,100})\1/g,
    type: 'placeholder' as const,
  },
  {
    // title 属性
    pattern: /title=(["'])([^"']{4,100})\1/g,
    type: 'title' as const,
  },
  {
    // aria-label 属性
    pattern: /aria-label=(["'])([^"']{4,100})\1/g,
    type: 'aria-label' as const,
  },
  {
    // label 属性
    pattern: /label=(["'])([^"']{4,100})\1/g,
    type: 'label-attr' as const,
  },
  {
    // value 属性（用于显示的文本）
    pattern: /value=(["'])([A-Z][a-zA-Z\s]{4,50})\1/g,
    type: 'value-attr' as const,
  },
  {
    // 对象属性赋值的字符串字面量
    pattern: /(?:label|text|message|error|description|hint|title|placeholder|content):\s*(["'])([A-Z][a-zA-Z\s,.!?;:'"-]{4,100})\1/g,
    type: 'string-literal' as const,
  },
]

/**
 * 检查文本是否应该被忽略
 */
function shouldIgnore(text: string): boolean {
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
 * 计算问题严重程度
 */
function calculateSeverity(text: string): 'high' | 'medium' | 'low' {
  const lowerText = text.toLowerCase()

  // 高优先级：包含常见短语
  if (COMMON_PHRASES.some(phrase => lowerText.includes(phrase))) {
    return 'high'
  }

  // 中优先级：长度适中，以大写字母开头
  if (text.length > 10 && /^[A-Z]/.test(text)) {
    return 'medium'
  }

  // 低优先级：短文本或小写开头的文本
  return 'low'
}

/**
 * 扫描单个文件
 */
function scanFile(filePath: string): HardcodedText[] {
  if (!fs.existsSync(filePath)) return []

  const results: HardcodedText[] = []
  const content = fs.readFileSync(filePath, 'utf-8')

  for (const { pattern, type } of TRANSLATE_PATTERNS) {
    const regex = new RegExp(pattern.source, pattern.flags)
    let match

    while ((match = regex.exec(content)) !== null) {
      // 提取文本（第二个捕获组，第一个是引号）
      const text = match[2] || match[1]

      // 检查是否已经被翻译
      const contextStart = Math.max(0, match.index - 40)
      const context = content.substring(contextStart, match.index)

      // 检查上下文中是否有 t() 或 useTranslation
      if (context.includes('t(') || context.includes('{t(') || context.includes('useTranslation')) {
        continue
      }

      if (shouldIgnore(text)) {
        continue
      }

      // 计算行号
      const lineNum = content.substring(0, match.index).split('\n').length

      // 计算严重程度
      const severity = calculateSeverity(text)

      // 获取上下文
      const contextSnippet = content.substring(
        Math.max(0, match.index - 60),
        Math.min(content.length, match.index + 60)
      ).trim()

      results.push({
        file: filePath,
        line: lineNum,
        text: text.trim(),
        type,
        context: contextSnippet,
        severity,
      })

      // 避免正则回踩问题
      const lastIndex = match.index
      regex.lastIndex = lastIndex + 1
    }
  }

  return results
}

/**
 * 扫描目录
 */
function scanDirectory(dir: string, extensions: string[]): HardcodedText[] {
  const results: HardcodedText[] = []

  const walk = (currentDir: string) => {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name)

      if (entry.isDirectory()) {
        // 跳过 node_modules 和隐藏目录
        if (entry.name === 'node_modules' || entry.name.startsWith('.')) {
          continue
        }
        walk(fullPath)
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name)
        if (extensions.includes(ext)) {
          results.push(...scanFile(fullPath))
        }
      }
    }
  }

  walk(dir)
  return results
}

/**
 * 生成建议
 */
function generateRecommendations(highCount: number, mediumCount: number, lowCount: number): string[] {
  const recommendations: string[] = []

  if (highCount > 0) {
    recommendations.push(`发现 ${highCount} 处高优先级硬编码文本，建议优先处理`)
  }

  if (mediumCount > 0) {
    recommendations.push(`发现 ${mediumCount} 处中优先级硬编码文本，应该逐步翻译`)
  }

  if (mediumCount < highCount * 0.1) {
    recommendations.push('高优先级问题占比过高，请统一审查翻译策略')
  }

  if (recommendations.length === 0) {
    recommendations.push('未发现重要问题，继续保持良好的国际化实践')
  }

  return recommendations
}

/**
 * 主函数
 */
function main() {
  const projectRoot = path.resolve(__dirname, '..', '..')
  const rendererPath = path.join(projectRoot, 'apps', 'electron', 'src', 'renderer')

  console.log('='.repeat(70))
  console.log('硬编码字符串检测报告 (增强版)')
  console.log('='.repeat(70))
  console.log(`扫描目录: ${rendererPath}`)
  console.log()

  const results = scanDirectory(rendererPath, ['.tsx', '.ts'])

  // 按文件分组
  const grouped = new Map<string, HardcodedText[]>()

  for (const item of results) {
    const existing = grouped.get(item.file) || []
    // 去重
    if (!existing.some(e => e.text === item.text && e.line === item.line)) {
      existing.push(item)
    }
    grouped.set(item.file, existing)
  }

  // 统计
  const bySeverity = {
    high: results.filter(r => r.severity === 'high').length,
    medium: results.filter(r => r.severity === 'medium').length,
    low: results.filter(r => r.severity === 'low').length,
  }

  const byType: Record<string, number> = {}
  for (const item of results) {
    byType[item.type] = (byType[item.type] || 0) + 1
  }

  // 输出摘要
  console.log('📊 扫描摘要')
  console.log('-'.repeat(70))
  console.log(`扫描文件数: ${grouped.size}`)
  console.log(`发现问题数: ${results.length}`)
  console.log()
  console.log('按严重程度:')
  console.log(`  🔴 高优先级: ${bySeverity.high}`)
  console.log(`  🟡 中优先级: ${bySeverity.medium}`)
  console.log(`  🟢 低优先级: ${bySeverity.low}`)
  console.log()
  console.log('按类型:')
  Object.entries(byType).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`)
  })

  // 输出问题详情
  if (results.length > 0) {
    console.log('\n📋 问题详情')
    console.log('='.repeat(70))

    // 按严重程度排序文件（高优先级的文件排在前面）
    const filesBySeverity = Array.from(grouped.entries()).sort(
      (a, b) => {
        const aHigh = a[1].filter(i => i.severity === 'high').length
        const bHigh = b[1].filter(i => i.severity === 'high').length
        return bHigh - aHigh
      }
    )

    for (const [file, items] of filesBySeverity.slice(0, 20)) {
      const relativePath = path.relative(projectRoot, file)
      console.log(`\n📄 ${relativePath}`)
      console.log('-'.repeat(70))

      // 按行号排序
      const sortedItems = items.sort((a, b) => a.line - b.line)

      for (const item of sortedItems.slice(0, 10)) {
        const icon = item.severity === 'high' ? '🔴' : item.severity === 'medium' ? '🟡' : '🟢'
        console.log(`  ${icon} L${item.line} [${item.type}]: "${item.text}"`)
      }
      if (items.length > 10) {
        console.log(`  ... 还有 ${items.length - 10} 个问题`)
      }
    }

    if (filesBySeverity.length > 20) {
      console.log(`\n... 还有 ${filesBySeverity.length - 20} 个文件有问题`)
    }
  }

  // 生成建议
  const recommendations = generateRecommendations(bySeverity.high, bySeverity.medium, bySeverity.low)
  console.log('\n💡 建议')
  console.log('='.repeat(70))
  recommendations.forEach((rec, i) => {
    console.log(`${i + 1}. ${rec}`)
  })

  // 保存 JSON 报告
  const reportPath = path.join(projectRoot, 'test-results', 'hardcoded-check-report.json')
  fs.mkdirSync(path.dirname(reportPath), { recursive: true })

  const report: ScanReport = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: grouped.size,
      totalIssues: results.length,
      bySeverity,
      byType,
    },
    issues: Object.fromEntries(grouped),
    recommendations,
  }

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

  console.log('\n' + '='.repeat(70))
  console.log(`详细报告已保存到: ${reportPath}`)
  console.log('='.repeat(70))

  // 返回退出码
  process.exit(bySeverity.high > 50 ? 1 : 0)
}

main()