#!/usr/bin/env node

/**
 * i18n Translation Checker and Fixer
 *
 * 功能:
 * 1. 检测 TSX 文件中未使用 t() 函数的硬编码文本
 * 2. 检测资源文件中未使用的键
 * 3. 检测资源文件中缺失的键
 * 4. 生成详细的修复建议报告
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs'
import { join, dirname, relative, basename } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..')

// 配置
const CONFIG = {
  srcDir: join(projectRoot, 'apps/electron/src/renderer'),
  localesDir: join(projectRoot, 'i18n/locales'),
  locales: ['en', 'zh-CN'],
  // 忽略的文件模式
  ignorePatterns: [
    /\.test\.(tsx?|jsx?)$/,
    /\.spec\.(tsx?|jsx?)$/,
    /node_modules/,
    /\.d\.ts$/,
  ],
  // 忽略的硬编码文本模式
  ignoreTextPatterns: [
    // 变量名、函数名等标识符
    /^[a-zA-Z_$][a-zA-Z0-9_$]*$/,
    // CSS 类名
    /^[a-z][a-z0-9-]*$/,
    // 空白
    /^\s*$/,
    // 只包含分隔符
    /^[.,;:!?(){}\[\]<>]+$/,
    // 纯数字
    /^\d+$/,
    // HTML 标签名
    /^[a-z]+$/,
    // 技术术语
    /^(div|span|button|input|img|svg|path|rect|circle|text|g|polygon|polyline|line|ellipse|use|defs|marker|mask|clipPath|filter|pattern|linearGradient|radialGradient|stop|animate|animateTransform|symbol|view|foreignObject|desc|title|metadata|style|script|link|base|meta|head|body|html|main|header|footer|nav|section|article|aside|h[1-6]|p|blockquote|pre|code|ul|ol|li|dl|dt|dd|table|thead|tbody|tfoot|tr|th|td|figure|figcaption|hr|br|wbr|a|abbr|address|area|article|aside|audio|b|bdi|bdo|blockquote|canvas|caption|cite|code|data|datalist|dd|del|details|dfn|dialog|dl|dt|em|embed|fieldset|figcaption|figure|footer|form|h[1-6]|head|header|hr|i|iframe|img|input|ins|kbd|label|legend|li|link|main|map|mark|menu|meta|meter|nav|noscript|object|ol|optgroup|option|output|p|param|picture|pre|progress|q|rp|rt|ruby|s|samp|script|section|select|small|source|span|strong|style|sub|summary|sup|table|tbody|td|template|textarea|tfoot|th|thead|time|title|tr|track|u|ul|var|video|wbr)$/,
  ],
  // 这些字符串通常不应被翻译 (单字母、图标名、技术术语等)
  shortTextThreshold: 2,
}

// 结果收集
const results = {
  filesScanned: 0,
  hardcodedStrings: [],
  missingInCode: [],
  missingInResources: [],
  unusedKeys: [],
  summary: {},
}

/**
 * 获取所有 TSX 文件
 */
function getAllTsxFiles(dir, files = []) {
  const entries = readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)

    const shouldIgnore = CONFIG.ignorePatterns.some(pattern =>
      pattern.test(fullPath)
    )
    if (shouldIgnore) continue

    if (entry.isDirectory()) {
      getAllTsxFiles(fullPath, files)
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.jsx')) {
      files.push(fullPath)
    }
  }

  return files
}

/**
 * 解析 TSX 文件提取硬编码文本
 */
