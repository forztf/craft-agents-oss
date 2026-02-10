#!/usr/bin/env node
/**
 * i18n 自动化检查和修复脚本
 * 功能：
 * 1. 检查资源文件一致性（中英文键值对）
 * 2. 检测代码中漏翻译的硬编码文本
 * 3. 生成详细的修复报告
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.join(__dirname, '..')

// 工具函数
function getAllFiles(dir, extensions = []) {
  const files = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const res = path.resolve(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...getAllFiles(res, extensions))
    } else if (extensions.length === 0 || extensions.some(ext => entry.name.endsWith(ext))) {
      files.push(res)
    }
  }
  return files
}

function getRelativePath(filePath, baseDir) {
  return path.relative(baseDir, filePath).replace(/\\/g, '/')
}

function loadJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch (err) {
    console.error(`无法读取文件 ${filePath}:`, err.message)
    return {}
  }
}

function saveJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
}

// ============ 第一步：检查资源文件一致性 ============
function checkResourceConsistency() {
  console.log('\n='.repeat(70))
  console.log('第一步：检查资源文件一致性')
  console.log('='.repeat(70))

  const enLocaleDir = path.join(projectRoot, 'i18n/locales/en')
  const zhLocaleDir = path.join(projectRoot, 'i18n/locales/zh-CN')

  const enFiles = getAllFiles(enLocaleDir).map(f => getRelativePath(f, enLocaleDir))
  const zhFiles = getAllFiles(zhLocaleDir).map(f => getRelativePath(f, zhLocaleDir))

  console.log(`\nEN 文件数量: ${enFiles.length}`)
  console.log(`ZH 文件数量: ${zhFiles.length}`)

  const enSet = new Set(enFiles)
  const zhSet = new Set(zhFiles)

  // 检查文件是否存在差异
  const onlyInEn = enFiles.filter(f => !zhSet.has(f))
  const onlyInZh = zhFiles.filter(f => !enSet.has(f))

  if (onlyInEn.length || onlyInZh.length) {
    console.log('\n⚠️ 文件存在差异:')
    if (onlyInEn.length) {
      console.log('  仅存在于 EN:', onlyInEn.join(', '))
    }
    if (onlyInZh.length) {
      console.log('  仅存在于 ZH:', onlyInZh.join(', '))
    }
  } else {
    console.log('\n✓ 所有文件在 EN 和 ZH 中都存在')
  }

  // 检查键的一致性
  console.log('\n检查键值对一致性...')
  const commonFiles = enFiles.filter(f => zhSet.has(f))
  const issues = []

  for (const file of commonFiles) {
    const enContent = loadJSON(path.join(enLocaleDir, file))
    const zhContent = loadJSON(path.join(zhLocaleDir, file))

    const enKeys = Object.keys(enContent).sort()
    const zhKeys = Object.keys(zhContent).sort()

    const onlyInEnKeys = enKeys.filter(k => !zhKeys.includes(k))
    const onlyInZhKeys = zhKeys.filter(k => !enKeys.includes(k))
    const emptyKeys = Object.keys(zhContent).filter(k => !zhContent[k] || zhContent[k].trim() === '')

    if (onlyInEnKeys.length || onlyInZhKeys.length || emptyKeys.length) {
      issues.push({
        file,
        onlyInEnKeys,
        onlyInZhKeys,
        emptyKeys
      })
    }
  }

  if (issues.length) {
    console.log(`\n⚠️ 发现 ${issues.length} 个文件存在键一致性问题:\n`)
    issues.forEach(issue => {
      console.log(`文件: ${issue.file}`)
      if (issue.onlyInEnKeys.length) {
        console.log('  仅在 EN 中的键:', issue.onlyInEnKeys.join(', '))
      }
      if (issue.onlyInZhKeys.length) {
        console.log('  仅在 ZH 中的键:', issue.onlyInZhKeys.join(', '))
      }
      if (issue.emptyKeys.length) {
        console.log('  ZH 中空值的键:', issue.emptyKeys.join(', '))
      }
      console.log('')
    })
  } else {
    console.log('✓ 所有键值对在 EN 和 ZH 中一致')
  }

  return issues.length === 0 && onlyInEn.length === 0 && onlyInZh.length === 0
}

// ============ 第二步：检测漏翻译的硬编码文本 ============
function detectMissingTranslations() {
  console.log('\n=')
  console.log('第二步：检测漏翻译的硬编码文本')
  console.log('=')

  const pagesDir = path.join(projectRoot, 'apps/electron/src/renderer/pages')
  const componentsDir = path.join(projectRoot, 'apps/electron/src/renderer/components')

  const pagesFiles = getAllFiles(pagesDir, ['.tsx', '.ts'])
  const componentsFiles = getAllFiles(componentsDir, ['.tsx', '.ts'])

  console.log(`\n页面文件数量: ${pagesFiles.length}`)
  console.log(`组件文件数量: ${componentsFiles.length}`)

  // 加载所有翻译资源作为基准
  const localeDir = path.join(projectRoot, 'i18n/locales/en')
  const localeFiles = getAllFiles(localeDir, ['.json'])
  const translationKeys = new Set()

  for (const file of localeFiles) {
    const content = loadJSON(file)
    Object.keys(content).forEach(key => translationKeys.add(key))
  }

  console.log(`\n已加载的翻译键数量: ${translationKeys.size}`)

  // 检测漏翻译的内容
  const missingTranslations = []

  function checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8')
    const relativePath = getRelativePath(filePath, projectRoot)

    // 跳过某些不需要翻译的模式
    const skipPatterns = [
      /import.*from\s+['"][^'"]+['"]/g,
      /export\s+(const|function|class|interface|type|enum)/g,
      /\/\*[\s\S]*?\*\//g, // 多行注释
      /\/\/.*$/gm, // 单行注释
      /type\s+\w+\s*=/g,
      /interface\s+\w+/g,
      /enum\s+\w+/g,
    ]

    let cleanedContent = content
    skipPatterns.forEach(pattern => {
      cleanedContent = cleanedContent.replace(pattern, '')
    })

    // 查找可能的硬编码文本模式
    // 1. JSX 中的文本: <span>English Text</span>
    const jsxTextPattern = />([^<>\{]+)</g
    const jsxMatches = [...cleanedContent.matchAll(jsxTextPattern)]

    // 2. 字符串字面量（排除明显的非翻译内容）
    const stringLiteralPattern = /['"]([A-Z][A-Za-z\s,.!?;-]{3,})['"]|`([A-Z][A-Za-z\s,.!?;-]{3,})`/g
    const stringMatches = [...cleanedContent.matchAll(stringLiteralPattern)]

    const hardCodedTexts = new Set()

    // 收集 JSX 文本
    for (const match of jsxMatches) {
      const text = match[1].trim()
      if (text.length > 2 && /^[A-Z]/.test(text) && !/^[0-9]|\$\{/.test(text)) {
        // 排除一些明显不需要翻译的内容
        if (!/^div|span|p|a|input|button$/i.test(text) &&
            !/^className|id|key|type$/i.test(text) &&
            !/^\{|\}$/.test(text)) {
          hardCodedTexts.add(text)
        }
      }
    }

    // 收集字符串字面量
    for (const match of stringMatches) {
      const text = (match[1] || match[2]).trim()
      if (!/^(className|id|type|key|data-)/.test(text) &&
          !/^(const|let|var|function|class|import|export|from|return|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|new|this|super|extends|implements|interface|type|enum|typeof|instanceof|in|of|as|is)$/.test(text) &&
          !/true|false|null|undefined|void|never|any|unknown|string|number|boolean|object|symbol|bigint/.test(text)) {
        hardCodedTexts.add(text)
      }
    }

    // 检查哪些硬编码文本在翻译键中
    for (const text of hardCodedTexts) {
      if (!translationKeys.has(text)) {
        missingTranslations.push({
          file: relativePath,
          text
        })
      }
    }
  }

  for (const file of pagesFiles) {
    checkFile(file)
  }

  for (const file of componentsFiles) {
    checkFile(file)
  }

  if (missingTranslations.length > 0) {
    console.log(`\n⚠️ 发现 ${missingTranslations.length} 处可能漏翻译的内容:\n`)

    // 按文件分组
    const byFile = {}
    missingTranslations.forEach(mt => {
      if (!byFile[mt.file]) {
        byFile[mt.file] = []
      }
      byFile[mt.file].push(mt.text)
    })

    Object.entries(byFile).forEach(([file, texts]) => {
      console.log(`文件: ${file}`)
      ;[...new Set(texts)].forEach(text => {
        console.log(`  - "${text}"`)
      })
      console.log('')
    })

    // 生成修复报告
    const reportPath = path.join(projectRoot, 'i18n-missing-translations-report.json')
    saveJSON(reportPath, byFile)
    console.log(`✗ 详细报告已保存到: ${reportPath}`)
  } else {
    console.log('\n✓ 未发现明显的漏翻译内容')
  }

  return missingTranslations.length === 0
}

// ============ 第三步：检查具体的页面文件 ============
function checkPageFiles() {
  console.log('\n=')
  console.log('第三步：检查具体页面的 i18n 使用情况')
  console.log('=')

  const pagesDir = path.join(projectRoot, 'apps/electron/src/renderer/pages')
  const pagesFiles = getAllFiles(pagesDir, ['.tsx'])

  const unusedTranslations = []
  const missingHooks = []

  for (const file of pagesFiles) {
    const relativePath = getRelativePath(file, projectRoot)
    const content = fs.readFileSync(file, 'utf8')

    // 推导对应的资源文件路径
    let namespacePath = relativePath
      .replace(/^apps\/electron\/src\/renderer\//, '')
      .replace(/\.tsx?$/, '')

    // 检查是否有 useTranslation hook
    const hasUseTranslation = /useTranslation/.test(content)

    // 检查是否有 t() 函数调用
    const hasTFunction = /\bt\s*\(\s*['"]/.test(content)

    if (!hasUseTranslation && hasTFunction) {
      missingHooks.push({
        file: relativePath,
        reason: '使用了 t() 函数但缺少 useTranslation hook'
      })
    }

    // 检查对应的资源文件是否存在
    const enResourcePath = path.join(projectRoot, 'i18n/locales/en', namespacePath + '.json')
    if (!fs.existsSync(enResourcePath)) {
      // 尝试查找相似的资源文件
      const localeDir = path.join(projectRoot, 'i18n/locales/en')
      const allResources = getAllFiles(localeDir, ['.json'])
      const matching = allResources.filter(r => r.includes(namespacePath.split('/').pop()))

      unusedTranslations.push({
        file: relativePath,
        expectedResource: namespacePath + '.json',
        actualMatches: matching.map(r => getRelativePath(r, localeDir))
      })
    }
  }

  if (missingHooks.length > 0) {
    console.log(`\n⚠️ 发现 ${missingHooks.length} 个文件缺少 useTranslation hook:\n`)
    missingHooks.forEach(item => {
      console.log(`  ${item.file}: ${item.reason}`)
    })
  }

  if (unusedTranslations.length > 0) {
    console.log(`\n⚠️ 发现 ${unusedTranslations.length} 个文件缺少对应的资源文件:\n`)
    unusedTranslations.forEach(item => {
      console.log(`  文件: ${item.file}`)
      console.log(`    期望资源: ${item.expectedResource}`)
      if (item.actualMatches.length) {
        console.log(`    可能匹配: ${item.actualMatches.join(', ')}`)
      }
      console.log('')
    })
  }

  return missingHooks.length === 0 && unusedTranslations.length === 0
}

// ============ 主函数 ============
async function main() {
  console.log('\n' + '='.repeat(70))
  console.log('i18n 自动化检查和修复工具')
  console.log('='.repeat(70))

  const results = {
    resourceConsistency: false,
    missingTranslations: false,
    pageFiles: false
  }

  try {
    results.resourceConsistency = checkResourceConsistency()
    results.missingTranslations = detectMissingTranslations()
    results.pageFiles = checkPageFiles()

    console.log('\n' + '='.repeat(70))
    console.log('检测完成')
    console.log('='.repeat(70))

    const allPassed = Object.values(results).every(v => v === true)

    if (allPassed) {
      console.log('\n✓ 所有检测项通过！i18n 改造完整且正确。')
      process.exit(0)
    } else {
      console.log('\n⚠️ 发现以下问题需处理:')
      if (!results.resourceConsistency) {
        console.log('  - 资源文件一致性问题')
      }
      if (!results.missingTranslations) {
        console.log('  - 漏翻译的硬编码文本')
      }
      if (!results.pageFiles) {
        console.log('  - 页面文件 i18n 使用问题')
      }
      console.log('\n请根据上述报告进行修复。')
      process.exit(1)
    }
  } catch (err) {
    console.error('\n✗ 执行出错:', err.message)
    console.error(err.stack)
    process.exit(2)
  }
}

main()
