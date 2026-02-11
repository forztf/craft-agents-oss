/**
 * i18n 检测和验证脚本
 *
 * 用法：
 *   bun run test:i18n
 *
 * 功能：
 *   1. 扫描源码中的硬编码字符串
 *   2. 检查翻译文件完整性
 *   3. 验证 t() 调用格式
 */

import * as fs from 'fs'
import * as path from 'path'

const projectRoot = path.resolve(__dirname, '..', '..')
const rendererPath = path.join(projectRoot, 'apps', 'electron', 'src', 'renderer')
const localesPath = path.join(projectRoot, 'i18n', 'locales')

interface Issue {
  type: 'hardcoded' | 'missing-translation' | 'format-error'
  file: string
  line: number
  message: string
  severity: 'error' | 'warning'
}

const issues: Issue[] = []

// 需要翻译的模式
const TRANSLATE_PATTERNS = [
  { pattern: /placeholder=["']([^"']+)["']/g, attr: 'placeholder' },
  { pattern: /title=["']([^"']+)["']/g, attr: 'title' },
  { pattern: /aria-label=["']([^"']+)["']/g, attr: 'aria-label' },
  { pattern: /(?:label|text|message|error|description|hint):\s*["']([^"']+)["']/g, attr: 'property' },
]

// 忽略的模式
const IGNORE_PATTERNS = [
  /^[a-z][a-z0-9\-_]*$/,  // CSS 类名
  /^\d+$/,  // 纯数字
  /^https?:\/\//,  // URL
  /^\.\.?\//,  // 文件路径
  /^.{0,2}$/,  // 太短
]

function shouldIgnore(text: string): boolean {
  return IGNORE_PATTERNS.some(p => p.test(text.trim()))
}

function checkFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')
  const relativePath = path.relative(projectRoot, filePath)

  // 检查硬编码字符串
  for (const { pattern, attr } of TRANSLATE_PATTERNS) {
    let match
    const regex = new RegExp(pattern.source, pattern.flags)

    while ((match = regex.exec(content)) !== null) {
      const text = match[1]
      const contextStart = Math.max(0, match.index - 50)
      const context = content.substring(contextStart, match.index)

      // 跳过已翻译的
      if (context.includes('t(') || context.includes('{t(')) continue
      if (shouldIgnore(text)) continue

      const lineNum = content.substring(0, match.index).split('\n').length

      issues.push({
        type: 'hardcoded',
        file: relativePath,
        line: lineNum,
        message: `[${attr}] "${text}"`,
        severity: 'warning',
      })
    }
  }

  // 检查 t() 调用格式（应该使用原文作为 key）
  const tCallPattern = /t\(['"`]([^'"`]+)['"`]/g
  let tMatch
  while ((tMatch = tCallPattern.exec(content)) !== null) {
    const key = tMatch[1]

    // 检查是否使用了缩写格式的 key（不推荐）
    if (/^[a-z_]+$/.test(key) && key.length < 20 && !key.includes(' ')) {
      const lineNum = content.substring(0, tMatch.index).split('\n').length

      issues.push({
        type: 'format-error',
        file: relativePath,
        line: lineNum,
        message: `建议使用原文作为 key: t('${key}') → t('Full English text')`,
        severity: 'warning',
      })
    }
  }
}

function checkTranslationFiles() {
  const enPath = path.join(localesPath, 'en')
  const zhPath = path.join(localesPath, 'zh-CN')

  const getFiles = (dir: string, base: string = ''): string[] => {
    const files: string[] = []
    if (!fs.existsSync(dir)) return files

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name)
      const relativePath = path.join(base, entry.name)

      if (entry.isDirectory()) {
        files.push(...getFiles(fullPath, relativePath))
      } else if (entry.name.endsWith('.json')) {
        files.push(relativePath)
      }
    }
    return files
  }

  const enFiles = getFiles(enPath)
  const zhFiles = getFiles(zhPath)

  // 检查缺失的翻译文件
  for (const file of enFiles) {
    if (!zhFiles.includes(file)) {
      issues.push({
        type: 'missing-translation',
        file: `i18n/locales/zh-CN/${file}`,
        line: 0,
        message: '缺少中文翻译文件',
        severity: 'error',
      })
    }
  }
}

// 需要跳过的目录
const SKIP_DIRS = [
  'node_modules',
  'playground',      // 开发测试用
  '__tests__',       // 测试文件
  '__mocks__',       // Mock 文件
]

function scanDirectory(dir: string) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      if (entry.name.startsWith('.') || SKIP_DIRS.includes(entry.name)) continue
      scanDirectory(fullPath)
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
      checkFile(fullPath)
    }
  }
}

function main() {
  console.log('🔍 开始 i18n 检测...\n')

  // 扫描源码
  console.log('📁 扫描源码目录:', rendererPath)
  scanDirectory(rendererPath)

  // 检查翻译文件
  console.log('📁 检查翻译文件完整性...')
  checkTranslationFiles()

  // 输出结果
  console.log('\n' + '='.repeat(60))
  console.log('检测结果')
  console.log('='.repeat(60))

  const errors = issues.filter(i => i.severity === 'error')
  const warnings = issues.filter(i => i.severity === 'warning')

  // 按文件分组
  const grouped = new Map<string, Issue[]>()
  for (const issue of issues) {
    const existing = grouped.get(issue.file) || []
    existing.push(issue)
    grouped.set(issue.file, existing)
  }

  for (const [file, fileIssues] of grouped) {
    console.log(`\n📄 ${file}`)
    console.log('-'.repeat(50))
    for (const issue of fileIssues) {
      const icon = issue.severity === 'error' ? '❌' : '⚠️'
      console.log(`  ${icon} L${issue.line}: ${issue.message}`)
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log(`总计: ${errors.length} 个错误, ${warnings.length} 个警告`)
  console.log('='.repeat(60))

  // 保存报告
  const reportPath = path.join(projectRoot, 'test-results', 'i18n-check-report.json')
  fs.mkdirSync(path.dirname(reportPath), { recursive: true })
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: { errors: errors.length, warnings: warnings.length },
    issues,
  }, null, 2))

  console.log(`\n📝 详细报告: ${reportPath}`)

  // 返回退出码
  process.exit(errors.length > 0 ? 1 : 0)
}

main()
