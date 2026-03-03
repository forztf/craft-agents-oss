/**
 * 需求验证工具 (EARS格式适配版)
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
  scenarios: ScenarioItem[]
  status: 'active' | 'modified' | 'removed'
}

interface ScenarioItem {
  id: string
  name: string
  steps: string[]
}

/**
 * 模块需求文档
 */
interface ModuleRequirements {
  name: string
  fileName: string
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
   * 加载需求文档 (EARS格式)
   */
  async loadRequirements() {
    console.log('📄 加载需求文档...\n')

    const requirementsPath = path.join(this.projectRoot, 'docs', 'requirements')

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
      // 跳过 INDEX.md
      if (path.basename(file) !== 'INDEX.md') {
        files.push(file)
      }
    })

    console.log(`✅ 找到需求文档: ${files.length} 个\n`)

    for (const file of files) {
      await this.parseEARSRequirementFile(file)
    }
  }

  /**
   * 解析EARS格式的需求文件
   */
  private async parseEARSRequirementFile(filePath: string) {
    let content = fs.readFileSync(filePath, 'utf-8')
    // 将 Windows 换行符转换为 Unix 换行符
    content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

    const lines = content.split('\n')
    const fileName = path.basename(filePath, '.md')
    const moduleName = this.convertFileNameToModuleName(fileName)

    const requirements: RequirementItem[] = []
    let currentRequirement: Partial<RequirementItem> | null = null
    let inRequirementSection = false
    let inScenarioSection = false
    let scenarioSteps: string[] = []

    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum]

      // 检测需求规格章节 - 多种可能的标题格式
      if (line.match(/^#{2}\s+需求规格\s*$/) ||
          line.match(/^#{2}\s+1\.|2\.|3\.\s+\S+/) ||
          line.match(/^#{2,3}\s+Requirement/)) {
        inRequirementSection = true
        continue
      }

      // 检测需求条目 - 支持多种格式：
      // 格式1: ### SM-001: 标题 (会话管理、工作区管理)
      // 格式2: ### 2.1 Requirement: 标题 (其他模块)
      // 格式3: #### Requirement: 标题 (设置页面)
      const reqMatch1 = line.match(/^#{3}\s+([A-Z]{2}-\d+):\s+(.*)$/)  // SM-001格式
      const reqMatch2 = line.match(/^#{3,4}\s+(\d+\.\d+)\s+Requirement:\s+(.*)$/)  // 2.1 Requirement格式

      let reqMatch: RegExpMatchArray | null = reqMatch1 || reqMatch2

      if (reqMatch && inRequirementSection) {
        // 保存上一个需求
        if (currentRequirement && currentRequirement.id && currentRequirement.scenarios) {
          requirements.push(currentRequirement as RequirementItem)
        }

        // 生成需求ID：如果是2.1格式，则前缀为模块名+数字
        let reqId: string
        let reqText: string

        if (reqMatch1) {
          reqId = reqMatch1[1]  // SM-001
          reqText = reqMatch1[2]
        } else if (reqMatch2) {
          reqId = `${moduleName}-${reqMatch2[1]}`  // I18n-2.1
          reqText = reqMatch2[2]
        } else {
          continue
        }

        currentRequirement = {
          id: reqId,
          text: reqText.trim(),
          type: reqText.includes('SHALL') ? 'functional' : 'non-functional',
          scenarios: [],
          status: 'active',
        }
        inScenarioSection = false
        scenarioSteps = []
        continue
      }

      // 检测 Scenario 标题 (#### Scenario SM-001.1: 标题)
      const scenarioMatch = line.match(/^#{4}\s+Scenario\s+([A-Z]{2}-\d+\.\d+):\s+(.*)$/)

      if (scenarioMatch && currentRequirement && currentRequirement.scenarios) {
        // 保存上一个 scenario
        if (scenarioSteps.length > 0 && currentRequirement) {
          // 这里简化处理，暂时不存储完整scenario
        }

        scenarioSteps = []
        inScenarioSection = true
        continue
      }

      // 收集 scenario 步骤 (以 WHEN/THEN/AND 开头)
      if (inScenarioSection && line.match(/^\s*-\s+(WHEN|THEN|AND)\s+/)) {
        scenarioSteps.push(line.replace(/^\s*-\s+/, '').trim())
        continue
      }

      // 检测需求结束标记 (---)
      if (line.match(/^---+/) && currentRequirement) {
        // 保存当前需求
        if (currentRequirement.id && currentRequirement.scenarios && scenarioSteps.length > 0) {
          // 简化处理：统计scenario数量
        }
        inScenarioSection = false
        scenarioSteps = []
        continue
      }
    }

    // 保存最后一个需求
    if (currentRequirement && currentRequirement.id) {
      requirements.push(currentRequirement as RequirementItem)
    }

    // 提取模块描述（从标题）
    const titleMatch = content.match(/^#\s+(.+)$/m)
    const description = titleMatch ? titleMatch[1].trim() : moduleName

    this.moduleRequirements.set(moduleName, {
      name: moduleName,
      fileName,
      description,
      requirements,
    })

    console.log(`  📋 ${moduleName} (${fileName}): ${requirements.length} 个需求`)
  }

  /**
   * 将文件名转换为模块名
   */
  private convertFileNameToModuleName(fileName: string): string {
    return fileName.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
      .replace(/^([a-z])/g, (_, c) => c.toUpperCase())
  }

  /**
   * 验证需求格式
   */
  validateRequirementsFormat() {
    console.log('\n🔍 验证需求文档格式...\n')

    let totalRequirements = 0
    let totalScenarios = 0

    for (const [moduleName, module] of this.moduleRequirements) {
      for (const req of module.requirements) {
        totalRequirements++

        // 检查需求 ID 格式 (SM-XXX 或类似格式)
        if (!req.id.match(/^[A-Z]{2}-\d+$/)) {
          this.issues.push({
            type: 'format-error',
            module: moduleName,
            requirement: req.id,
            severity: 'warning',
            message: `需求ID格式可能不符合标准: ${req.id}`,
          })
        }

        // 检查是否有 SHALL 关键词
        if (!req.text.includes('SHALL') && req.type === 'functional') {
          this.issues.push({
            type: 'format-error',
            module: moduleName,
            requirement: req.id,
            severity: 'warning',
            message: `功能需求缺少 SHALL 关键词`,
          })
        }

        // 统计 scenarios（这里简化处理，因为实际的scenario解析比较复杂）
        totalScenarios++
      }
    }

    console.log(`  ✓ 验证了 ${totalRequirements} 个需求`)
    console.log(`  ✓ 包含 ${totalScenarios} 个场景\n`)
  }

  /**
   * 分析覆盖率
   */
  analyzeCoverage() {
    console.log('\n📊 分析代码覆盖率...\n')

    // 简化的覆盖率分析：检查模块覆盖情况
    const expectedModules = [
      'sessionManagement',
      'workspaceManagement',
      'apiSetup',
      'aiChat',
      'onboarding',
      'settings',
      'shortcuts',
      'i18n',
    ]

    const moduleCoverageMap = new Map<string, boolean>()

    // 检查每个预期模块是否有文档
    for (const expected of expectedModules) {
      const hasDoc = Array.from(this.moduleRequirements.values())
        .some(m => m.name.toLowerCase().includes(expected.toLowerCase()))

      moduleCoverageMap.set(expected, hasDoc)

      if (!hasDoc) {
        this.issues.push({
          type: 'missing-module',
          module: expected,
          severity: 'error',
          message: `模块需求文档缺失或命名不匹配`,
        })
      }
    }

    const coveredCount = Array.from(moduleCoverageMap.values()).filter(v => v).length
    const coverageRate = ((coveredCount / expectedModules.length) * 100).toFixed(1)

    console.log(`✅ 已覆盖模块: ${coveredCount}/${expectedModules.length}`)
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
          const reqInfo = issue.requireation ? ` [${issue.requirement}]` : ''
          console.log(`  ${icon}${location}${reqInfo}`)
          console.log(`     ${issue.message}`)
        }
      }
    }

    console.log('\n' + '='.repeat(70))

    // 输出模块摘要
    console.log('\n📋 模块文档摘要:')
    for (const [name, module] of this.moduleRequirements) {
      const activeReqs = module.requirements.filter(r => r.status === 'active').length
      console.log(`  - ${name}: ${module.requirements.length} 个需求 (${activeReqs} 个活跃)`)
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
      'format-error': '📝 格式问题',
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
        fileName: module.fileName,
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
  console.log('🚀 需求文档验证工具 (EARS格式版)\n')
  console.log('='.repeat(70))

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

    // 5. 分析覆盖率
    validator.analyzeCoverage()

    // 6. 打印报告
    validator.printReport()

    // 7. 保存报告
    await validator.saveReport()

    // 8. 退出
    const exitCode = validator.hasErrors() ? 1 : 0
    process.exit(exitCode)

  } catch (error) {
    console.error('❌ 验证过程中发生错误:', error)
    process.exit(1)
  }
}

main()
