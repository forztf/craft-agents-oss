# 国际化模块需求规范 (i18n Module Specification)

本文档通过逆向分析 Craft Agents 代码库的国际化模块实现生成，使用 EARS 语法描述功能需求。

## ADDED Requirements

### Requirement: 多语言支持
系统 SHALL 支持英文和简体中文两种语言设置。

#### Scenario: 应用启动时加载用户偏好语言
- **WHEN** 应用启动时，从 Electron 的持久化配置文件读取语言偏好
- **THEN** 系统 SHALL 根据偏好值设置为 'en' 或 'zh-CN'（若偏好为 'zh-CN' 或遗留的 '简体中文' 值')
- **AND** 若读取失败或偏好值无效，系统 SHALL 默认使用英文 'en'
- **AND** isLoading 状态 SHALL 设置为 false 表示初始化完成
> 来源:apps/electron/src/renderer/contexts/I18nContext.tsx:27-44

#### Scenario: 支持遗留中文值兼容性
- **WHEN** 从配置中读取到的语言值为遗留的 '简体中文'（Unicode 编码 0x7b80 0x4f53 0x4e2d 0x6587）
- **THEN** 系统 SHALL 将其识别并转换为 'zh-CN' 标准语言代码
> 来源:apps/electron/src/renderer/contexts/I18nContext.tsx:6,33-34

---

### Requirement: 语言切换与持久化
系统 SHALL 允许用户切换应用语言，并将选择通过 Electron IPC 持久化到配置文件。

#### Scenario: 用户切换语言
- **WHEN** 用户通过 UI 调用 setLanguage(lang) 切换语言
- **THEN** 系统 SHALL 立即更新当前语言状态
- **AND** 系统 SHALL 重新筛选并加载新语言的翻译文件
- **AND** 系统 SHALL 通过 window.electronAPI.writePreferences 更新配置中的 language 字段
- **AND** 若保存失败，系统 SHALL 记录错误日志到控制台但不影响语言切换
> 来源:apps/electron/src/renderer/contexts/I18nContext.tsx:101-114

---

### Requirement: 翻译文件命名空间隔离
系统 SHALL 使用文件路径作为命名空间来组织和管理翻译 key，确保不同组件的翻译独立隔离。

#### Scenario: 按组件路径组织翻译文件
- **WHEN** 翻译文件位于 `i18n/locales/{language}/{component-path}.json`
- **THEN** 系统 SHALL 从文件路径解析提取命名空间（如 `components/app-shell/ChatDisplay`）
> 来源:apps/electron/src/renderer/contexts/I18nContext.tsx:54-68

#### Scenario: 组件使用专属命名空间
- **WHEN** 组件创建时调用 `useTranslation('namespace')`
- **THEN** 系统 SHALL 返回一个翻译函数，该函数自动使用指定的命名空间
- **AND** 翻译函数调用时无需每次指定命名空间参数
> 来源:apps/electron/src/renderer/contexts/I18nContext.tsx:123-135

---

### Requirement: 编译时翻译文件加载
系统 SHALL 在编译时通过 Vite 的 glob import 静态导入所有翻译 JSON 文件，实现零运行时开销。

#### Scenario: 静态导入所有翻译文件
- **WHEN** 应用编译时处理 import.meta.glob 指令
- **THEN** 系统 SHALL 导入 `i18n/locales/**/*.json` 路径下的所有 JSON 文件
- **AND** 系统 SHALL 使用 eager: true 模式立即加载而非懒加载
> 来源:apps/electron/src/renderer/contexts/I18nContext.tsx:19

#### Scenario: 根据语言筛选翻译内容
- **WHEN** 语言切换或初始化时处理已加载的 JSON 模块
- **THEN** 系统 SHALL 仅提取匹配当前语言（language）的翻译文件到内存
- **AND** 系统 SHALL 将这些文件内容组织为以命名空间为 key 的 translations 对象
> 来源:apps/electron/src/renderer/contexts/I18nContext.tsx:50-78

---

### Requirement: 动态文本变量替换
系统 SHALL 支持在翻译文本中使用占位符，并在运行时使用提供的实际值替换。

#### Scenario: 使用双花括号占位符
- **WHEN** 翻译文本包含 `{{variableName}}` 格式的占位符
- **AND** 调用翻译函数时提供了 params 对象
- **THEN** 系统 SHALL 遍历 params 对象，将 `{{variableName}}` 替换为对应的实际值
> 来源:apps/electron/src/renderer/contexts/I18nContext.tsx:90-96

