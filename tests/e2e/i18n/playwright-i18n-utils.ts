/**
 * Playwright 自动化测试工具集 - i18n 检测模块
 *
 * @module playwright-i18n-utils
 * @description 提供检测硬编码字符串和验证 i18n 改进的工具函数
 */

import * as fs from 'fs'
import * as path from 'path'

export interface HardcodedText {
  file: string
  line: number
  text: string
  type: 'jsx-text' | 'placeholder' | 'title' | 'aria-label' | 'string-literal' | 'button-text'
  severity: 'error' | 'warning' | 'info'
}

export interface TranslationCheckResult {
  totalFiles: number
  totalIssues: number
  errors: HardcodedText[]
  warnings: HardcodedText[]
  info: HardcodedText[]
  fileStats: Map<string, { issues: number; errors: number; warnings: number }>
}

/**
 * 不需要翻译的模式配置
 */
export const IGNORE_PATTERNS = [
  // CSS 类名和变量
  /^[a-z][a-z0-9\-_]*$/,
  // 技术术语和属性名
  /^(className|id|type|name|value|onClick|onChange|onSubmit|href|src|alt|key|ref)$/,
  // 短于 3 个字符
  /^.{0,2}$/,
  // 纯数字
  /^\d+$/,
  // URL
  /^https?:\/\//,
  // 文件路径
  /^\.\.?\//,
  // 变量名格式 (camelCase)
  /^[a-z][a-zA-Z0-9]*$/,
  // 匹配正则表达式的部分内容
  /^[\\[\]^()*+?.{}]$/,
  // 特殊字符
  /^[.,;:!?]+$/,
]

/**
 * 需要翻译的模式配置
 */
export const TRANSLATE_PATTERNS = [
  // JSX 文本内容（包含空格的英文短语）
  { pattern: />([A-Z][a-zA-Z\s]{3,80})</g, type: 'jsx-text' as const, severity: 'warning' as const },
  // placeholder
  { pattern: /placeholder=["']([^"']{3,80})["']/g, type: 'placeholder' as const, severity: 'warning' as const },
  // title
  { pattern: /title=["']([^"']{3,80})["']/g, type: 'title' as const, severity: 'warning' as const },
  // aria-label
  { pattern: /aria-label=["']([^"']{3,80})["']/g, type: 'aria-label' as const, severity: 'warning' as const },
  // 字符串字面量赋值给文本属性
  { pattern: /(?:label|text|message|error|description|hint|heading):\s*["']([^"']{3,80})["']/g, type: 'string-literal' as const, severity: 'warning' as const },
]

/**
 * 常见的英文 UI 文本模式（高度提示需要翻译）
 */
export const COMMON_UI_PATTERNS = [
  // 按钮文本
  /\b(Click here|Submit|Cancel|Save|Delete|Edit|Add|Remove|Close|Open|Continue|Back|Next|Previous|OK|Yes|No|Confirm)\b/gi,
  // 状态文本
  /\b(Loading|Error|Success|Warning|Failed|Pending|Completed|In Progress)\b/gi,
  // 表单相关
  /\b(Enter your name|Enter a name|Type to search|Search|Filter|Clear|Reset)\b/gi,
  // 通用提示
  /\b(An error occurred|Failed to|Please enter|is required|Invalid|Please try again)\b/gi,
  // 设置相关
  /\b(General|Settings|Preferences|Configuration|Appearance|Theme|Language)\b/gi,
  // 导航
  /\b(Home|Dashboard|Profile|Account|Logout|Sign in|Sign out|Sign up|Login)\b/gi,
  // 操作
  /\b(Download|Upload|Share|Copy|Paste|Cut|Undo|Redo)\b/gi,
  // 对话框
  /\b(Are you sure|Do you want to|This action cannot be undone|Discard changes)\b/gi,
]

/**
 * 检查文本是否应该被忽略
 */
export function shouldIgnore(text: string): boolean {
  const trimmed = text.trim()
  for (const pattern of IGNORE_PATTERNS) {
    if (pattern.test(trimmed)) {
      return true
    }
  }
  return false
}

/**
 * 检查文本是否已使用 t() 函数翻译
 */
