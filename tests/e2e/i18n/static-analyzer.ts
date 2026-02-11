/**
 * 源代码静态分析工具 - 硬编码字符串检测
 *
 * 扫描所有 TypeScript/TSX 文件，检测可能遗漏翻译的硬编码字符串
 */

import * as fs from 'fs'
import * as path from 'path'

interface HardcodedString {
  file: string
  line: number
  column: number
  text: string
  type: 'jsx-text' | 'string-literal' | 'template-literal'
}

interface NamingConventionIssue {
  file: string
  line: number
  column: number
  key: string
  suggestion?: string
  type: 'short-key' | 'underscore-key' | 'non-readable-key'
}

interface AnalysisResult {
  totalFiles: number
  totalIssues: number
  namingIssues: number
  files: Map<string, HardcodedString[]>
  namingIssuesByFile: Map<string, NamingConventionIssue[]>
}

// 需要翻译的常见文本模式
const TRANSLATE_PATTERNS = {
  // JSX 文本：英文用户文本，大写字母开头
  jsxText: />([A-Z][a-zA-Z\s,\.\!?]{3,50})</g,

  // 字符串字面量：赋值给常见UI属性
  stringLiteral: /(?:(?:label|title|placeholder|text|message|error|description|hint|aria-label|heading):\s*)["']([A-Z][a-zA-Z\s,\.\!?]{3,100})["']/g,

  // 模板字符串：动态构建的文本
  templateLiteral: /`([A-Z][a-zA-Z\s,\.\!?]{3,100})`/g,
}

// 应该忽略的文本模式（技术术语、代码等）
const IGNORE_PATTERNS = [
  // CSS 类名
  /^[a-z][a-z0-9\-_]*$/,
  // 常量名
  /^[A-Z][A-Z0-9_]*$/,
  // 短文本（< 3字符）
  /^.{0,2}$/,
  // 纯数字
  /^\d+$/,
  // URL
  /^https?:\/\//,
  // 文件路径
  /^\.\.?\//,
  // 单词模式（变量名等）
  /^[a-z][a-zA-Z0-9]*$/,
]

function shouldIgnore(text: string): boolean {
  const trimmed = text.trim()
  return IGNORE_PATTERNS.some(pattern => pattern.test(trimmed))
}

function analyzeFile(filePath: string): HardcodedString[] {
  const issues: HardcodedString[] = []
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')

  // 分析 JSX 文本
  let match
  const jsxRegex = new RegExp(TRANSLATE_PATTERNS.jsxText.source, 'g')
  while ((match = jsxRegex.exec(content)) !== null) {
    const text = match[1].trim()

    // 检查上下文：如果附近有 t() 或 {t(}，则已翻译
    const contextStart = Math.max(0, match.index - 50)
    const context = content.substring(contextStart, match.index)

    if (context.includes('t(') || shouldIgnore(text)) {
      continue
    }

    // 计算行号和列号
    const textBefore = content.substring(0, match.index)
    const lineNum = textBefore.split('\n').length
    const columnNum = textBefore.lastIndexOf('\n') >= 0
      ? textBefore.length - textBefore.lastIndexOf('\n') - 1
      : textBefore.length

    issues.push({
      file: path.relative(process.cwd(), filePath),
      line: lineNum,
      column: columnNum,
      text,
      type: 'jsx-text',
    })
  }

  // 分析字符串字面量
  const stringRegex = new RegExp(TRANSLATE_PATTERNS.stringLiteral.source, 'g')
  while ((match = stringRegex.exec(content)) !== null) {
    const text = match[1].trim()

    // 检查上下文：如果附近有 t()，则已翻译
    const contextStart = Math.max(0, match.index - 50)
    const context = content.substring(contextStart, match.index)

    if (context.includes('t(') || shouldIgnore(text)) {
      continue
    }

    const textBefore = content.substring(0, match.index)
    const lineNum = textBefore.split('\n').length
    const columnNum = textBefore.lastIndexOf('\n') >= 0
      ? textBefore.length - textBefore.lastIndexOf('\n') - 1
      : textBefore.length

    issues.push({
      file: path.relative(process.cwd(), filePath),
      line: lineNum,
      column: columnNum,
      text,
      type: 'string-literal',
    })
  }

  return issues
}

function walkDirectory(dir: string, extensions: string[]): string[] {
  const files: string[] = []

  const walk = (currentDir: string) => {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name)

      if (entry.isDirectory()) {
        // 跳过特定目录
        if (['node_modules', '.git', 'dist', 'build', '.next'].includes(entry.name)) {
          continue
        }
        if (entry.name.startsWith('.')) {
          continue
        }
        walk(fullPath)
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name)
        if (extensions.includes(ext)) {
          files.push(fullPath)
        }
      }
    }
  }

  walk(dir)
  return files
}

