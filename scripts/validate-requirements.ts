/**
 * 需求验证工具
 * 用于检查需求文档的完整性、格式正确性和代码覆盖率
 */

import * as fs from 'fs'
import * as path from 'path'

/**
 * 验证问题类型
 */
interface ValidationIssue {
  type: 'missing-requirements' | 'missing-scenario' | 'format-error' | 'missing-module' | 'coverage-gap'
  file?: string
  module?: string
  requirement?: string
  severity: 'error' | 'warning' | 'info'
  message: string
}

/**
 * 代码功能点
 */
interface CodeFeature {
  type: 'component' | 'route' | 'action' | 'page' | 'hook'
  name: string
  path: string
  description?: string
}

/**
 * 需求条目
 */
interface RequirementItem {
  id: string
  text: string
  type: 'functional' | 'non-functional'
  scenarios: string[]
  status: 'active' | 'modified' | 'removed'
}

/**
 * 模块需求文档
 */
interface ModuleRequirements {
  name: string
  description: string
  requirements: RequirementItem[]
}

class RequirementsValidator {
  private projectRoot: string
  private issues: ValidationIssue[] = []
  private codeFeatures: CodeFeature[] = []
  private moduleRequirements: Map<string, ModuleRequirements> = new Map()

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot
  }

  /**
   * 扫描代码中的功能点
   */
  async scanCodeFeatures() {
    console.log('🔍 扫描代码中的功能点...\n')

    const srcPath = path.join(this.projectRoot, 'apps', 'electron', 'src')

    if (!fs.existsSync(srcPath)) {
      console.log('⚠️  源代码目录不存在\n')
      return
    }

    // 扫描组件
    await this.scanComponents(srcPath)

    // 扫描页面
    await this.scanPages(srcPath)

    // 扫描 actions
    await this.scanActions(srcPath)

    // 扫描 hooks
    await this.scanHooks(srcPath)

    console.log(`✅ 发现代码功能点: ${this.codeFeatures.length} 个\n`)
    this.printCodeFeatures()
  }

  /**
   * 扫描组件
   */
  private async scanComponents(srcPath: string) {
    const componentsPath = path.join(srcPath, 'renderer', 'components')
    this.walkDirectory(componentsPath, '**/*.{tsx,ts}', (file) => {
      const relativePath = path.relative(componentsPath, file)
      const componentName = path.basename(file, path.extname(file))

      // 跳过测试文件和索引文件
      if (relativePath.includes('__tests__') ||
          componentName === 'index' ||
          componentName === 'types') {
        return
      }

      this.codeFeatures.push({
        type: 'component',
        name: componentName,
        path: `components/${relativePath}`,
      })
    })
  }

  /**
   * 扫描页面
   */
  private async scanPages(srcPath: string) {
    const pagesPath = path.join(srcPath, 'renderer', 'pages')
    this.walkDirectory(pagesPath, '**/*.{tsx,ts}', (file) => {
      const relativePath = path.relative(pagesPath, file)
      const pageName = path.basename(file, path.extname(file))

      // 跳过测试文件和索引文件
      if (relativePath.includes('__tests__') ||
          pageName === 'index' ||
          pageName === 'settings-pages') {
        return
      }

      this.codeFeatures.push({
        type: 'page',
        name: pageName,
        path: `pages/${relativePath}`,
      })
    })
  }

  /**
   * 扫描 actions
   */
  private async scanActions(srcPath: string) {
    const actionsPath = path.join(srcPath, 'renderer', 'actions')
    this.walkDirectory(actionsPath, '**/*.ts', (file) => {
      const relativePath = path.relative(actionsPath, file)
      const actionName = path.basename(file, path.extname(file))

      // 跳过测试文件和特定文件
      if (relativePath.includes('__tests__') ||
          actionName === 'index' ||
          actionName === 'types' ||
          actionName === 'registry') {
        return
      }

      this.codeFeatures.push({
        type: 'action',
        name: actionName,
        path: `actions/${relativePath}`,
      })
    })
  }

  /**
   * 扫描 hooks
   */
  private async scanHooks(srcPath: string) {
    const hooksPath = path.join(srcPath, 'renderer', 'hooks')
    this.walkDirectory(hooksPath, '**/*.ts', (file) => {
      const relativePath = path.relative(hooksPath, file)
      const hookName = path.basename(file, path.extname(file))

      // 跳过测试文件和索引文件
      if (relativePath.includes('__tests__') ||
          hookName === 'index' ||
          hookName.endsWith('.test')) {
        return
      }

      this.codeFeatures.push({
        type: 'hook',
        name: hookName,
        path: `hooks/${relativePath}`,
      })
    })
  }

  /**
   * 递归遍历目录
   */
  private walkDirectory(dirPath: string, pattern: string, callback: (filePath: string) => void) {
    if (!fs.existsSync(dirPath)) return

    const walk = (currentPath: string, baseName: string = '') => {
      try {
        const entries = fs.readdirSync(currentPath)

        for (const entry of entries) {
          const fullPath = path.join(currentPath, entry)
          const relativePath = path.join(baseName, entry)

          const stats = fs.statSync(fullPath)
          if (stats.isDirectory()) {
            walk(fullPath, relativePath)
          } else if (stats.isFile() && this.matchPattern(entry, pattern)) {
            callback(fullPath)
          }
        }
      } catch (e) {
        // 忽略权限错误
      }
    }

    walk(dirPath)
  }

  /**
   * 简单的模式匹配
   */
  private matchPattern(filename: string, pattern: string): boolean {
    const extPattern = pattern.replace('**/*.', '.').replace('*', '')
    return filename.endsWith(extPattern)
  }

  /**
   * 打印代码功能点
   */
  private printCodeFeatures() {
    const grouped = new Map<string, CodeFeature[]>()

    for (const feature of this.codeFeatures) {
      const existing = grouped.get(feature.type) || []
      existing.push(feature)
      grouped.set(feature.type, existing)
    }

    for (const [type, features] of grouped) {
      console.log(`  ${type.toUpperCase()}: ${features.length} 个`)
      for (const f of features.slice(0, 5)) {
        console.log(`    - ${f.name}`)
      }
      if (features.length > 5) {
        console.log(`    ... 还有 ${features.length - 5} 个`)
      }
    }
    console.log()
  }

  /**
   * 加载需求文档
   */
  async loadRequirements() {
    console.log('📄 加载需求文档...\n')

    const requirementsPath = path.join(this.projectRoot, 'docs', 'specs', 'requirements-system', 'modules')

    if (!fs.existsSync(requirementsPath)) {
      this.issues.push({
        type: 'missing-requirements',
        severity: 'error',
        message: '需求文档目录不存在，请先生成需求文档',
      })
      console.log('❌ 需求文档目录不存在\n')
      return
    }

    const files: string[] = []
    this.walkDirectory(requirementsPath, '*.md', (file) => {
      files.push(file)
    })

    console.log(`✅ 找到需求文档: ${files.length} 个\n`)

    for (const file of files) {
      await this.parseRequirementFile(file)
    }
  }

  /**
   * 解析需求文件
   */
  private async parseRequirementFile(filePath: string) {
    let content = fs.readFileSync(filePath, 'utf-8')
    // 将 Windows 换行符转换为 Unix 换行符
    content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

    const lines = content.split('\n')
    const moduleName = path.basename(filePath, '.md')

    const requirements: RequirementItem[] = []
    let currentRequirement: Partial<RequirementItem> | null = null
    let inRequirementsSection = false
    let inScenario = false
    let scenarioBuffer: string[] = []

    for (const line of lines) {
      // 检测 Requirements 章节 (## Requirements)
      if (line.match(/^#{2}\s+Requirements\s*$/)) {
        inRequirementsSection = true
        continue
      }

      // 检测新的需求条目 (### REQ-X.X: 文本)
      const reqMatch = line.match(/^#{3}\s+(REQ-\d+\.\d+):\s+(.*)$/s)

      if (reqMatch && inRequirementsSection) {
        // 保存上一个需求
        if (currentRequirement && currentRequirement.text) {
          // 保存当前 scenario 缓冲区
          if (scenarioBuffer.length > 0) {
            const scenarioText = scenarioBuffer.join(' ').trim()
            if (scenarioText && currentRequirement.scenarios) {
              currentRequirement.scenarios.push(scenarioText)
            }
            scenarioBuffer = []
          }
          requirements.push(currentRequirement as RequirementItem)
        }

        currentRequirement = {
          id: reqMatch[1],
          text: reqMatch[2].trim(),
          type: reqMatch[2].includes('应当') ? 'functional' : 'non-functional',
          scenarios: [],
          status: 'active',
        }
        inScenario = false
        continue
      }

      // 检测 Scenario 标题 (#### Scenario:)
      if (line.match(/^#{4}\s+Scenario:?\s*$/) && currentRequirement) {
        inScenario = true
        continue
      }

      // 收集 scenario 内容 (以 - 开头的行)
      if (inScenario && line.match(/^\s*-\s+/) && currentRequirement && currentRequirement.scenarios) {
        const scenarioText = line.replace(/^\s*-\s+/, '').trim()
        scenarioBuffer.push(scenarioText)
        continue
      }

      // 检测分隔符，结束当前 scenario
      if (line.match(/^---+$/) && inScenario) {
        if (scenarioBuffer.length > 0 && currentRequirement) {
          const scenarioText = scenarioBuffer.join(' | ')
          if (currentRequirement.scenarios) {
            currentRequirement.scenarios.push(scenarioText)
          }
        }
        scenarioBuffer = []
        inScenario = false
        continue
      }

      // 检测 MODIFIED 或 REMOVED 区块
      if (line.match(/^#{3}\s+(MODIFIED|REMOVED)\s+区块\s*$/)) {
        inScenario = false
        if (currentRequirement) {
          currentRequirement.status = line.includes('MODIFIED') ? 'modified' : 'removed'
        }
        continue
      }
    }

    // 保存最后一个需求及其 scenario
    if (currentRequirement && currentRequirement.text) {
      if (scenarioBuffer.length > 0 && currentRequirement.scenarios) {
        const scenarioText = scenarioBuffer.join(' | ')
        currentRequirement.scenarios.push(scenarioText)
      }
      requirements.push(currentRequirement as RequirementItem)
    }

    // 提取模块描述（从标题）
    const titleMatch = content.match(/^#\s+(.+)$/m)
    const description = titleMatch ? titleMatch[1].trim() : moduleName

    this.moduleRequirements.set(moduleName, {
      name: moduleName,
      description,
      requirements,
    })

    console.log(`  📋 ${moduleName}: ${requirements.length} 个需求`)
  }

  /**
   * 验证需求格式
   */
  validateRequirementsFormat() {
    console.log('\n🔍 验证需求文档格式...\n')

    for (const [moduleName, module] of this.moduleRequirements) {
      for (const req of module.requirements) {
        // 检查需求 ID 格式
        if (!req.id.match(/^REQ-\d+\.\d+$/)) {
          this.issues.push({
            type: 'format-error',
            module: moduleName,
            requirement: req.id,
            severity: 'error',
            message: `需求ID格式不正确: ${req.id}`,
          })
        }

        // 检查是否有 Scenario
        if (req.scenarios.length === 0 && req.status === 'active') {
          this.issues.push({
            type: 'missing-scenario',
            module: moduleName,
            requirement: req.id,
            severity: 'warning',
            message: `缺少场景定义`,
          })
        }

        // 检查 EARS 格式（简化检查）
        if (!req.text.includes('应当') && !req.text.includes('系统')) {
          this.issues.push({
            type: 'format-error',
            module: moduleName,
            requirement: req.id,
            severity: 'info',
            message: `需求可能不符合 EARS 格式（缺少"应当"或"系统"）`,
          })
        }
      }
    }
  }

  /**
   * 分析覆盖率
   */
  analyzeCoverage() {
    console.log('\n📊 分析代码覆盖率...\n')

    const documentedFeatures = new Set<string>()
    const uncoveredFeatures: CodeFeature[] = []

    // 从需求中提取已文档化的功能
    for (const [moduleName, module] of this.moduleRequirements) {
      for (const req of module.requirements) {
        // 提取功能关键词
        const keywords = this.extractFeatureKeywords(req.text, req.scenarios)
        for (const keyword of keywords) {
          documentedFeatures.add(keyword.toLowerCase())
        }
      }
    }

    // 检查未覆盖的功能
    for (const feature of this.codeFeatures) {
      const featureName = feature.name.toLowerCase()
      const isCovered = Array.from(documentedFeatures).some(keyword =>
        featureName.includes(keyword) || keyword.includes(featureName)
      )

      if (!isCovered) {
        uncoveredFeatures.push(feature)
      }
    }

    const coveredCount = this.codeFeatures.length - uncoveredFeatures.length
    const coverageRate = ((coveredCount / this.codeFeatures.length) * 100).toFixed(1)

    console.log(`✅ 已覆盖: ${coveredCount} 个`)
    console.log(`❌ 未覆盖: ${uncoveredFeatures.length} 个`)
    console.log(`📈 覆盖率: ${coverageRate}%\n`)

    if (coverageRate < '80') {
      this.issues.push({
        type: 'coverage-gap',
        severity: 'warning',
        message: `代码覆盖率仅为 ${coverageRate}%，建议达到至少 80%`,
      })

      console.log('⚠️ 未覆盖的功能点:')
      for (const f of uncoveredFeatures.slice(0, 10)) {
        console.log(`  - ${f.type}: ${f.name} (${f.path})`)
      }
      if (uncoveredFeatures.length > 10) {
        console.log(`  ... 还有 ${uncoveredFeatures.length - 10} 个`)
      }
    }
  }

  /**
   * 从需求和场景中提取功能关键词
   */
  private extractFeatureKeywords(text: string, scenarios: string[]): string[] {
    const keywords: string[] = []

    // 常见功能词
    const functionWords = [
      'login', 'logout', 'auth', 'authenticate', 'session',
      'workspace', 'chat', 'message', 'input',
      'settings', 'preference', 'config', 'configure',
      'menu', 'sidebar', 'panel', 'search',
      'file', 'upload', 'download', 'export', 'import',
      'shortcut', 'hotkey', 'keyboard',
      'theme', 'dark', 'light',
      'api', 'key', 'token',
      'onboard', 'welcome', 'setup',
      'skill', 'tool', 'action',
      'label', 'tag', 'status',
    ]

    const allText = [text, ...scenarios].join(' ').toLowerCase()

    for (const word of functionWords) {
      if (allText.includes(word)) {
        keywords.push(word)
      }
    }

    return keywords
  }

  /**
   * 验证模块完整性
   */
  validateModuleCompleteness() {
    console.log('\n📦 验证模块完整性...\n')

    const expectedModules = [
      'session-management',
      'workspace-management',
      'api-integration',
      'ai-chat',
      'onboarding',
      'settings',
      'shortcuts',
      'i18n',
    ]

    const missingModules: string[] = []

    for (const expected of expectedModules) {
      if (!this.moduleRequirements.has(expected)) {
        missingModules.push(expected)
        this.issues.push({
          type: 'missing-module',
          module: expected,
          severity: 'error',
          message: `模块需求文档缺失`,
        })
      }
    }

    if (missingModules.length > 0) {
      console.log(`❌ 缺失模块: ${missingModules.join(', ')}`)
    } else {
      console.log('✅ 所有预期模块都已文档化')
    }

    const coverageRate = ((this.moduleRequirements.size / expectedModules.length) * 100).toFixed(1)
    console.log(`📈 模块覆盖率: ${coverageRate}%\n`)

    if (parseFloat(coverageRate) < 80) {
      this.issues.push({
        type: 'coverage-gap',
        severity: 'error',
        message: `模块覆盖率仅为 ${coverageRate}%，未达到 80% 目标`,
      })
    }
  }

  /**
   * 打印验证报告
   */
  printReport() {
    console.log('\n' + '='.repeat(70))
    console.log('📊 需求验证报告')
    console.log('='.repeat(70))

    const errors = this.issues.filter(i => i.severity === 'error')
    const warnings = this.issues.filter(i => i.severity === 'warning')
    const infos = this.issues.filter(i => i.severity === 'info')

    console.log(`❌ 错误: ${errors.length}`)
    console.log(`⚠️  警告: ${warnings.length}`)
    console.log(`ℹ️  信息: ${infos.length}`)

    if (this.issues.length > 0) {
      console.log('\n' + '='.repeat(70))
      console.log('问题详情:')
      console.log('='.repeat(70))

      // 按类型分组
      const grouped = new Map<string, ValidationIssue[]>()
      for (const issue of this.issues) {
        const existing = grouped.get(issue.type) || []
        existing.push(issue)
        grouped.set(issue.type, existing)
      }

      for (const [type, issues] of grouped) {
        console.log(`\n${this.getTypeLabel(type)}: ${issues.length} 个`)

        for (const issue of issues) {
          const icon = issue.severity === 'error' ? '❌' : issue.severity === 'warning' ? '⚠️' : 'ℹ️'
          const location = issue.module ? ` [${issue.module}]` : issue.file ? ` [${path.basename(issue.file)}]` : ''
          const reqInfo = issue.requirement ? ` [${issue.requireation}]` : ''
          console.log(`  ${icon}${location}${reqInfo}`)
          console.log(`     ${issue.message}`)
        }
      }
    }

    console.log('\n' + '='.repeat(70))
    console.log(`总计: ${this.issues.length} 个问题`)
    console.log('='.repeat(70) + '\n')
  }

  /**
   * 获取问题类型标签
   */
  private getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'missing-requirements': '❌ 缺失需求文档',
      'missing-scenario': '⚠️ 缺少场景',
      'format-error': '📝 格式错误',
      'missing-module': '❌ 缺失模块',
      'coverage-gap': '📊 覆盖率问题',
    }
    return labels[type] || type
  }

  /**
   * 保存验证报告到 JSON
   */
  async saveReport() {
    const reportPath = path.join(this.projectRoot, 'test-results', 'requirements-validation.json')

    await fs.promises.mkdir(path.dirname(reportPath), { recursive: true })

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalIssues: this.issues.length,
        errors: this.issues.filter(i => i.severity === 'error').length,
        warnings: this.issues.filter(i => i.severity === 'warning').length,
        infos: this.issues.filter(i => i.severity === 'info').length,
        modulesCovered: this.moduleRequirements.size,
        codeFeaturesFound: this.codeFeatures.length,
      },
      issues: this.issues,
      moduleSummary: Array.from(this.moduleRequirements.entries()).map(([name, module]) => ({
        name,
        requirementCount: module.requirements.length,
        activeCount: module.requirements.filter(r => r.status === 'active').length,
      })),
    }

    await fs.promises.writeFile(reportPath, JSON.stringify(report, null, 2))
    console.log(`📝 验证报告已保存至: ${reportPath}`)
  }

  /**
   * 检查是否有需要修复的错误
   */
  hasErrors(): boolean {
    return this.issues.some(i => i.severity === 'error')
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 需求文档验证工具\n')
  console.log('='.repeat(70))

  // 使用当前工作目录作为项目根目录
  const projectRoot = process.cwd()
  const validator = new RequirementsValidator(projectRoot)

  try {
    // 1. 扫描代码功能点
    await validator.scanCodeFeatures()

    // 2. 加载需求文档
    await validator.loadRequirements()

    // 3. 如果没有需求文档，提前退出
    if (validator.moduleRequirements.size === 0) {
      console.log('\n⚠️ 未找到需求文档，请先生成需求文档后再运行验证')
      process.exit(1)
    }

    // 4. 验证格式
    validator.validateRequirementsFormat()

    // 5. 验证模块完整性
    validator.validateModuleCompleteness()

    // 6. 分析覆盖率
    validator.analyzeCoverage()

    // 7. 打印报告
    validator.printReport()

    // 8. 保存报告
    await validator.saveReport()

    // 9. 退出
    const exitCode = validator.hasErrors() ? 1 : 0
    process.exit(exitCode)

  } catch (error) {
    console.error('❌ 验证过程中发生错误:', error)
    process.exit(1)
  }
}

main()