#### Scenario: 翻译未找到时返回原 key
- **WHEN** 调用翻译函数但指定命名空间中不包含该 key
- **THEN** 系统 SHALL 返回原始的 key 字符串作为回退值（静默回退，无错误提示）
> 来源:apps/electron/src/renderer/contexts/I18nContext.tsx:84-88

---

### Requirement: 完整英文文本作为翻译 Key
系统 SHALL 使用完整的英文原文作为翻译 key，提高可读性和开发效率。

#### Scenario: 查找翻译时的 key 格式
- **WHEN** 组件调用翻译函数查找文本
- **THEN** 系统 SHALL 使用原始英文文本（如 'Welcome to Craft Agents'）作为 key
- **AND** 翻译文件 SHALL 使用相同的英文文本作为属性名进行匹配
> 来源:apps/electron/src/renderer/contexts/I18nContext.tsx:80-88, i18n/locales/en/components/onboarding/WelcomeStep.json:3

#### Scenario: 变量占位符 key 格式
- **WHEN** 翻译文本需要包含变量
- **THEN** 系统 SHALL 使用包含 `{{variable}}` 占位符的英文文本作为 key
- **AND** 中文翻译 SHALL 使用 `{variable}` 格式的占位符（单花括号）
> 来源:i18n/locales/en/components/app-shell/ChatDisplay.json:67, i18n/locales/zh-CN/components/app-shell/ChatDisplay.json:67

---

### Requirement: 翻译文件结构
系统 SHALL 使用按语言和组件分层组织的 JSON 文件结构存储翻译内容。

#### Scenario: 语言目录结构
- **WHEN** 翻译文件组织在 i18n/locales/ 目录下
- **THEN** 系统 SHALL 为每种语言创建单独的顶级目录（en、zh-CN）
- **AND** 每个语言目录 SHALL 按组件路径层级创建子目录
- **AND** 每个 .json 文件 SHALL 对应一个组件或页面的命名空间
> 来源:apps/electron/src/renderer/contexts/I18nContext.tsx:54-68

#### Scenario: 翻译文件内容格式
- **WHEN** 翻译文件为 JSON 格式
- **THEN** 系统 SHALL 使用 2 空格缩进
- **AND** 每个 key-value 对 SHALL 使用原始英文文本作为 key
- **AND** 值 SHALL 包含对应语言的翻译文本
> 来源:i18n/locales/en/components/onboarding/WelcomeStep.json:2-9, i18n/locales/zh-CN/components/onboarding/WelcomeStep.json:2-9

---

### Requirement: 翻译文件格式验证
系统 SHALL 提供验证工具检查翻译文件的格式正确性。

#### Scenario: 验证 JSON 格式和缩进
- **WHEN** 运行验证脚本检查 JSON 文件
- **THEN** 系统 SHALL 验证 JSON 语法正确性
- **AND** 系统 SHALL 检查使用 2 空格缩进（非 Tab、非 4 空格）
- **AND** 系统 SHALL 报告格式错误的文件和具体问题描述
> 来源:scripts/validate-i18n.ts:47-69

#### Scenario: 生成验证报告
- **WHEN** 验证脚本完成检查
- **THEN** 系统 SHALL 生成 JSON 格式的报告到 test-results/ 目录
- **AND** 报告 SHALL 包含时间戳、概览统计（总文件数、有效数、无效数）
> 来源:scripts/validate-i18n.ts:197-204

---

### Requirement: 翻译完整性验证
系统 SHALL 提供验证工具检查英文和中文翻译文件的一致性。

#### Scenario: 验证文件完整性
- **WHEN** 验证脚本对比英文和中文翻译文件
- **THEN** 系统 SHALL 检查每个英文文件是否有对应的中文文件
- **AND** 系统 SHALL 检查每个中文文件是否有对应的英文文件
- **AND** 系统 SHALL 将缺失的文件标记为 error
> 来源:scripts/validate-locales.ts:83-103

#### Scenario: 验证 Key 一致性
- **WHEN** 验证脚本对比同一命名空间的英中翻译文件
- **THEN** 系统 SHALL 检查英文文件中的每个 key 是否存在于中文文件中（标记为 error）
- **AND** 系统 SHALL 检查中文文件中的每个 key 是否存在于英文文件中（标记为 warning）
> 来源:scripts/validate-locales.ts:122-150