function printReport(result: AnalysisResult) {
  console.log('\n' + '='.repeat(70))
  console.log('📊 硬编码字符串检测报告')
  console.log('='.repeat(70))
  console.log(`扫描文件数: ${result.totalFiles}`)
  console.log(`发现问题数: ${result.totalIssues}`)
  console.log('='.repeat(70))

  // 按文件分组显示
  for (const [file, issues] of result.files) {
    console.log(`\n📄 ${file}`)
    console.log('  '.padStart(4, '-'))

    for (const issue of issues) {
      console.log(`  L${issue.line}:C${issue.column} [${issue.type}] "${issue.text}"`)
    }
  }

  console.log('\n' + '='.repeat(70))
  console.log('💡 修复建议（遵循 i18n 风格规范）：')
  console.log('  1. ✅ 正确：直接使用原始英文文本作为 key')
  console.log('     示例：t("Default model is required for compatible endpoints.")')
  console.log('     示例：t("Enter your API key...")')
  console.log('')
  console.log('  2. ❌ 错误：使用缩写或过度抽象的 key')
  console.log('     避免：t("error_model_required")')
  console.log('     避免：t("auth.enter_key")')
  console.log('')
  console.log('  3. 使用方法：')
  console.log('     const { t } = useTranslation("namespace")')
  console.log('     使用：{t("Your Text")}')
  console.log('')
  console.log('  4. 例外情况：')
  console.log('     - 技术术语和常量可使用简短 key')
  console.log('     - 代码中频繁使用的短文本可简化')
  console.log('='.repeat(70))
}

function saveReport(result: AnalysisResult, outputPath: string) {
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: result.totalFiles,
      totalIssues: result.totalIssues,
    },
    files: Object.fromEntries(
      Array.from(result.files.entries()).map(([file, issues]) => [file, issues])
    ),
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, JSON.stringify(reportData, null, 2))
}

function main() {
  const projectRoot = path.resolve(__dirname, '..', '..', '..')
  const sourceDir = path.join(projectRoot, 'apps', 'electron', 'src', 'renderer')

  console.log('🔍 扫描源代码中的硬编码文本...\n')
  console.log(`扫描目录: ${sourceDir}\n`)

  const files = walkDirectory(sourceDir, ['.tsx', '.ts'])
  const result: AnalysisResult = {
    totalFiles: files.length,
    totalIssues: 0,
    files: new Map(),
  }

  console.log(`找到 ${files.length} 个文件\n`)

  for (const file of files) {
    const issues = analyzeFile(file)
    if (issues.length > 0) {
      result.files.set(path.relative(projectRoot, file), issues)
      result.totalIssues += issues.length
    }
  }

  // 打印报告
  printReport(result)

  // 保存 JSON 报告
  const reportPath = path.join(projectRoot, 'test-results', 'hardcoded-strings-analysis.json')
  saveReport(result, reportPath)
  console.log(`\n📝 详细报告已保存至: ${reportPath}`)

  // 返回退出码
  process.exit(result.totalIssues > 0 ? 1 : 0)
}

main()