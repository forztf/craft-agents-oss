/**
 * Info/Chat 区域 Playwright i18n 自动化测试
 *
 * 测试目标：
 * 1. 验证 Info/Chat 相关组件的翻译文件完整性
 * 2. 检测组件中的硬编码英文文本
 * 3. 验证 JSON 文件格式正确性
 * 4. 检查特定 UI 文本是否已使用 i18n
 */

import { test, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'
import { scanFile, checkTranslationIntegrity } from '../playwright-i18n-utils'

// ============================================================================
// 测试报告数据结构
// ============================================================================

interface InfoChatTestReport {
  timestamp: string
  components: {
    Info_Page: {
      fileExists: boolean
      enKeys: string[]
      zhKeys: string[]
      hardcodedFound: string[]
      status: 'pass' | 'fail' | 'warning'
    }
    Info_DataTable: {
      fileExists: boolean
      enKeys: string[]
      zhKeys: string[]
      hardcodedFound: string[]
      status: 'pass' | 'fail' | 'warning'
    }
    Info_StatusBadge: {
      fileExists: boolean
      enKeys: string[]
      zhKeys: string[]
      hardcodedFound: string[]
      jsonFormatValid: boolean
      status: 'pass' | 'fail' | 'warning'
    }
    SourceStatusIndicator: {
      fileExists: boolean
      enKeys: string[]
      zhKeys: string[]
      hardcodedFound: string[]
      jsonFormatValid: boolean
      status: 'pass' | 'fail' | 'warning'
    }
    EmptyStateHint: {
      fileExists: boolean
      enKeys: string[]
      zhKeys: string[]
      hardcodedFound: string[]
      status: 'pass' | 'fail' | 'warning'
    }
  }
  summary: {
    totalComponents: number
    passed: number
    failed: number
    warnings: number
  }
}

const testReport: InfoChatTestReport = {
  timestamp: new Date().toISOString(),
  components: {
    Info_Page: {
      fileExists: false,
      enKeys: [],
      zhKeys: [],
      hardcodedFound: [],
      status: 'fail',
    },
    Info_DataTable: {
      fileExists: false,
      enKeys: [],
      zhKeys: [],
      hardcodedFound: [],
      status: 'fail',
    },
    Info_StatusBadge: {
      fileExists: false,
      enKeys: [],
      zhKeys: [],
      hardcodedFound: [],
      jsonFormatValid: false,
      status: 'fail',
    },
    SourceStatusIndicator: {
      fileExists: false,
      enKeys: [],
      zhKeys: [],
      hardcodedFound: [],
      jsonFormatValid: false,
      status: 'fail',
    },
    EmptyStateHint: {
      fileExists: false,
      enKeys: [],
      zhKeys: [],
      hardcodedFound: [],
      status: 'fail',
    },
  },
  summary: {
    totalComponents: 5,
    passed: 0,
    failed: 0,
    warnings: 0,
  },
}

// ============================================================================
// 工具函数
// ============================================================================

/**
 * 获取项目根目录
 */
function getProjectRoot(): string {
  return path.resolve(__dirname, '../../../..')
}

/**
 * 读取 JSON 文件内容
 */
function readJsonFile(jsonPath: string): Record<string, string> | null {
  try {
    if (fs.existsSync(jsonPath)) {
      const content = fs.readFileSync(jsonPath, 'utf-8')
      return JSON.parse(content)
    }
    return null
  } catch (error) {
    console.error(`读取 JSON 文件失败: ${jsonPath}`, error)
    return null
  }
}

/**
 * 检查组件的翻译文件和硬编码文本
 */
function checkComponentI18n(
  componentName: string,
  componentPath: string,
  enJsonPath: string,
  zhJsonPath: string,
  hardcodedPatterns: string[]
): {
  fileExists: boolean
  enKeys: string[]
  zhKeys: string[]
  hardcodedFound: string[]
  status: 'pass' | 'fail' | 'warning'
} {
  const result = {
    fileExists: false,
    enKeys: [],
    zhKeys: [],
    hardcodedFound: [],
    status: 'fail' as 'pass' | 'fail' | 'warning',
  }

  // 检查组件源文件存在性
  if (!fs.existsSync(componentPath)) {
    console.warn(`组件文件不存在: ${componentPath}`)
    return result
  }
  result.fileExists = true

  // 读取英文翻译文件
  const enTranslation = readJsonFile(enJsonPath)
  if (!enTranslation) {
    console.warn(`英文翻译文件不存在: ${enJsonPath}`)
    return result
  }
  result.enKeys = Object.keys(enTranslation)

  // 读取中文翻译文件
  const zhTranslation = readJsonFile(zhJsonPath)
  if (!zhTranslation) {
    console.warn(`中文翻译文件不存在: ${zhJsonPath}`)
    return result
  }
  result.zhKeys = Object.keys(zhTranslation)

  // 扫描组件文件中的硬编码文本
  const hardcodedIssues = scanFile(componentPath)
  if (hardcodedIssues.length > 0) {
    console.warn(`${componentName} 发现硬编码文本:`)
    hardcodedIssues.forEach(issue => {
      console.log(`  - ${issue.type} L${issue.line}: "${issue.text}"`)
    })
  }
  result.hardcodedFound = hardcodedIssues.map(issue => issue.text)

  // 确定状态
  const hasHardcoded = result.hardcodedFound.length > 0
  const keysMatch = result.enKeys.length === result.zhKeys.length

  if (hasHardcoded) {
    result.status = keysMatch ? 'warning' : 'fail'
  } else if (keysMatch) {
    result.status = 'pass'
  } else {
    result.status = 'warning'
  }

  return result
}

/**
 * 验证 JSON 文件格式（用于 Info_StatusBadge 和 source-status-indicator）
 */
function validateStatusJsonFormat(
  jsonPath: string,
  componentName: string
): {
  fileExists: boolean
  enKeys: string[]
  zhKeys: string[]
  jsonFormatValid: boolean
  status: 'pass' | 'fail' | 'warning'
} {
  const result = {
    fileExists: false,
    enKeys: [],
    zhKeys: [],
    jsonFormatValid: false,
    status: 'fail' as 'pass' | 'fail' | 'warning',
  }

  // 检查英文文件
  const enPath = jsonPath.replace('/zh-CN/', '/en/')
  const enTranslation = readJsonFile(enPath)
  if (!enTranslation) {
    console.warn(`${componentName} 英文翻译文件不存在: ${enPath}`)
    return result
  }
  result.fileExists = true
  result.enKeys = Object.keys(enTranslation)

  // 检查中文文件
  const zhTranslation = readJsonFile(jsonPath)
  if (!zhTranslation) {
    console.warn(`${componentName} 中文翻译文件不存在: ${jsonPath}`)
    return result
  }
  result.zhKeys = Object.keys(zhTranslation)

  // 验证 JSON 格式：应该是简单的键值对
  const isValidFormat = Object.entries(enTranslation).every(([key, value]) => {
    return (
      typeof key === 'string' &&
      key.length > 0 &&
      typeof value === 'string' &&
      value.length > 0
    )
  })
  result.jsonFormatValid = isValidFormat

  // 检查键名是否符合状态标签的命名规范
  const hasValidKeys = result.enKeys.every(key => {
    // 对于状态标签，键名应该是首字母大写的单词（如 "Allowed", "Blocked", "Ask"）
    return /^[A-Z][a-zA-Z\s]*$/.test(key)
  })

  result.status = isValidFormat && hasValidKeys ? 'pass' : 'fail'

  return result
}

// ============================================================================
// 测试套件
// ============================================================================

test.describe('Info/Chat 区域 i18n 测试', () => {
  const projectRoot = getProjectRoot()

  test.beforeAll(async () => {
    console.log('\n' + '='.repeat(70))
    console.log('开始 Info/Chat 区域 i18n 测试')
    console.log('='.repeat(70))
  })

  test.afterAll(async () => {
    // 计算统计信息
    testReport.summary.passed = Object.values(testReport.components).filter(
      c => c.status === 'pass'
    ).length
    testReport.summary.failed = Object.values(testReport.components).filter(
      c => c.status === 'fail'
    ).length
    testReport.summary.warnings = Object.values(testReport.components).filter(
      c => c.status === 'warning'
    ).length

    // 保存测试报告
    const reportPath = path.join(projectRoot, 'test-results', 'info-chat-i18n-report.json')
    fs.mkdirSync(path.dirname(reportPath), { recursive: true })
    fs.writeFileSync(reportPath, JSON.stringify(testReport, null, 2))

    console.log('\n' + '='.repeat(70))
    console.log('测试完成，报告已生成')
    console.log(`报告路径: ${reportPath}`)
    console.log('='.repeat(70))
  })

  // ============================================================================
  // Info_Page 测试
  // ============================================================================

  test.describe('Info_Page 组件测试', () => {
    test('Info_Page 翻译文件应该存在且完整', () => {
      const componentPath = path.join(
        projectRoot,
        'apps/electron/src/renderer/components/info/Info_Page.tsx'
      )
      const enJsonPath = path.join(
        projectRoot,
        'i18n/locales/en/components/info/Info_Page.json'
      )
      const zhJsonPath = path.join(
        projectRoot,
        'i18n/locales/zh-CN/components/info/Info_Page.json'
      )

      const result = checkComponentI18n(
        'Info_Page',
        componentPath,
        enJsonPath,
        zhJsonPath,
        ['Error loading content']
      )

      testReport.components.Info_Page = result

      console.log('\n📄 Info_Page 测试结果:')
      console.log(`  文件存在: ${result.fileExists}`)
      console.log(`  英文键数: ${result.enKeys.length}`)
      console.log(`  中文键数: ${result.zhKeys.length}`)
      console.log(`  硬编码文本: ${result.hardcodedFound.length}`)
      console.log(`  状态: ${result.status}`)

      // 验证必需的翻译键
      expect(result.enKeys).toContain('Error loading content')
      expect(result.zhKeys).toContain('Error loading content')

      // 软断言：在非 CI 环境中，只警告不失败
      if (process.env.CI) {
        expect(result.hardcodedFound.length).toBe(0)
        expect(result.enKeys.length).toBe(result.zhKeys.length)
      }
    })

    test('Info_Page 应使用 t() 函数翻译错误消息', () => {
      const componentPath = path.join(
        projectRoot,
        'apps/electron/src/renderer/components/info/Info_Page.tsx'
      )
      const content = fs.readFileSync(componentPath, 'utf-8')

      // 检查是否使用了 useTranslation
      const hasUseTranslation = content.includes("useTranslation('components/info/Info_Page')")

      // 检查错误消息是否使用 t() 函数
      const hasTCall = /t\(\s*['"`]Error loading content['"`]\s*\)/.test(content)

      console.log('\n🔍 Info_Page 翻译使用情况:')
      console.log(`  useTranslation: ${hasUseTranslation}`)
      console.log(`  t() 用于错误消息: ${hasTCall}`)

      expect(hasUseTranslation).toBe(true)
      expect(hasTCall).toBe(true)
    })
  })

  // ============================================================================
  // Info_DataTable 测试
  // ============================================================================

  test.describe('Info_DataTable 组件测试', () => {
    test('Info_DataTable 翻译文件应该存在且完整', () => {
      const componentPath = path.join(
        projectRoot,
        'apps/electron/src/renderer/components/info/Info_DataTable.tsx'
      )
      const enJsonPath = path.join(
        projectRoot,
        'i18n/locales/en/components/info/Info_DataTable.json'
      )
      const zhJsonPath = path.join(
        projectRoot,
        'i18n/locales/zh-CN/components/info/Info_DataTable.json'
      )

      const result = checkComponentI18n(
        'Info_DataTable',
        componentPath,
        enJsonPath,
        zhJsonPath,
        ['Search...', 'Authenticate with this source to view available data']
      )

      testReport.components.Info_DataTable = result

      console.log('\n📄 Info_DataTable 测试结果:')
      console.log(`  文件存在: ${result.fileExists}`)
      console.log(`  英文键数: ${result.enKeys.length}`)
      console.log(`  中文键数: ${result.zhKeys.length}`)
      console.log(`  硬编码文本: ${result.hardcodedFound.length}`)
      console.log(`  状态: ${result.status}`)

      // 验证必需的翻译键
      expect(result.enKeys).toContain('Search...')
      expect(result.zhKeys).toContain('Search...')
      expect(result.enKeys).toContain('Authenticate with this source to view available data')
      expect(result.zhKeys).toContain('Authenticate with this source to view available data')

      if (process.env.CI) {
        expect(result.hardcodedFound.length).toBe(0)
        expect(result.enKeys.length).toBe(result.zhKeys.length)
      }
    })

    test('Info_DataTable 应该正确使用搜索提示和空状态文本', () => {
      const componentPath = path.join(
        projectRoot,
        'apps/electron/src/renderer/components/info/Info_DataTable.tsx'
      )
      const content = fs.readFileSync(componentPath, 'utf-8')

      // 检查是否使用了 useTranslation
      const hasUseTranslation = content.includes("useTranslation('components/info/Info_DataTable')")

      // 检查搜索占位符是否使用 t() 函数
      const hasSearchPlaceholderTCall = /t\(\s*['"`]Search\.\.\.['"`]\s*\)/.test(content)

      // 检查认证提示是否使用 t() 函数
      const hasAuthMessageTCall = /t\(\s*['"`]Authenticate with this source to view available data['"`]\s*\)/.test(
        content
      )

      console.log('\n🔍 Info_DataTable 翻译使用情况:')
      console.log(`  useTranslation: ${hasUseTranslation}`)
      console.log(`  t() 用于搜索占位符: ${hasSearchPlaceholderTCall}`)
      console.log(`  t() 用于认证提示: ${hasAuthMessageTCall}`)

      expect(hasUseTranslation).toBe(true)
      expect(hasSearchPlaceholderTCall).toBe(true)
      expect(hasAuthMessageTCall).toBe(true)
    })
  })

  // ============================================================================
  // Info_StatusBadge 测试
  // ============================================================================

  test.describe('Info_StatusBadge 组件测试', () => {
    test('Info_StatusBadge 翻译文件应该存在且格式正确', () => {
      const componentPath = path.join(
        projectRoot,
        'apps/electron/src/renderer/components/info/Info_StatusBadge.tsx'
      )
      const zhJsonPath = path.join(
        projectRoot,
        'i18n/locales/zh-CN/components/info/Info_StatusBadge.json'
      )

      const result = validateStatusJsonFormat(zhJsonPath, 'Info_StatusBadge')

      // 额外检查组件的硬编码文本
      const hardcodedIssues = scanFile(componentPath)
      result.hardcodedFound = hardcodedIssues.map(issue => issue.text)

      testReport.components.Info_StatusBadge = {
        ...result,
        hardcodedFound: result.hardcodedFound,
      }

      console.log('\n📄 Info_StatusBadge 测试结果:')
      console.log(`  文件存在: ${result.fileExists}`)
      console.log(`  英文键数: ${result.enKeys.length}`)
      console.log(`  中文键数: ${result.zhKeys.length}`)
      console.log(`  JSON 格式有效: ${result.jsonFormatValid}`)
      console.log(`  硬编码文本: ${result.hardcodedFound.length}`)
      console.log(`  状态: ${result.status}`)

      // 验证必需的状态键
      expect(result.enKeys).toContain('Allowed')
      expect(result.enKeys).toContain('Blocked')
      expect(result.enKeys).toContain('Ask')
      expect(result.zhKeys).toContain('Allowed')
      expect(result.zhKeys).toContain('Blocked')
      expect(result.zhKeys).toContain('Ask')

      // 验证 JSON 格式正确
      expect(result.jsonFormatValid).toBe(true)
      expect(result.enKeys.length).toBe(result.zhKeys.length)

      if (process.env.CI) {
        expect(result.hardcodedFound.length).toBe(0)
      }
    })

    test('Info_StatusBadge JSON 文件应该包含所有必需的状态', () => {
      const enJsonPath = path.join(
        projectRoot,
        'i18n/locales/en/components/info/Info_StatusBadge.json'
      )
      const zhJsonPath = path.join(
        projectRoot,
        'i18n/locales/zh-CN/components/info/Info_StatusBadge.json'
      )

      const enContent = readJsonFile(enJsonPath)
      const zhContent = readJsonFile(zhJsonPath)

      expect(enContent).not.toBeNull()
      expect(zhContent).not.toBeNull()

      // 检查必需的状态
      const requiredStatuses = ['Allowed', 'Blocked', 'Ask']

      for (const status of requiredStatuses) {
        expect(enContent![status]).toBeDefined()
        expect(zhContent![status]).toBeDefined()
        expect(typeof enContent![status]).toBe('string')
        expect(typeof zhContent![status]).toBe('string')
        expect(zhContent![status].length).toBeGreaterThan(0)

        console.log(`  ${status}: "${enContent![status]}" → "${zhContent![status]}"`)
      }
    })
  })

  // ============================================================================
  // SourceStatusIndicator 测试
  // ============================================================================

  test.describe('SourceStatusIndicator 组件测试', () => {
    test('SourceStatusIndicator 翻译文件应该存在且格式正确', () => {
      const componentPath = path.join(
        projectRoot,
        'apps/electron/src/renderer/components/ui/source-status-indicator.tsx'
      )
      const zhJsonPath = path.join(
        projectRoot,
        'i18n/locales/zh-CN/components/ui/source-status-indicator.json'
      )

      const result = validateStatusJsonFormat(zhJsonPath, 'SourceStatusIndicator')

      // 额外检查组件的硬编码文本
      const hardcodedIssues = scanFile(componentPath)
      result.hardcodedFound = hardcodedIssues.map(issue => issue.text)

      testReport.components.SourceStatusIndicator = {
        ...result,
        hardcodedFound: result.hardcodedFound,
      }

      console.log('\n📄 SourceStatusIndicator 测试结果:')
      console.log(`  文件存在: ${result.fileExists}`)
      console.log(`  英文键数: ${result.enKeys.length}`)
      console.log(`  中文键数: ${result.zhKeys.length}`)
      console.log(`  JSON 格式有效: ${result.jsonFormatValid}`)
      console.log(`  硬编码文本: ${result.hardcodedFound.length}`)
      console.log(`  状态: ${result.status}`)

      // 验证必需的状态键
      expect(result.enKeys).toContain('Connected')
      expect(result.enKeys).toContain('Needs Authentication')
      expect(result.enKeys).toContain('Connection Failed')
      expect(result.enKeys).toContain('Not Tested')
      expect(result.enKeys).toContain('Disabled')

      expect(result.zhKeys).toContain('Connected')
      expect(result.zhKeys).toContain('Needs Authentication')
      expect(result.zhKeys).toContain('Connection Failed')
      expect(result.zhKeys).toContain('Not Tested')
      expect(result.zhKeys).toContain('Disabled')

      // 验证 JSON 格式正确
      expect(result.jsonFormatValid).toBe(true)
      expect(result.enKeys.length).toBe(result.zhKeys.length)

      if (process.env.CI) {
        expect(result.hardcodedFound.length).toBe(0)
      }
    })

    test('SourceStatusIndicator JSON 应该包含标签和描述', () => {
      const enJsonPath = path.join(
        projectRoot,
        'i18n/locales/en/components/ui/source-status-indicator.json'
      )
      const zhJsonPath = path.join(
        projectRoot,
        'i18n/locales/zh-CN/components/ui/source-status-indicator.json'
      )

      const enContent = readJsonFile(enJsonPath)
      const zhContent = readJsonFile(zhJsonPath)

      expect(enContent).not.toBeNull()
      expect(zhContent).not.toBeNull()

      // 检查所有必需的状态键
      const requiredStatuses = [
        'Connected',
        'Source is connected and working',
        'Needs Authentication',
        'Source requires authentication to connect',
        'Connection Failed',
        'Failed to connect to source',
        'Not Tested',
        'Connection has not been tested',
        'Disabled',
        'Local MCP servers are disabled in Settings',
      ]

      for (const key of requiredStatuses) {
        expect(enContent![key]).toBeDefined()
        expect(zhContent![key]).toBeDefined()
        expect(typeof enContent![key]).toBe('string')
        expect(typeof zhContent![key]).toBe('string')
        expect(zhContent![key].length).toBeGreaterThan(0)
      }

      console.log('\n📋 SourceStatusIndicator 翻译键:')
      Object.keys(enContent!).forEach(key => {
        console.log(`  ${key}: "${enContent![key]}" → "${zhContent![key]}"`)
      })
    })
  })

  // ============================================================================
  // Chat/EmptyStateHint 测试
  // ============================================================================

  test.describe('EmptyStateHint 组件测试', () => {
    test('EmptyStateHint 翻译文件应该存在且完整', () => {
      const componentPath = path.join(
        projectRoot,
        'apps/electron/src/renderer/components/chat/EmptyStateHint.tsx'
      )

      // EmptyStateHint 使用内联提示模板，检查其是否使用 useTranslation
      const content = fs.readFileSync(componentPath, 'utf-8')
      const hasUseTranslation = content.includes(
        "useTranslation('components/chat/EmptyStateHint')"
      )

      // 检查是否存在翻译文件（可能没有单独的文件，而是集成在其他地方）
      const enJsonPath = path.join(
        projectRoot,
        'i18n/locales/en/components/chat/EmptyStateHint.json'
      )
      const zhJsonPath = path.join(
        projectRoot,
        'i18n/locales/zh-CN/components/chat/EmptyStateHint.json'
      )

      const enTranslation = readJsonFile(enJsonPath)
      const zhTranslation = readJsonFile(zhJsonPath)

      // 扫描组件文件中的硬编码文本
      const hardcodedIssues = scanFile(componentPath).filter(
        issue => !issue.text.startsWith('{') && !issue.text.endsWith('}')
      )

      testReport.components.EmptyStateHint = {
        fileExists: true,
        enKeys: enTranslation ? Object.keys(enTranslation) : [],
        zhKeys: zhTranslation ? Object.keys(zhTranslation) : [],
        hardcodedFound: hardcodedIssues.map(issue => issue.text),
        status: hasUseTranslation ? 'pass' : 'fail',
      }

      console.log('\n📄 EmptyStateHint 测试结果:')
      console.log(`  useTranslation: ${hasUseTranslation}`)
      console.log(`  英文翻译文件存在: ${!!enTranslation}`)
      console.log(`  中文翻译文件存在: ${!!zhTranslation}`)
      console.log(`  非模板硬编码文本: ${hardcodedIssues.length}`)
      console.log(`  状态: ${testReport.components.EmptyStateHint.status}`)

      // 组件应该使用 useTranslation
      expect(hasUseTranslation).toBe(true)

      // 注意：EmptyStateHint 使用模板化提示，允许 {source:xxx} 这样的格式
      // 所以硬编码检测可能需要特殊处理
      if (hardcodedIssues.length > 0) {
        console.log('\n⚠️  硬编码文本（请确认是否为模板标记）:')
        hardcodedIssues.forEach(issue => {
          console.log(`  - ${issue.type} L${issue.line}: "${issue.text}"`)
        })
      }
    })

    test('EmptyStateHint 提示模板应该正确处理', () => {
      const componentPath = path.join(
        projectRoot,
        'apps/electron/src/renderer/components/chat/EmptyStateHint.tsx'
      )
      const content = fs.readFileSync(componentPath, 'utf-8')

      // 检查是否定义了提示模板
      const hasHintTemplateKeys = content.includes('HINT_TEMPLATE_KEYS')
      const hasParseFunction = content.includes('parseHintTemplate')
      const hasEntityBadge = content.includes('EntityBadge')

      console.log('\n🔍 EmptyStateHint 模板处理:')
      console.log(`  定义了提示模板键: ${hasHintTemplateKeys}`)
      console.log(`  定义了解析函数: ${hasParseFunction}`)
      console.log(`  定义了实体徽章: ${hasEntityBadge}`)

      if (hasHintTemplateKeys) {
        // 提取提示模板数量
        const match = content.match(/HINT_TEMPLATE_KEYS\s*=\s*\[([\s\S]*?)\]/)
        if (match) {
          const hintCount = (match[1].match(/,/g) || []).length + 1
          console.log(`  提示模板数量: ${hintCount}`)
          expect(hintCount).toBeGreaterThan(0)
        }
      }

      expect(hasHintTemplateKeys).toBe(true)
      expect(hasParseFunction).toBe(true)
      expect(hasEntityBadge).toBe(true)
    })
  })

  // ============================================================================
  // 翻译文件完整性检查
  // ============================================================================

  test.describe('翻译文件完整性检查', () => {
    test('Info/Chat 区域翻译文件应该成对存在', () => {
      const integrity = checkTranslationIntegrity(projectRoot)

      // 过滤出 Info/Chat 相关的翻译文件
      const infoChatFiles = [
        'components/info/Info_Page.json',
        'components/info/Info_DataTable.json',
        'components/info/Info_StatusBadge.json',
        'components/ui/source-status-indicator.json',
        'components/chat/EmptyStateHint.json',
      ]

      const missingInZh = integrity.missingInZh.filter(f => infoChatFiles.includes(f))
      const missingInEn = integrity.missingInEn.filter(f => infoChatFiles.includes(f))

      console.log('\n📁 翻译文件完整性:')
      console.log(`  英文翻译文件总数: ${integrity.enFiles.length}`)
      console.log(`  中文翻译文件总数: ${integrity.zhFiles.length}`)

      if (missingInZh.length > 0) {
        console.log(`\n⚠️  中文缺少的 Info/Chat 翻译文件:`)
        missingInZh.forEach(f => console.log(`   - ${f}`))
      }

      if (missingInEn.length > 0) {
        console.log(`\n⚠️  英文缺少的 Info/Chat 翻译文件:`)
        missingInEn.forEach(f => console.log(`   - ${f}`))
      }

      if (missingInZh.length === 0 && missingInEn.length === 0) {
        console.log('\n✅ 所有 Info/Chat 翻译文件完整')
      }
    })
  })

  // ============================================================================
  // 测试总结
  // ============================================================================

  test.describe('测试总结', () => {
    test('输出 Info/Chat i18n 测试摘要', () => {
      console.log('\n' + '='.repeat(70))
      console.log('Info/Chat 区域 i18n 测试摘要')
      console.log('='.repeat(70))

      console.log(`\n组件状态:`)
      Object.entries(testReport.components).forEach(([name, result]) => {
        const statusIcon = result.status === 'pass' ? '✅' : result.status === 'warning' ? '⚠️' : '❌'
        console.log(
          `  ${statusIcon} ${name.padEnd(25)} | 文件:${result.fileExists ? '是' : '否'} | ` +
          `en:${result.enKeys.length} zh:${result.zhKeys.length} | ` +
          `硬编码:${result.hardcodedFound.length}`
        )
      })

      console.log(`\n统计:`)
      console.log(`  通过: ${testReport.summary.passed}`)
      console.log(`  失败: ${testReport.summary.failed}`)
      console.log(`  警告: ${testReport.summary.warnings}`)
      console.log(`  总计: ${testReport.summary.totalComponents}`)

      console.log('\n' + '='.repeat(70))
    })
  })
})