#### Scenario: 输出验证报告
- **WHEN** 验证脚本完成检查
- **THEN** 系统 SHALL 生成详细报告并输出到控制台
- **AND** 报告 SHALL 包含按文件分组的问题列表（缺失文件、缺失 key）
> 来源:scripts/validate-locales.ts:160-247

---

### Requirement: 硬编码文本检测
系统 SHALL 提供工具检测源代码中未国际化的硬编码用户可见文本。

#### Scenario: 扫描源代码文件
- **WHEN** 运行硬编码文本检测脚本
- **THEN** 系统 SHALL 扫描 apps/electron/src/renderer/ 目录下所有 .tsx 和 .ts 文件
- **AND** 系统 SHALL 忽略 node_modules、dist、build、playground 等目录
> 来源:scripts/check-hardcoded-text.ts:62-81, 219-221

#### Scenario: 检测 JSX 文本内容
- **WHEN** 分析 JSX 代码中的文本节点
- **THEN** 系统 SHALL 检测 > 和 < 标签之间的文本内容
- **AND** 系统 SHALL 过滤已使用 t() 函数的文本（检查 line 是否包含 't('）
- **AND** 系统 SHALL 排除注释行和极短文本（长度 <= 2）
> 来源:scripts/check-hardcoded-text.ts:119-143

#### Scenario: 检测字符串字面量
- **WHEN** 分析字符串字面量（JSX 属性或 JavaScript 变量）
- **THEN** 系统 SHALL 排除 React 组件名、CSS class 名、ID 属性等技术性字符串
- **AND** 系统 SHALL 排除 true、false、null、undefined 等技术常量
- **AND** 系统 SHALL 排除 URL、文件路径等非 UI 文本
- **AND** 系统 SHALL 排除已包含 t() 函数调用的行
> 来源:scripts/check-hardcoded-text.ts:28-48, 122-190

#### Scenario: 生成硬编码报告
- **WHEN** 硬编码检测完成
- **THEN** 系统 SHALL 生成包含所有问题的 JSON 报告到 scripts/hardcoded-text-report.json
- **AND** 报告 SHALL 包含文件路径、行号、列号、文本内容和类型（jsx-text、string-literal、jsx-attribute）
- **AND** 系统 SHALL 在命令行输出汇总和问题最多的文件列表
> 来源:scripts/check-hardcoded-text.ts:256-276

---

### Requirement: I18n 进度统计
系统 SHALL 提供工具统计国际化改造的进度和覆盖率。

#### Scenario: 统计语言文件数量
- **WHEN** 运行进度统计脚本
- **THEN** 系统 SHALL 扫描 i18n/locales/ 目录统计英文和中文 JSON 文件数量
- **AND** 系统 SHALL 显示每种语言的文件总数
> 来源:scripts/i18n-progress-report.ts:72-91, 132-135

#### Scenario: 统计组件改造进度
- **WHEN** 分析组件目录下的 .tsx/.ts 文件
- **THEN** 系统 SHALL 检查每个文件是否使用了 useTranslation hook（导入 I18nContext）
- **AND** 系统 SHALL 计算每个组件目录的改造完成百分比
- **AND** 系统 SHALL 区分已改造、有硬编码问题、跳过（纯逻辑文件）的文件
> 来源:scripts/i18n-progress-report.ts:62-67, 138-171

#### Scenario: 生成总体进度报告
- **WHEN** 进度统计完成
- **THEN** 系统 SHALL 输出总体完成率和需重点关注文件列表
- **AND** 系统 SHALL 显示每个文件的硬编码问题详情
> 来源:scripts/i18n-progress-report.ts:173-191

---

### Requirement: Context 和 Hook 错误处理
系统 SHALL 在组件使用 i18n 功能时进行必要的错误检查和提示。

#### Scenario: useTranslation 必须在 Provider 内使用
- **WHEN** 组件在 I18nProvider 外部调用 useTranslation
- **THEN** 系统 SHALL 抛出错误 'useTranslation must be used within an I18nProvider'
> 来源:apps/electron/src/renderer/contexts/I18nContext.tsx:124-127

#### Scenario: useI18n 必须在 Provider 内使用
- **WHEN** 组件在 I18nProvider 外部调用 useI18n
- **THEN** 系统 SHALL 抛出错误 'useI18n must be used within an I18nProvider'
> 来源:apps/electron/src/renderer/contexts/I18nContext.tsx:138-141

---

### Requirement: 缺失命名空间处理
系统 SHALL 处理翻译函数未提供命名空间参数的情况。