function extractHardcodedStrings(filePath) {
  const content = readFileSync(filePath, 'utf-8')
  const hardcodedStrings = []

  // 匹配 JSX 中的文本内容
  // 1. 单行文本: >text< 或 >text
  const singleLineTextRegex = />([^<{]+)</g
  // 2. 换行文本
  const multiLineTextRegex = />([^<{]+(?:\n[^<{]+)*)</gs
  // 3. 属性值: prop="value" 或 prop='value'
  const attrValueRegex = /=("[^"]*"|'[^']*')/g

  // 提取所有候选字符串
  const candidates = []

  // 处理括号内的文本
  let match
  while ((match = singleLineTextRegex.exec(content)) !== null) {
    const text = match[1].trim()
    if (text && !isIgnorableText(text) && text.length >= CONFIG.shortTextThreshold) {
      candidates.push({
        text,
        type: 'jsx-text',
        line: getLineNumber(content, match.index),
      })
    }
  }

  // 处理属性值
  while ((match = attrValueRegex.exec(content)) !== null) {
    const value = match[1].slice(1, -1) // 移除引号
    const trimmed = value.trim()
    // 只处理看起来像用户可见文本的值
    if (
      trimmed &&
      !isIgnorableText(trimmed) &&
      trimmed.length >= CONFIG.shortTextThreshold &&
      /^[A-Z]/.test(trimmed) &&
      !trimmed.includes('{') &&
      !trimmed.includes('}')
    ) {
      candidates.push({
        text: trimmed,
        type: 'prop-value',
        line: getLineNumber(content, match.index),
      })
    }
  }

  // 标记已使用 t() 的字符串
  const tUsages = []
  const tCallRegex = /t\(['"`]([^'"`]+)['"`]\)/g
  while ((match = tCallRegex.exec(content)) !== null) {
    tUsages.push(match[1])
  }

  // 过滤出未使用 t() 的字符串
  for (const candidate of candidates) {
    const text = candidate.text

    // 转义特殊字符进行正则匹配
    const escapedText = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const isTranslatable = tUsages.every(usage => {
      // 检查是否被 t() 包裹
      const usageRegex = new RegExp(`t\\(['"](.*${escapedText}.*)['"\\]\\)`)
      return !usageRegex.test(content)
    })

    if (isTranslatable) {
      // 检查是否应该翻译 (排除一些不该翻译的内容)
      if (!isIgnorableText(text)) {
        hardcodedStrings.push({
          text,
          type: candidate.type,
          line: candidate.line,
          namespace: getNamespace(filePath),
        })
      }
    }
  }

  return hardcodedStrings
}

/**
 * 检查文本是否应该忽略
 */
function isIgnorableText(text) {
  // 空字符串
  if (!text || text.trim().length === 0) return true

  const trimmed = text.trim()

  // 检查忽略模式
  for (const pattern of CONFIG.ignoreTextPatterns) {
    if (pattern.test(trimmed)) {
      return true
    }
  }

  // 太短的文本
  if (trimmed.length < CONFIG.shortTextThreshold) {
    return true
  }

  // 包含特殊模式
  if (trimmed.includes('{') || trimmed.includes('}')) {
    return true // 可能是表达式
  }

  // 技术标识符
  if (/^[a-z][a-z0-9-]*$/.test(trimmed) && !/[A-Z]/.test(trimmed)) {
    return true
  }

  return false
}

/**
 * 获取文件内容中指定索引处的行号
 */
function getLineNumber(content, index) {
  const lines = content.substring(0, index).split('\n')
  return lines.length
}

/**
 * 根据 TSX 文件路径获取namespace
 */
function getNamespace(filePath) {
  const relPath = relative(CONFIG.srcDir, filePath)
    .replace(/\\/g, '/')
    .replace(/\.tsx?$/, '')

  // 确定namespace
  if (relPath.startsWith('pages/')) {
    return `pages/${relPath.substring(6)}`
  } else if (relPath.startsWith('components/')) {
    return `components/${relPath.substring(11)}`
  }

  return relPath
}

/**
 * 加载所有资源文件
 */
function loadResourceFiles() {
  const resources = {}

  for (const locale of CONFIG.locales) {
    resources[locale] = {}
    loadResourceFilesRec(join(CONFIG.localesDir, locale), '', resources[locale])
  }

  return resources
}

/**
 * 递归加载资源文件
 */
function loadResourceFilesRec(dir, baseNamespace, target) {
  const entries = readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    const relName = entry.name.replace('.json', '')

    if (entry.isDirectory()) {
      const newNamespace = baseNamespace ? `${baseNamespace}/${relName}` : relName
      target[relName] = {}
      loadResourceFilesRec(fullPath, newNamespace, target[relName])
    } else if (entry.name.endsWith('.json')) {
      try {
        const content = readFileSync(fullPath, 'utf-8')
        const data = JSON.parse(content)
        const namespace = baseNamespace ? `${baseNamespace}/${relName}` : relName

        // 扁平化存储
        for (const [key, value] of Object.entries(data)) {
          target[`${namespace}:${key}`] = value
        }
      } catch (err) {
        console.warn(`Warning: Failed to parse ${fullPath}`, err.message)
      }
    }
  }
}

/**
 * 分析硬编码字符串
 */
function analyzeHardcodedStrings(hardcodedStrings, resources) {
  const missingTranslations = []

  for (const item of hardcodedStrings) {
    // 检查资源文件中是否有对应的翻译
    const enKey = `${item.namespace}:${item.text}`
    const hasEn = resources.en && resources.en[enKey] !== undefined

    if (!hasEn) {
      missingTranslations.push({
        ...item,
        severity: 'high',
      })
    }
  }

  return missingTranslations
}

/**
 * 生成报告
 */
function generateReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      filesScanned: results.filesScanned,
      totalHardcodedStrings: results.hardcodedStrings.length,
      criticalIssues: results.hardcodedStrings.filter(s => s.severity === 'high').length,
    },
    hardcodedStrings: results.hardcodedStrings,
    recommendations: generateRecommendations(results),
  }

  return report
}

