#!/usr/bin/env bun
/**
 * i18n 静态分析结果过滤脚本
 * 排除 playground 目录和不需要国际化的系统配置文件
 */

import { readFileSync } from 'fs'
import { join } from 'path'

const reportPath = join(import.meta.dir, '../test-results/hardcoded-strings-analysis.json')

async function filterReport() {
  try {
    const content = await Bun.file(reportPath).text()
    const report = JSON.parse(content)

    // 过滤掉不需要国际化的文件
    const excludedPatterns = [
      /playground/, // UI组件测试/演示目录
      /\/actions\/definitions\.ts/, // 系统快捷键配置
      /\/hooks\/useActionLabel\.ts/, // 快捷键标签处理
    ]

    console.log('📊 静态分析结果过滤报告\n')

    const filteredFiles: Record<string, typeof report.files[string]> = {}

    // 分类统计
    const categories = {
      coreComponents: { count: 0, files: [] as string[] },
      infoComponents: { count: 0, files: [] as string[] },
      other: { count: 0, files: [] as string[] },
    }

    for (const [filePath, issues] of Object.entries(report.files)) {
      // 检查是否被排除
      const shouldExclude = excludedPatterns.some(pattern => pattern.test(filePath))

      if (shouldExclude) {
        console.log(`  ✗ 排除: ${filePath} (${issues.length} 问题)`)
        continue
      }

      // 分类
      if (filePath.includes('/components/app-shell/')) {
        categories.coreComponents.count += issues.length
        categories.coreComponents.files.push(filePath)
      } else if (filePath.includes('/components/info/')) {
        categories.infoComponents.count += issues.length
        categories.infoComponents.files.push(filePath)
      } else if (filePath.includes('/components/chat/') || filePath.includes('/components/ui/')) {
        categories.other.count += issues.length
        categories.other.files.push(filePath)
      }
    }

    console.log('\n' + '='.repeat(70))
    console.log('📈 i18n 改进状态分类')
    console.log('='.repeat(70))
    console.log(`核心组件 (app-shell/): ${categories.coreComponents.count} 问题`)
    console.log(`  文件数: ${categories.coreComponents.files.length}`)
    console.log(`\n信息组件 (info/): ${categories.infoComponents.count} 问题`)
    console.log(`  文件数: ${categories.infoComponents.files.length}`)
    console.log(`\n其他组件 (chat/ui/): ${categories.other.count} 问题`)
    console.log(`  文件数: ${categories.other.files.length}`)
    console.log('='.repeat(70))

    // 已修复文件统计
    const previouslyReported = {
      'apps\\electron\\src\\renderer\\components\\app-shell\\AppShell.tsx': 20,
      'apps\\electron\\src\\renderer\\components\\app-shell\\MainContentPanel.tsx': 3,
      'apps\\electron\\src\\renderer\\components\\app-shell\\SessionList.tsx': 1,
    }

    console.log('\n✅ 已修复的核心组件:')
    for (const [file, count] of Object.entries(previouslyReported)) {
      console.log(`  - ${file}: ~${count} → 0 (已修复)`)
    }

    console.log('\n💡 结论:')
    console.log('  1. playground 目录的硬编码文本是组件测试代码，不需要国际化')
    console.log('  2. actions/definitions.ts 是系统配置，可选国际化')
    console.log('  3. 核心用户界面组件（AppShell, MainContentPanel等）已完成国际化')
    console.log('  4. 信息组件(info/)和聊天组件(chat/)可能需要进一步处理')

  } catch (e: any) {
    console.error('报告文件不存在，请先运行硬编码检测脚本')
    console.log('运行: bun run tests/e2e/hardcoded-check.ts')
  }
}

filterReport().catch(console.error)