#### Scenario: 未提供命名空间时的回退
- **WHEN** 调用基础 t() 函数时未提供 namespace 参数
- **THEN** 系统 SHALL 直接返回原始 key 字符串
- **AND** 系统 SHALL 不执行任何翻译查找或变量替换
> 来源:apps/electron/src/renderer/contexts/I18nContext.tsx:81, 84-88

---

### Requirement: 翻译加载状态管理
系统 SHALL 提供加载状态指示，确保组件在翻译加载完成前正确响应。

#### Scenario: 初始加载时显示加载状态
- **WHEN** 应用正在读取用户语言偏好
- **THEN** 系统 SHALL 将 isLoading 状态设置为 true
- **AND** 组件可以根据此状态显示加载中提示
> 来源:apps/electron/src/renderer/contexts/I18nContext.tsx:23, 27-47

#### Scenario: 配置读取完成时更新状态
- **WHEN** 用户语言偏好读取完成（成功或失败）
- **THEN** 系统 SHALL 将 isLoading 状态设置为 false
- **AND** 如果读取失败，系统 SHALL 记录错误日志到控制台
> 来源:apps/electron/src/renderer/contexts/I18nContext.tsx:42-44

---

### Requirement: 语言类型定义
系统 SHALL 明确定义支持的语言类型，确保类型安全和编译时检查。

#### Scenario: 语言类型限制
- **WHEN** 语言类型（Language）被定义
- **THEN** 类型 SHALL 仅允许两个有效值：'en' 和 'zh-CN'
- **AND** TypeScript SHALL 在编译时检查类型错误
> 来源:apps/electron/src/renderer/contexts/I18nContext.tsx:4

#### Scenario: setLanguage 函数类型约束
- **WHEN** 调用 setLanguage 函数
- **THEN** 参数 SHALL 被约束为 Language 类型
- **AND** 传递无效语言代码 SHALL 在编译时被类型检查器拒绝
> 来源:apps/electron/src/renderer/contexts/I18nContext.tsx:10, 101-114

---

### Requirement: 翻译参数类型支持
系统 SHALL 支持多种类型的占位符参数以增强灵活性。

#### Scenario: 参数类型支持字符串和数字
- **WHEN** 提供翻译函数的参数（params）
- **THEN** 系统 SHALL 支持字符串类型的值
- **AND** 系统 SHALL 支持数字类型的值（自动转换为字符串）
> 来源:apps/electron/src/renderer/contexts/I18nContext.tsx:11, 94

#### Scenario: 多变量文本翻译
- **WHEN** 翻译文本包含多个占位符（如 '{{name}} {{age}} years old'）
- **THEN** 系统 SHALL 正确替换每个占位符
- **AND** 替换顺序 SHALL 按照 params 对象的键进行
> 来源:apps/electron/src/renderer/contexts/I18nContext.tsx:90-96

---

### Requirement: useTranslation Hook 返回值
系统 SHALL 从 useTranslation hook 返回命名空间绑定的翻译函数和当前语言。

#### Scenario: 返回类型定义
- **WHEN** 组件调用 useTranslation('namespace')
- **THEN** 系统 SHALL 返回一个对象，包含 t 函数和 language 属性
- **AND** 返回的 language 属性 SHALL 反映当前的界面语言设置
> 来源:apps/electron/src/renderer/contexts/I18nContext.tsx:131-134

---

### Requirement: useI18n Hook 完整上下文访问
系统 SHALL 提供访问完整 i18n 上下文的 hook，包括语言切换功能。

#### Scenario: 获取完整 i18n 上下文
- **WHEN** 组件需要访问语言切换功能但不需要特定命名空间
- **THEN** 组件 SHALL 调用 useI18n() hook
- **AND** 系统 SHALL 返回完整的 I18nContext 对象，包括 language、setLanguage、t 和 isLoading
> 来源:apps/electron/src/renderer/contexts/I18nContext.tsx:137-143

#### Scenario: 使用 useI18n 切换语言
- **WHEN** 设置页面或语言选择器使用 useI18n 获取 setLanguage 函数
- **THEN** 组件 SHALL 能够触发语言切换
- **AND** 语言切换 SHALL 持久化到 Electron 配置
> 来源:apps/electron/src/renderer/pages/settings/PreferencesPage.tsx:105

---

## 附录：翻译 Key 示例

