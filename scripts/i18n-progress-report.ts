#!/usr/bin/env bun

/**
 * i18n 改造进度统计脚本
 * 分析项目中已完成的i18n改造和仍然需要改造的组件
 */

import fs from 'fs'
import path from 'path'

// 配置
const REPO_ROOT = path.dirname(new URL(import.meta.url).pathname)
const RENDERER_DIR = path.join(REPO_ROOT, 'apps', 'electron', 'src', 'renderer')
const LOCALES_EN_DIR = path.join(REPO_ROOT, 'i18n', 'locales', 'en')
const LOCALES_ZH_DIR = path.join(REPO_ROOT, 'i18n', 'locales', 'zh-CN')

// 组件目录列表
const COMPONENT_DIRS = [
  'components/app-shell',
  'components/settings',
  'components/onboarding',
  'components/workspace',
  'components/apisetup',
  'components/chat',
  'components/files',
  'components/info',
  'components/ui',
]

// 结果存储
const stats = {
  totalFiles: 0,
  translatedFiles: 0,
  filesHardcoded: [] as { file: string; issues: string[] }[],
  languageFiles: {
    en: [] as string[],
    zh: [] as string[]
  }
}

/**
 * 递归获取目录下的所有.tsx和.ts文件
 */
function getTsFiles(dir: string): string[] {
  const files: string[] = []
  if (!fs.existsSync(dir)) return files

  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    if (entry.isDirectory()) {
      files.push(...getTsFiles(path.join(dir, entry.name)))
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      files.push(path.join(dir, entry.name))
    }
  }
  return files
}

/**
 * 检查文件是否使用了i18n
 */
function getI18nUsage(filePath: string): boolean {
  const content = fs.readFileSync(filePath, 'utf-8')
  return content.includes('useTranslation') &&
         (content.includes("from '@/contexts/I18nContext'") ||
          content.includes("from '@/i18n"))
}

/**
 * 扫描语言文件
 */
function scanLanguageFiles() {
  function scanDir(dir: string): string[] {
    const files: string[] = []
    if (!fs.existsSync(dir)) return files

    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.isDirectory()) {
        files.push(...scanDir(path.join(dir, entry.name)))
      } else if (entry.name.endsWith('.json')) {
        const relativePath = path.relative(REPO_ROOT, path.join(dir, entry.name))
        files.push(relativePath)
      }
    }
    return files
  }

  stats.languageFiles.en = scanDir(LOCALES_EN_DIR)
  stats.languageFiles.zh = scanDir(LOCALES_ZH_DIR)
}

/**
 * 分析硬编码文本
 */
function analyzeHardcodedText(filePath: string): string[] {
  const content = fs.readFileSync(filePath, 'utf-8')
  const issues: string[] = []

  // 检查常见的硬编码模式
  const patterns = [
    // JSX中的文本内容（排除变量、函数调用等）
    />\s*['"](.*?)['"]\s*</g,
    // 硬编码字符串属性
    /\btitle\s*=\s*["']([^"'\s]{10,}?)["']/g,
    /\bplaceholder\s*=\s*["']([^"'\s]+?)["']/g,
    /\blabel\s*:?\s*["']([^"']+)["']/g,
  ]

  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(content)) !== null) {
      const text = match[1]
      // 排除HTML标签、变量占位符、代码注释等
      if (text && text.length > 3 && !text.includes('{') && !text.includes('<') && !text.startsWith('//')) {
        issues.push(`硬编码文本: "${text}"`)
      }
    }
  }

  return issues
}

/**
 * 主函数
 */
async function main() {
  console.log('🔍 i18n改造进度分析...\n')
  console.log('=' .repeat(60))

  // 扫描语言文件
  console.log('\n📁 语言文件统计:')
  scanLanguageFiles()
  console.log(`   英文语言文件: ${stats.languageFiles.en.length} 个`)
  console.log(`   中文语言文件: ${stats.languageFiles.zh.length} 个`)

  // 扫描组件文件
  console.log('\n📄 组件文件分析:')
  for (const compDir of COMPONENT_DIRS) {
    const dirPath = path.join(RENDERER_DIR, compDir)
    const files = getTsFiles(dirPath)
    let translatedCount = 0

    console.log(`\n   ${compDir}/`)

    for (const file of files) {
      const relativeFile = path.relative(RENDERER_DIR, file)
      stats.totalFiles++
      const usesI18n = getI18nUsage(file)

      if (usesI18n) {
        translatedCount++
        stats.translatedFiles++
        console.log(`      ✅ ${relativeFile}`)
      } else {
        const hardcodedIssues = analyzeHardcodedText(file)
        if (hardcodedIssues.length > 0) {
          stats.filesHardcoded.push({ file: relativeFile, issues: hardcodedIssues })
          console.log(`      ⚠️  ${relativeFile} (${hardcodedIssues.length}处硬编码)`)
        } else {
          // 跳过纯逻辑文件或工具组件
          if (file.includes('index.ts') || file.includes('types.ts')) {
            console.log(`      ⚪ ${relativeFile} (跳过)`)
          }
        }
      }
    }

    const percent = files.length > 0 ? Math.round((translatedCount / files.length) * 100) : 0
    console.log(`      进度: ${translatedCount}/${files.length} (${percent}%)`)
  }

  // 汇总报告
  console.log('\n' + '='.repeat(60))
  console.log('📊 总体统计:')
  const overallPercent = stats.totalFiles > 0 ? Math.round((stats.translatedFiles / stats.totalFiles) * 100) : 0
  console.log(`   已完成: ${stats.translatedFiles}/${stats.totalFiles} (${overallPercent}%)`)
  console.log(`   需要改造: ${stats.filesHardcoded.length} 个文件`)

  if (stats.filesHardcoded.length > 0) {
    console.log('\n⚠️  需要重点关注的文件:')
    stats.filesHardcoded.slice(0, 10).forEach(({ file, issues }) => {
      console.log(`   - ${file}`)
      issues.slice(0, 3).forEach(issue => {
        console.log(`     ${issue}`)
      })
    })
  }

  console.log('\n✅ 分析完成!')
}

main().catch(console.error)