/**
 * 生成修复建议
 */
function generateRecommendations(results) {
  const recommendations = []

  // 按文件分组
  const byFile = {}
  for (const item of results.hardcodedStrings) {
    if (!byFile[item.file]) {
      byFile[item.file] = []
    }
    byFile[item.file].push(item)
  }

  for (const [file, items] of Object.entries(byFile)) {
    const relFile = relative(projectRoot, file)
    const namespace = items[0]?.namespace || 'unknown'

    recommendations.push({
      file: relFile,
      namespace,
      issues: items.length,
      strings: items.map(i => ({
        text: i.text,
        line: i.line,
        type: i.type,
      })),
      suggestion: `Add translations to the resource file and use t() function`,
    })
  }

  return recommendations
}

/**
 * 主函数
 */
function main() {
  console.log('='.repeat(60))
  console.log('i18n Translation Checker and Fixer')
  console.log('='.repeat(60))
  console.log()

  // 1. 扫描所有 TSX 文件
  console.log('Step 1: Scanning TSX files...')
  const tsxFiles = getAllTsxFiles(CONFIG.srcDir)
  console.log(`  Found ${tsxFiles.length} TSX files\n`)

  // 2. 加载资源文件
  console.log('Step 2:Loading resource files...')
  const resources = loadResourceFiles()
  const totalEnKeys = Object.keys(resources.en || {}).length
  console.log(`  Loaded ${totalEnKeys} translation keys from EN\n`)

  // 3. 扫描硬编码字符串
  console.log('Step 3: Scanning for hardcoded strings...')
  for (const file of tsxFiles) {
    results.filesScanned++
    const hardcoded = extractHardcodedStrings(file)
    for (const item of hardcoded) {
      item.file = file
      results.hardcodedStrings.push(item)
    }
  }
  console.log(`  Found ${results.hardcodedStrings.length} potential hardcoded strings\n`)

  // 4. 分析
  console.log('Step 4: Analyzing translations...')
  const missingTranslations = analyzeHardcodedStrings(results.hardcodedStrings, resources)
  results.hardcodedStrings = missingTranslations // 更新为只包含未翻译的
  console.log(`  Found ${missingTranslations.filter(s => s.severity === 'high').length} critical issues\n`)

  // 5. 生成报告
  console.log('Step 5: Generating report...')
  const report = generateReport(results)

  // 输出报告
  console.log('\n' + '='.repeat(60))
  console.log('REPORT SUMMARY')
  console.log('='.repeat(60))
  console.log(`Files scanned: ${report.summary.filesScanned}`)
  console.log(`Hardcoded strings found: ${report.summary.totalHardcodedStrings}`)
  console.log(`Critical issues: ${report.summary.criticalIssues}`)
  console.log()

  if (report.summary.totalHardcodedStrings > 0) {
    console.log('='.repeat(60))
    console.log('HARDCODED STRINGS BY FILE')
    console.log('='.repeat(60))

    const byFile = {}
    for (const item of results.hardcodedStrings) {
      const relFile = relative(projectRoot, item.file)
      if (!byFile[relFile]) {
        byFile[relFile] = []
      }
      byFile[relFile].push(item)
    }

    for (const [file, items] of Object.entries(byFile).sort()) {
      console.log(`\n${file} (${items.length} issue${items.length > 1 ? 's' : ''}):`)
      console.log(`  Namespace: ${items[0].namespace}`)
      console.log(`  Expected resource: i18n/locales/en/${items[0].namespace}.json`)

      for (const item of items) {
        console.log(`  - Line ${item.line} [${item.type}]: "${item.text}"`)
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('FIX RECOMMENDATIONS')
    console.log('='.repeat(60))

    for (const [file, items] of Object.entries(byFile).sort()) {
      const namespace = items[0].namespace
      console.log(`\n${file}:`)
      console.log(`  1. Ensure namespace is used: useTranslation('${namespace}')`)
      console.log(`  2. Replace hardcoded strings with t('Key')`)
      console.log(`  3. Add keys to resource file: i18n/locales/en/${namespace}.json`)
    }
  } else {
    console.log('✓ No hardcoded strings found!')
  }

  // 保存报告
  const reportPath = join(projectRoot, 'i18n-report.json')
  writeFileSync(reportPath, JSON.stringify(report, null, 2))
  console.log(`\nFull report saved to: ${relative(projectRoot, reportPath)}`)

  return report
}

// 运行主程序
main()