### 基础翻译
```typescript
// 翻译文件 (i18n/locales/en/components/onboarding/WelcomeStep.json)
{
  "Welcome to Craft Agents": "Welcome to Craft Agents",
  "Get Started": "Get Started"
}

// 翻译文件 (i18n/locales/zh-CN/components/onboarding/WelcomeStep.json)
{
  "Welcome to Craft Agents": "欢迎来到 Craft Agents",
  "Get Started": "开始使用"
}

// 组件使用
const { t } = useTranslation('components/onboarding/WelcomeStep')
t('Welcome to Craft Agents') // English: "Welcome to Craft Agents", Chinese: "欢迎来到 Craft Agents"
```

### 变量占位符翻译
```typescript
// 翻译文件 (i18n/locales/en/components/app-shell/ChatDisplay.json)
{
  "Scroll up for earlier messages ({count} more)": "Scroll up for earlier messages ({count} more)"
}

// 翻译文件 (i18n/locales/zh-CN/components/app-shell/ChatDisplay.json)
{
  "Scroll up for earlier messages ({count} more)": "向上滚动查看更早的消息(还有{count}条)"
}

// 组件使用
const { t } = useTranslation('components/app-shell/ChatDisplay')
t('Scroll up for earlier messages ({count} more)', { count: 5 })
// English: "Scroll up for earlier messages (5 more)"
// Chinese: "向上滚动查看更早的消息(还有5条)"
```

---

## 术语表

| 术语 | 定义 |
|------|------|
| **Language** | 应用支持的语言代码，当前支持 'en'（英文）和 'zh-CN'（简体中文） |
| **Namespace** | 翻译文件的命名空间，使用组件路径表示，如 'components/app-shell/ChatDisplay' |
| **Translation Key** | 用于查找翻译文本的标识符，本项目使用完整英文原文作为 key |
| **Placeholder** | 翻译文本中的变量占位符，格式为 `{{variableName}}` |
| **useTranslation Hook** | React Hook，用于在组件中访问命名空间翻译函数 |
| **useI18n Hook** | React Hook，用于访问完整 i18n 上下文（包括语言切换函数） |
| **I18nProvider** | React Context 提供者，包裹应用顶层以启用国际化功能 |

---

## 参考资料

### 核心源文件
- `apps/electron/src/renderer/contexts/I18nContext.tsx` - i18n Context 和 Provider 实现
  - 行 4-13: 类型定义 (Language, I18nContextType)
  - 行 19: Vite glob import 配置
  - 行 27-47: 初始化语言偏好加载
  - 行 50-78: 根据语言筛选翻译
  - 行 80-99: 翻译函数 t() 实现
  - 行 101-114: 语言切换函数 handleSetLanguage()
  - 行 123-135: useTranslation hook
  - 行 137-143: useI18n hook

### 翻译文件目录
- `i18n/locales/en/` - 英文翻译文件目录
- `i18n/locales/zh-CN/` - 简体中文翻译文件目录
  - `components/app-shell/ChatDisplay.json` - 聊天显示翻译（67 个 key）
  - `components/onboarding/WelcomeStep.json` - 欢迎页面翻译
  - `pages/settings/AppearanceSettingsPage.json` - 外观设置翻译

### 验证工具
- `scripts/validate-locales.ts` - 翻译文件完整性验证
  - 行 69-155: 验证逻辑
  - 行 160-247: 报告生成
- `scripts/validate-i18n.ts` - i18n 总体验证（格式和完整性）
  - 行 47-69: JSON 格式验证
  - 行 100-173: 翻译完整性检查
- `scripts/check-hardcoded-text.ts` - 硬编码文本检测
  - 行 28-48: 排除模式定义
  - 行 109-197: 文件分析逻辑
  - 行 199-276: 报告生成
- `scripts/i18n-progress-report.ts` - i18n 改造进度统计
  - 行 62-67: i18n 使用检测
  - 行 127-193: 主函数和报告输出

### 使用示例
- `apps/electron/src/renderer/components/onboarding/WelcomeStep.tsx` - 在组件中使用 i18n 的示例
  - 行 3: 导入 useTranslation
  - 行 25: 创建命名空间 hook
  - 行 34-42: 使用 t() 函数翻译文本
- `apps/electron/src/renderer/components/app-shell/ChatDisplay.tsx` - 复杂组件 i18n 使用示例
  - 行 16: 使用 useTranslation hook
- `apps/electron/src/renderer/pages/settings/AppearanceSettingsPage.tsx` - 多命名空间使用示例
  - 行 28: 导入 useTranslation
  - 行 51-52: 使用多个命名空间
