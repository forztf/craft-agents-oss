/**
 * 语言文件验证工具
 * 用于检查中英文翻译文件的一致性
 */

import * as fs from 'fs'
import * as path from 'path'

interface TranslationIssue {
  type: 'missing-file' | 'missing-key' | 'unused-key'
  file: string
  key?: string
  language: 'en' | 'zh-CN'
  severity: 'error' | 'warning'
}

class LocaleValidator {
  private projectRoot: string
  private issues: TranslationIssue[] = []

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot
  }

  /**
   * 获取所有 JSON 文件
   */
  private getJsonFiles(dir: string): string[] {
    const files: string[] = []

    function walk(currentDir: string, basePath: string = '') {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name)
        const relativePath = path.join(basePath, entry.name)

        if (entry.isDirectory()) {
          walk(fullPath, relativePath)
        } else if (entry.name.endsWith('.json')) {
          files.push(relativePath)
        }
      }
    }

    if (fs.existsSync(dir)) {
      walk(dir)
    }

    return files
  }

  /**
   * 读取 JSON 文件
   */
  private readJson(filePath: string): Record<string, string> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      return JSON.parse(content)
    } catch (e) {
      console.warn(`  ⚠️  无法读取文件: ${filePath}`)
      return {}
    }
  }

  /**
   * 验证翻译文件
   */
  validate() {
    console.log('🔍 开始验证翻译文件...\n')

    const localesPath = path.join(this.projectRoot, 'i18n', 'locales')
    const enPath = path.join(localesPath, 'en')
    const zhPath = path.join(localesPath, 'zh-CN')

    const enFiles = this.getJsonFiles(enPath)
    const zhFiles = this.getJsonFiles(zhPath)

    console.log(`✅ 英文文件数: ${enFiles.length}`)
    console.log(`✅ 中文文件数: ${zhFiles.length}\n`)

    // 1. 检查缺失的文件
    console.log('📄 检查缺失的文件...')
    const missingInZh = enFiles.filter(f => !zhFiles.includes(f))
    const missingInEn = zhFiles.filter(f => !enFiles.includes(f))

    for (const file of missingInZh) {
      this.issues.push({
        type: 'missing-file',
        file,
        language: 'zh-CN',
        severity: 'error',
      })
    }

    for (const file of missingInEn) {
      this.issues.push({
        type: 'missing-file',
        file,
        language: 'en',
        severity: 'error',
      })
    }

    console.log(`  ❌ 中文缺失: ${missingInZh.length} 个文件`)
    console.log(`  ❌ 英文缺失: ${missingInEn.length} 个文件\n`)

    // 2. 检查 key 一致性
    console.log('🔑 检查翻译 key 一致性...')
    let checkedFiles = 0
    let totalMissingKeys = 0

    for (const enFile of enFiles) {
      if (!zhFiles.includes(enFile)) continue

      const enFilePath = path.join(enPath, enFile)
      const zhFilePath = path.join(zhPath, enFile)

      const enJson = this.readJson(enFilePath)
      const zhJson = this.readJson(zhFilePath)

      const enKeys = Object.keys(enJson)
      const zhKeys = Object.keys(zhJson)

      // 检查缺失的中文 key
      const missingInZhKeys = enKeys.filter(k => !zhKeys.includes(k))
      for (const key of missingInZhKeys) {
        this.issues.push({
          type: 'missing-key',
          file: enFile,
          key,
          language: 'zh-CN',
          severity: 'error',
        })
      }

      // 检查缺失的英文 key
      const missingInEnKeys = zhKeys.filter(k => !enKeys.includes(k))
      for (const key of missingInEnKeys) {
        this.issues.push({
          type: 'missing-key',
          file: enFile,
          key,
          language: 'en',
          severity: 'warning',
        })
      }

      checkedFiles++
      totalMissingKeys += missingInZhKeys.length + missingInEnKeys.length
    }

    console.log(`  ✓ 已检查 ${checkedFiles} 个文件`)
    console.log(`  ❌ 发现 ${totalMissingKeys} 个缺失的 keys\n`)
  }

  /**
   * 打印报告
   */
  printReport() {
    const errors = this.issues.filter(i => i.severity === 'error')
    const warnings = this.issues.filter(i => i.severity === 'warning')

    console.log('='.repeat(70))
    console.log('📊 翻译验证报告')
    console.log('='.repeat(70))
    console.log(`❌ 错误: ${errors.length}`)
    console.log(`⚠️  警告: ${warnings.length}`)
    console.log('='.repeat(70))
    console.log()

    // 按文件分组
    const groupedByFile = new Map<string, TranslationIssue[]>()

    for (const issue of this.issues) {
      const existing = groupedByFile.get(issue.file) || []
      existing.push(issue)
      groupedByFile.set(issue.file, existing)
    }

    // 显示详情
    for (const [file, issues] of groupedByFile) {
      console.log(`📄 ${file}`)

      for (const issue of issues) {
        const icon = issue.severity === 'error' ? '❌' : '⚠️'

        if (issue.type === 'missing-file') {
          console.log(`  ${icon} ${issue.language} 文件缺失`)
        } else if (issue.type === 'missing-key') {
          console.log(`  ${icon} ${issue.language} 缺少 key: "${issue.key}"`)
        }
      }
      console.log()
    }
  }

  /**
   * 保存报告到 JSON
   */
  async saveReport() {
    const reportPath = path.join(this.projectRoot, 'test-results', 'translation-validation.json')

    await fs.promises.mkdir(path.dirname(reportPath), { recursive: true })

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.issues.length,
        errors: this.issues.filter(i => i.severity === 'error').length,
        warnings: this.issues.filter(i => i.severity === 'warning').length,
      },
      issues: this.issues,
    }

    await fs.promises.writeFile(reportPath, JSON.stringify(report, null, 2))
    console.log(`📝 报告已保存至: ${reportPath}`)
  }

  /**
   * 获取问题数量
   */
  getIssueCount() {
    return {
      total: this.issues.length,
      errors: this.issues.filter(i => i.severity === 'error').length,
      warnings: this.issues.filter(i => i.severity === 'warning').length,
    }
  }
}

// 主函数
function main() {
  const projectRoot = path.resolve(__dirname, '..', '..')

  const validator = new LocaleValidator(projectRoot)
  validator.validate()
  validator.printReport()

  validator.saveReport().then(() => {
    const count = validator.getIssueCount()
    console.log('\n' + '='.repeat(70))
    console.log(`总计: ${count.total} 个问题 (${count.errors} 错误, ${count.warnings} 警告)`)
    console.log('='.repeat(70))

    process.exit(count.errors > 0 ? 1 : 0)
  })
}

main()