export function isTranslated(text: string, context: string): boolean {
  // 检查上下文中有 t(...) 调用
  const tCallPattern = /t\s*\(\s*["'`]/
  if (tCallPattern.test(context)) {
    return true
  }
  // 检查 {t(...)} JSX 表达式
  const jsxTCallPattern = /\{\s*t\s*\(\s*["'`]/
  if (jsxTCallPattern.test(context)) {
    return true
  }
  return false
}

/**
 * 扫描单个文件中的硬编码字符串
 */
export function scanFile(filePath: string): HardcodedText[] {
  const results: HardcodedText[] = []
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')

  for (const { pattern, type, severity } of TRANSLATE_PATTERNS) {
    let match
    const regex = new RegExp(pattern.source, pattern.flags)

    while ((match = regex.exec(content)) !== null) {
      const text = match[1]

      // 获取匹配前的上下文
      const contextStart = Math.max(0, match.index - 100)
      const context = content.substring(contextStart, match.index)

      // 跳过已翻译的
      if (isTranslated(text, context)) {
        continue
      }

      // 跳过应该忽略的
      if (shouldIgnore(text)) {
        continue
      }

      // 计算行号
      const lineNum = content.substring(0, match.index).split('\n').length

      results.push({
        file: filePath,
        line: lineNum,
        text: text.trim(),
        type,
        severity,
      })
    }
  }

  return results
}

/**
 * 扫描目录中的所有文件
 */
export function scanDirectory(
  dir: string,
  extensions: string[] = ['.tsx', '.ts'],
  skipDirs: string[] = ['node_modules', '__tests__', '.git', 'dist']
): HardcodedText[] {
  const results: HardcodedText[] = []

  const walk = (currentDir: string) => {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name)

      if (entry.isDirectory()) {
        // 跳过指定的目录
        if (skipDirs.includes(entry.name) || entry.name.startsWith('.')) {
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
 * 去重结果
 */
export function deduplicateResults(results: HardcodedText[]): HardcodedText[] {
  const seen = new Set<string>()
  const unique: HardcodedText[] = []

  for (const item of results) {
    const key = `${item.file}:${item.line}:${item.text}`
    if (!seen.has(key)) {
      seen.add(key)
      unique.push(item)
    }
  }

  return unique
}

/**
 * 检查翻译文件的完整性
 */
export function checkTranslationIntegrity(
  projectRoot: string
): { missingInZh: string[]; missingInEn: string[]; enFiles: string[]; zhFiles: string[] } {
  const localesPath = path.join(projectRoot, 'i18n', 'locales')
  const enPath = path.join(localesPath, 'en')
  const zhPath = path.join(localesPath, 'zh-CN')

  const getJsonFiles = (dir: string, base: string = ''): string[] => {
    const files: string[] = []
    if (!fs.existsSync(dir)) return files

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name)
      const relativePath = path.join(base, entry.name)

      if (entry.isDirectory()) {
        files.push(...getJsonFiles(fullPath, relativePath))
      } else if (entry.name.endsWith('.json')) {
        files.push(relativePath)
      }
    }
    return files
  }

  const enFiles = getJsonFiles(enPath)
  const zhFiles = getJsonFiles(zhPath)

  const missingInZh = enFiles.filter(f => !zhFiles.includes(f))
  const missingInEn = zhFiles.filter(f => !enFiles.includes(f))

  return { missingInZh, missingInEn, enFiles, zhFiles }
}

/**
 * 生成测试报告
 */
export function generateReport(
  results: HardcodedText[],
  projectRoot: string,
  outputPath?: string
): TranslationCheckResult {
  const unique = deduplicateResults(results)
  const fileStats = new Map<string, { issues: number; errors: number; warnings: number }>()

  // 统计每个文件的问题
  for (const item of unique) {
    const relativePath = path.relative(projectRoot, item.file)
    const stats = fileStats.get(relativePath) || { issues: 0, errors: 0, warnings: 0 }

    stats.issues++
    if (item.severity === 'error') {
      stats.errors++
    } else if (item.severity === 'warning') {
      stats.warnings++
    }

    fileStats.set(relativePath, stats)
  }

  const checkResult: TranslationCheckResult = {
    totalFiles: fileStats.size,
    totalIssues: unique.length,
    errors: unique.filter(i => i.severity === 'error'),
    warnings: unique.filter(i => i.severity === 'warning'),
    info: unique.filter(i => i.severity === 'info'),
    fileStats,
  }

  // 保存报告到文件
  if (outputPath) {
    const reportDir = path.dirname(outputPath)
    fs.mkdirSync(reportDir, { recursive: true })

    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: checkResult.totalFiles,
        totalIssues: checkResult.totalIssues,
        errors: checkResult.errors.length,
        warnings: checkResult.warnings.length,
      },
      files: Object.fromEntries(
        Array.from(fileStats.entries()).map(([file, stats]) => [
          file,
          {
            ...stats,
            issues: unique.filter(i => path.relative(projectRoot, i.file) === file),
          },
        ])
      ),
    }

    fs.writeFileSync(outputPath, JSON.stringify(reportData, null, 2), 'utf-8')
  }

  return checkResult
}

/**
 * 打印控制台报告
 */
export function printConsoleReport(result: TranslationCheckResult): void {
  console.log('\n' + '='.repeat(70))
  console.log('🔍 i18n 遗漏翻译检测结果')
  console.log('='.repeat(70))
  console.log(`扫描文件数: ${result.totalFiles}`)
  console.log(`发现问题数: ${result.totalIssues}`)
  console.log(`  ❌ 错误: ${result.errors.length}`)
  console.log(`  ⚠️  警告: ${result.warnings.length}`)
  console.log(`  ℹ️  信息: ${result.info.length}`)
  console.log('='.repeat(70))

  // 按严重程度和文件分组显示
  for (const severity of ['error', 'warning'] as const) {
    const issues = result[severity === 'error' ? 'errors' : 'warnings']
    if (issues.length === 0) continue

    console.log(`\n${severity === 'error' ? '❌' : '⚠️'} ${severity.toUpperCase()} 问题 (${issues.length} 个):\n`)

    // 按文件分组
    const groupedByFile = new Map<string, typeof issues>()
    for (const issue of issues) {
      const relativePath = path.basename(issue.file)
      const existing = groupedByFile.get(relativePath) || []
      existing.push(issue)
      groupedByFile.set(relativePath, existing)
    }

    for (const [file, fileIssues] of groupedByFile.entries()) {
      console.log(`📄 ${file}`)
      for (const issue of fileIssues.slice(0, 5)) { // 限制每个文件显示前5个
        console.log(`  ${issue.type.padEnd(15)} L${issue.line}: "${issue.text}"`)
      }
      if (fileIssues.length > 5) {
        console.log(`  ... 还有 ${fileIssues.length - 5} 个问题`)
      }
      console.log()
    }
  }

  console.log('='.repeat(70))
}
