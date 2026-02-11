/**
 * 硬编码字符串检测工具
 *
 * 用于扫描源代码中可能遗漏翻译的硬编码字符串
 */

import * as fs from 'fs'
import * as path from 'path'

interface HardcodedText {
  file: string
  line: number
  text: string
  type: 'jsx-text' | 'placeholder' | 'title' | 'aria-label' | 'string-literal'
}

// 不需要翻译的模式
const IGNORE_PATTERNS = [
  // CSS 类名
  /^[a-z][a-z0-9\-_]*$/,
  // 技术术语
  /^(className|id|type|name|value|onClick|onChange|onSubmit|href|src|alt)$/,
  // 短于 2 个字符
  /^.{0,2}$/,
  // 纯数字
  /^\d+$/,
  // URL
  /^https?:\/\//,
  // 文件路径
  /^\.\.?\//,
  // 变量名格式
  /^[a-z][a-zA-Z0-9]*$/,
  // 已翻译的 t() 调用
  /t\(['"`][^'"`]+['"`]\)/,
]

// 需要翻译的模式（用户可见文本）
const TRANSLATE_PATTERNS = [
  // JSX 文本内容（包含空格的英文短语）
  { pattern: />([A-Z][a-zA-Z\s]{3,50})</g, type: 'jsx-text' as const },
  // placeholder
  { pattern: /placeholder=["']([^"']+)["']/g, type: 'placeholder' as const },
  // title
  { pattern: /title=["']([^"']+)["']/g, type: 'title' as const },
  // aria-label
  { pattern: /aria-label=["']([^"']+)["']/g, type: 'aria-label' as const },
  // 字符串字面量赋值给文本属性
  { pattern: /(?:label|text|message|error|description|hint|title):\s*["']([^"']+)["']/g, type: 'string-literal' as const },
]

function shouldIgnore(text: string): boolean {
  const trimmed = text.trim()
  for (const pattern of IGNORE_PATTERNS) {
    if (pattern.test(trimmed)) {
      return true
    }
  }
  return false
}

function scanFile(filePath: string): HardcodedText[] {
  const results: HardcodedText[] = []
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')

  for (const { pattern, type } of TRANSLATE_PATTERNS) {
    let match
    const regex = new RegExp(pattern.source, pattern.flags)

    while ((match = regex.exec(content)) !== null) {
      const text = match[1]

      // 检查是否已经被翻译
      const contextStart = Math.max(0, match.index - 30)
      const context = content.substring(contextStart, match.index)

      if (context.includes('t(') || context.includes('{t(')) {
        continue // 已翻译
      }

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
      })
    }
  }

  return results
}

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

function main() {
  const projectRoot = path.resolve(__dirname, '..', '..')
  const rendererPath = path.join(projectRoot, 'apps', 'electron', 'src', 'renderer')

  console.log('='.repeat(60))
  console.log('硬编码字符串检测报告')
  console.log('='.repeat(60))
  console.log(`扫描目录: ${rendererPath}`)
  console.log()

  const results = scanDirectory(rendererPath, ['.tsx', '.ts'])

  // 按文件分组
  const grouped = new Map<string, HardcodedText[]>()

  for (const item of results) {
    // 去重
    const key = `${item.file}:${item.text}`
    const existing = grouped.get(item.file) || []

    if (!existing.some(e => e.text === item.text)) {
      existing.push(item)
      grouped.set(item.file, existing)
    }
  }

  // 输出报告
  let totalCount = 0

  for (const [file, items] of grouped) {
    const relativePath = path.relative(projectRoot, file)
    console.log(`\n📄 ${relativePath}`)
    console.log('-'.repeat(50))

    for (const item of items) {
      console.log(`  L${item.line} [${item.type}]: "${item.text}"`)
      totalCount++
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log(`总计发现 ${totalCount} 处可能遗漏翻译的文本`)
  console.log('='.repeat(60))

  // 输出 JSON 格式供其他工具使用
  const reportPath = path.join(projectRoot, 'test-results', 'hardcoded-check.json')
  fs.mkdirSync(path.dirname(reportPath), { recursive: true })
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalCount,
    files: Object.fromEntries(grouped),
  }, null, 2))

  console.log(`\n详细报告已保存到: ${reportPath}`)
}

main()
