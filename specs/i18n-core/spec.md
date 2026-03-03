# i18n Core Specification

## ADDED Requirements

### 2.1 Requirement: 语言支持

**Requirement: 语言支持**

系统 SHALL 支持多种语言，并提供可扩展的语言添加机制。

**系统 SHALL:**
- 支持英语（`en`）作为默认语言
- 支持简体中文（`zh-CN`）
- 使用 `Language` 类型定义支持的语言列表
- 支持向后兼容的旧版简体中文代码（"简体中文"）

**系统 SHALL NOT:**
- 允许在类型定义之外的语言代码

#### Scenario: 支持的语言
- **WHEN** 系统初始化
- **THEN** 系统支持 `en` 和 `zh-CN` 语言
- **AND** 系统能够识别并转换旧版简体中文代码到 `zh-CN`

#### Scenario: 语言类型安全
- **WHEN** 开发者设置语言
- **THEN** 系统验证语言代码是否为有效的 `Language` 类型
- **AND** 拒绝无效的语言代码

> 来源: `apps/electron/src/renderer/contexts/I18nContext.tsx`

---

### 2.2 Requirement: 翻译文件加载

**Requirement: 翻译文件加载**

系统 SHALL 使用 Vite 的 `import.meta.glob` 功能动态加载语言文件。

**子系统 SHALL:**
- 使用 `eager: true` 参数预加载所有 JSON 语言文件
- 从文件路径中提取语言代码和命名空间信息
- 根据当前激活语言筛选翻译内容

**系统 SHALL:**
- 存储所有语言文件的翻译内容
- 当前语言改变时自动更新内存中的翻译映射
- 支持命名空间到翻译对象的映射

#### Scenario: 加载语言文件
- **WHEN** 系统初始化时调用 `import.meta.glob('../../../../../i18n/locales/**/*.json', { eager: true })`
- **THEN** 系统加载所有语言的翻译文件
- **AND** 存储在内存中供快速访问

#### Scenario: 语言切换加载
- **WHEN** 用户切换语言从 `en` 到 `zh-CN`
- **THEN** 系统重新扫描所有语言文件
- **AND** 仅加载 `zh-CN` 语言目录下的翻译
- **AND** 更新内存中的翻译映射

> 来源: `apps/electron/src/renderer/contexts/I18nContext.tsx`

---

### 2.3 Requirement: 翻译函数

**Requirement: 翻译函数**

系统 SHALL 提供翻译函数，允许组件获取本地化文本。

**子系统 SHALL:**
- 提供 `t(key: string, namespace?: string, params?: Record<string, string | number>): string` 函数
- 使用命名空间查找翻译对象
- 使用键查找对应的翻译文本

**系统 SHALL:**
- 当命名空间为空时返回原始键
- 当键不存在时返回原始键
- 支持变量占位符替换（`{{variable}}` 格式）
- 将参数值转换为字符串进行替换

#### Scenario: 基础翻译
- **WHEN** 组件调用 `t('New Chat', 'namespace')`
- **AND** 命名空间 `namespace` 的翻译文件包含 `"New Chat": "新建聊天"`
- **THEN** 系统返回 `"新建聊天"`

#### Scenario: 翻译缺失
- **WHEN** 组件调用 `t('Unknown Text', 'namespace')`
- **AND** 命名空间 `namespace` 的翻译文件不包含该键
- **THEN** 系统返回 `"Unknown Text"`（原始键）

#### Scenario: 带变量的翻译
- **WHEN** 组件调用 `t('User {name} logged in', 'namespace', { name: 'Alice' })`
- **AND** 翻译文件包含 `"User {name} logged in": "用户 {name} 已登录"`
- **THEN** 系统返回 `"用户 Alice 已登录"`

> 来源: `apps/electron/src/renderer/contexts/I18nContext.tsx`

---

### 2.4 Requirement: 命名空间隔离

**Requirement: 命名空间隔离**

系统 SHALL 支持命名空间以组织和隔离翻译内容。

**子系统 SHALL:**
- 使用命名空间字符串标识翻译文件
- 命名空间格式为 `语言目录相对路径.json`
- 例如：`components/app-shell/AppShell` 对应 `i18n/locales/{lang}/components/app-shell/AppShell.json`

**系统 SHALL:**
- 提供命名空间到翻译对象的映射
- 支持在调用翻译函数时指定命名空间
- 为不同组件或功能模块提供独立的翻译命名空间

#### Scenario: 命名空间使用
- **WHEN** 组件调用 `useTranslation('components/app-shell/AppShell')`
- **THEN** 系统返回针对该命名空间的翻译函数
- **AND** 该命名空间的翻译不会与其他命名空间冲突

#### Scenario: 命名空间路径解析
- **WHEN** 语言文件路径为 `i18n/locales/en/components/app-shell/AppShell.json`
- **THEN** 系统提取语言代码 `en`
- **AND** 提取命名空间 `components/app-shell/AppShell`
- **AND** 只有当前语言为 `en` 时才加载该翻译

> 来源: `apps/electron/src/renderer/contexts/I18nContext.tsx`

---

### 2.5 Requirement: 语言切换

**Requirement: 语言切换**

系统 SHALL 提供语言切换功能，并持久化用户的语言偏好。

**子系统 SHALL:**
- 提供 `setLanguage(lang: Language)` 函数
- 更新当前语言状态
- 触发翻译内容的重新加载
- 将语言偏好保存到用户偏好设置

**系统 SHALL:**
- 使用 Electron IPC API 写入语言偏好
- 处理写入失败的情况（记录错误）
- 支持在应用重启后恢复用户选择的语言

#### Scenario: 切换语言
- **WHEN** 用户调用 `setLanguage('zh-CN')`
- **THEN** 系统将当前语言更新为 `zh-CN`
- **AND** 重新加载对应的翻译文件
- **AND** 将语言偏好写入用户设置

#### Scenario: 持久化语言偏好
- **WHEN** 用户将语言切换为 `zh-CN`
- **AND** 重启应用
- **THEN** 系统读取用户偏好设置
- **AND** 自动恢复到 `zh-CN` 语言

> 来源: `apps/electron/src/renderer/contexts/I18nContext.tsx`

---

### 2.6 Requirement: 语言偏好加载

**Requirement: 语言偏好加载**

系统 SHALL 在初始化时从用户偏好设置加载语言。

**子系统 SHALL:**
- 在 `useEffect` 中异步加载语言偏好
- 读取 `language` 属性
- 支持旧版简体中文代码转换

**系统 SHALL:**
- 处理读取偏好失败的情况（记录错误）
- 当偏好读取失败时使用默认语言
- 更新加载状态以通知组件完成

#### Scenario: 加载语言偏好
- **WHEN** 应用启动时
- **AND** 用户偏好设置中 `language` 为 `zh-CN`
- **THEN** 系统将语言设置为 `zh-CN`
- **AND** 设置 `isLoading` 为 `false`

#### Scenario: 处理旧版语言代码
- **WHEN** 用户偏好设置中 `language` 为旧版简体中文代码（"简体中文"）
- **THEN** 系统识别该代码为简体中文
- **AND** 将语言设置为 `zh-CN`

#### Scenario: 偏好读取失败
- **WHEN** 读取用户偏好设置失败
- **THEN** 系统记录错误
- **AND** 使用默认语言 `en`
- **AND** 设置 `isLoading` 为 `false`

> 来源: `apps/electron/src/renderer/contexts/I18nContext.tsx`

---

### 2.7 Requirement: React Hook 集成

**Requirement: React Hook 集成**

系统 SHALL 提供 React Hook 以简化组件中的国际化功能使用。

**子系统 SHALL:**
- 提供 `useTranslation(namespace: string)` hook
- 返回翻译函数 `t()` 和当前语言
- 确保在 `I18nProvider` 内部使用时才能正常工作

**系统 SHALL:**
- 提供 `useI18n()` hook
- 返回完整的 i18n 上下文
- 包括语言、设置函数和翻译函数

#### Scenario: 使用 useTranslation
- **WHEN** 组件调用 `useTranslation('components/app-shell/AppShell')`
- **THEN** 系统返回 `{ t, language }` 对象
- **AND** `t(key, params)` 函数用于翻译文本
- **AND** `language` 表示当前语言

#### Scenario: Provider 外部使用错误
- **WHEN** 组件在 `I18nProvider` 外部使用 `useTranslation()`
- **THEN** 系统抛出错误信息

> 来源: `apps/electron/src/renderer/contexts/I18nContext.tsx`

---

### 2.8 Requirement: 默认语言设置

**Requirement: 默认语言设置**

系统 SHALL 支持在用户没有指定语言偏好时使用默认语言。

**系统 SHALL:**
- 使用 `en` 作为默认语言
- 如果偏好读取成功但语言无效，使用默认语言
- 如果偏好读取失败，使用默认语言

#### Scenario: 首次运行
- **WHEN** 用户首次运行应用
- **AND** 没有用户偏好设置
- **THEN** 系统使用默认语言 `en`

> 来源: `apps/electron/src/renderer/contexts/I18nContext.tsx`

---

### 3.1 Requirement: 语言切换器

**Requirement: 语言切换器**

系统 SHALL 在设置页面提供语言切换选项，允许用户更改应用语言。

**子系统 SHALL:**
- 在设置页面显示可用的语言选项
- 提供下拉菜单或单选按钮选择语言
- 实时应用语言更改

**系统 SHALL:**
- 使用 i18n 系统翻译语言选项标签
- 持久化用户选择的语言偏好

#### Scenario: 通过更改语言
- **WHEN** 用户导航到设置页面的"语言"选项
- **AND** 选择"中文（简体）"
- **THEN** 系统立即将界面语言切换为简体中文
- **AND** 将语言偏好保存到用户设置

> 来源: `i18n/locales/`, `apps/electron/src/renderer/contexts/I18nContext.tsx`

---

### 3.2 Requirement: 翻译完整性检查

**Requirement: 翻译完整性检查**

系统 SHALL 提供工具验证翻译文件的完整性（可选功能）。

**子系统 SHALL:**
- 验证 `en` 和 `zh-CN` 语言文件的结构一致性
- 检查缺失的翻译键
- 生成翻译完整性报告

**系统 SHALL:**
- 提供验证脚本供开发者使用
- 支持命令行执行

#### Scenario: 验证翻译文件
- **WHEN** 开发者运行翻译验证脚本
- **THEN** 系统扫描所有语言文件
- **AND** 报告缺失或不匹配的翻译键
- **AND** 生成完整的翻译覆盖报告

> 来源: `scripts/validate-locales.ts`, `i18n/locales/`

---

### 4.1 Requirement: 翻译文件格式

**Requirement: 翻译文件格式**

系统 SHALL 使用 JSON 格式存储翻译内容。

**子系统 SHALL:**
- 每个翻译文件为一个 JSON 对象
- 键为原始英文文本
- 值为翻译后的文本（英文文件值为原始文本）

**系统 SHALL:**
- 支持嵌套对象结构（可选）
- 支持变量占位符格式 `{{variable}}`

#### Scenario: 英文翻译文件
```json
{
  "New Chat": "New Chat",
  "Create a new chat session": "Create a new chat session",
  "User {name} logged in": "User {name} logged in"
}
```

#### Scenario: 简体中文翻译文件
```json
{
  "New Chat": "新建聊天",
  "Create a new chat session": "创建新的聊天会话",
  "User {name} logged in": "用户 {name} 已登录"
}
```

> 来源: `i18n/locales/en/*.json`, `i18n/locales/zh-CN/*.json`

---

### 4.2 Requirement: 命名空间组织

**Requirement: 命名空间组织**

系统 SHALL 按组件和功能组织翻译文件。

**系统 SHALL:**
- 在 `i18n/locales/{lang}/` 目录下创建子目录
- 按组件路径组织翻译文件
- 为不同功能模块创建独立命名空间

#### Scenario: 翻译文件目录结构
```
i18n/locales/
├── en/
│   ├── components/
│   │   ├── app-shell/
│   │   │   ├── AppShell.json
│   │   │   ├── ChatDisplay.json
│   │   │   └── SessionList.json
│   │   ├── onboarding/
│   │   │   ├── WelcomeStep.json
│   │   │   └── CompletionStep.json
│   │   └── settings/
│   │       ├── SettingsPage.json
│   │       └── AppearanceSettingsPage.json
│   ├── pages/
│   │   ├── ShortcutsPage.json
│   │   └── settings/
│   │       ├── PermissionsSettingsPage.json
│   │       └── AppSettingsPage.json
│   └── actions/
│       └── definitions.json
└── zh-CN/
    └── (镜像 en 的结构)
```

> 来源: `i18n/locales/`

---

### 4.3 Requirement: 翻译 Key 命名规范

**Requirement: 翻译 Key 命名规范**

系统 SHALL 使用完整的原始英文文本作为翻译 key。

**系统 SHALL:**
- 使用原始英文文本作为 key
- Key 可读性高于简洁性
- 支持空格和大小写

**系统 SHALL NOT:**
- 使用缩写或过度抽象的 key
- 使用下划线或驼峰命名（除非原文如此）

#### Scenario: 正确的 Key 命名
```typescript
// 正确示例
t('Default model is required for compatible endpoints.')
t('Enter your API key...')
t('Welcome to Craft Agents')
```

#### Scenario: 错误的 Key 命名
```typescript
// 错误示例
t('error_model_required')
t('auth.enter_key')
t('workspace.duplicate')
```

> 来源: `i18n/locales/en/*.json`, `apps/electron/src/renderer/contexts/I18nContext.tsx`

---

### 5.1 Requirement: TypeScript 类型定义

**Requirement: TypeScript 类型定义**

系统 SHALL 使用 TypeScript 提供完整的类型安全。

**系统 SHALL:**
- 定义 `Language` 类型为 `'en' | 'zh-CN'`
- 定义 `I18nContextType` 接口包含所有上下文属性
- 确保语言代码类型安全

#### Scenario: 类型定义使用
- **WHEN** 开发者定义语言类型 `Language = 'en' | 'zh-CN'`
- **THEN** 所有使用语言代码的地方获得类型安全检查

> 来源: `apps/electron/src/renderer/contexts/I18nContext.tsx`

---

### 5.2 Requirement: React Context

**Requirement: React Context**

系统 SHALL 使用 React Context 管理 i18n 状态。

**系统 SHALL:**
- 创建 `I18nContext` 作为上下文
- 提供 `I18nProvider` 组件包装应用
- 使用 `useContext` hook 访问上下文

#### Scenario: Context 创建
- **WHEN** 系统创建 `I18nContext`
- **THEN** 上下文包含 `language`, `setLanguage`, `t`, `isLoading` 属性

> 来源: `apps/electron/src/renderer/contexts/I18nContext.tsx`

---

### 5.3 Requirement: Vite import.meta.glob

**Requirement: Vite import.meta.glob**

系统 SHALL 使用 Vite 的 `import.meta.glob` 功能动态加载语言文件。

**系统 SHALL:**
- 使用 `eager: true` 参数预加载所有文件
- 匹配模式 `**/*.json` 包含所有 JSON 文件
- 支持静态分析和类型推断

#### Scenario: 动态导入翻译文件
- **WHEN** 系统调用 `import.meta.glob('../../../../../i18n/locales/**/*.json', { eager: true })`
- **THEN** 所有翻译文件被自动识别并加载

> 来源: `apps/electron/src/renderer/contexts/I18nContext.tsx`

---

### 6.1 Requirement: 性能

**Requirement: 性能**

系统 SHALL 确保翻译操作的高性能。

**系统 SHALL:**
- 使用预加载翻译文件而非运行时请求
- 缓存翻译内容在内存中
- 优化翻译查找性能

#### Scenario: 翻译函数性能
- **WHEN** 组件频繁调用翻译函数
- **THEN** 翻译查找操作应在 1ms 内完成

> 来源: `apps/electron/src/renderer/contexts/I18nContext.tsx`

---

### 6.2 Requirement: 可扩展性

**Requirement: 可扩展性**

系统 SHALL 支持轻松添加新语言。

**系统 SHALL:**
- 在 `i18n/locales/` 目录下创建新语言目录
- 添加新的语言代码到 `Language` 类型
- 复制或创建对应的翻译文件

#### Scenario: 添加新语言
- **WHEN** 开发者需要添加日语支持
- **THEN** 创建 `i18n/locales/ja/` 目录
- **AND** 添加所有命名空间的翻译文件
- **AND** 更新 `Language` 类型为 `'en' | 'zh-CN' | 'ja'`

> 来源: `i18n/locales/`, `apps/electron/src/renderer/contexts/I18nContext.tsx`

---

### 6.3 Requirement: 向后兼容

**Requirement: 向后兼容**

系统 SHALL 支持旧版语言代码的向后兼容。

**系统 SHALL:**
- 识别旧版简体中文代码（"简体中文"）
- 自动转换为新的 `zh-CN` 代码
- 不影响现有用户数据

#### Scenario: 旧版用户数据兼容
- **WHEN** 用户偏好设置中包含旧版简体中文代码
- **THEN** 系统将其识别为简体中文
- **AND** 新用户偏好使用标准 `zh-CN` 代码

> 来源: `apps/electron/src/renderer/contexts/I18nContext.tsx`

---

### 7.1 Requirement: 占位符格式

**Requirement: 占位符格式**

系统 SHALL 使用特定的变量占位符格式。

**系统 SHALL:**
- 使用 `{{variable}}` 格式作为变量占位符
- 不支持其他占位符格式

#### Scenario: 变量替换
- **WHEN** 翻译文本包含 `{{name}}` 占位符
- **AND** 传递 `name: 'Alice'` 参数
- **THEN** `{{name}}` 被替换为 `Alice`

> 来源: `apps/electron/src/renderer/contexts/I18nContext.tsx`

---

### 7.2 Requirement: Provider 依赖

**Requirement: Provider 依赖**

系统 SHALL 要求所有使用 i18n 功能的组件在 `I18nProvider` 内部。

**系统 SHALL:**
- 在外部使用时抛出明确的错误信息
- 在应用根级别包装 `I18nProvider`

#### Scenario: Provider 外部使用
- **WHEN** 组件在 `I18nProvider` 外部调用 `useTranslation()`
- **THEN** 系统抛出错误 'useTranslation must be used within an I18nProvider'

> 来源: `apps/electron/src/renderer/contexts/I18nContext.tsx`

---

### 7.3 Requirement: 命名空间唯一性

**Requirement: 命名空间唯一性**

系统 SHALL 确保命名空间路径的唯一性。

**系统 SHALL:**
- 每个命名空间对应唯一的翻译文件
- 不允许命名空间冲突

#### Scenario: 命名空间冲突检测
- **WHEN** 两个文件尝试使用相同命名空间
- **THEN** 系统确保每个命名空间只加载一次

> 来源: `apps/electron/src/renderer/contexts/I18nContext.tsx`

---

### 8.1 Requirement: 翻译功能测试

**Requirement: 翻译功能测试**

系统 SHALL 通过自动化测试验证翻译功能。

**测试 SHALL 包括:**
- 语言切换功能
- 翻译函数正确性
- 变量插值功能
- 翻译缺失处理

#### Scenario: 测试语言切换
- **WHEN** 测试调用 `setLanguage('zh-CN')`
- **THEN** 验证所有翻译文本变为简体中文

#### Scenario: 测试变量插值
- **WHEN** 测试调用 `t('User {name} logged in', { name: 'Alice' })`
- **THEN** 验证返回值包含 'Alice'

> 来源: 测试框架需求（待实现）

---

### 8.2 Requirement: 翻译完整性测试

**Requirement: 翻译完整性测试**

系统 SHALL 提供脚本验证翻译文件的完整性。

**测试 SHALL 包括:**
- 检查英文和简体中文文件的键一致性
- 检查缺失的翻译
- 生成覆盖报告

#### Scenario: 运行验证脚本
- **WHEN** 开发者运行 `scripts/validate-locales.ts`
- **THEN** 脚本验证所有语言文件结构一致

> 来源: `scripts/validate-locales.ts`

---

### 8.3 Requirement: 硬编码文本检测

**Requirement: 硬编码文本检测**

系统 SHALL 提供脚本检测源代码中的硬编码文本。

**测试 SHALL 包括:**
- 扫描 `.tsx` 和 `.ts` 文件
- 排除已使用 `t()` 函数的文本
- 识别需要国际化的硬编码文本
- 生成问题报告

#### Scenario: 运行硬编码文本检测
- **WHEN** 开发者运行 `scripts/check-hardcoded-text.ts`
- **THEN** 脚本扫描项目中的硬编码文本
- **AND** 生成需要国际化的文本报告

> 来源: `scripts/check-hardcoded-text.ts`

---

### 9.1 Requirement: 翻译缺失处理

**Requirement: 翻译缺失处理**

系统 SHALL 优雅处理翻译缺失的情况。

**系统 SHALL:**
- 当翻译键不存在时返回原始键
- 不抛出错误或中断渲染
- 记录 warnings 到控制台（可选）

#### Scenario: 翻译缺失
- **WHEN** 调用 `t('Missing Key', 'namespace')`
- **AND** 翻译文件中不存在该键
- **THEN** 系统返回 `'Missing Key'`
- **AND** 组件正常渲染

> 来源: `apps/electron/src/renderer/contexts/I18nContext.tsx`

---

### 9.2 Requirement: IPC 错误处理

**Requirement: IPC 错误处理**

系统 SHALL 处理 Electron IPC API 错误。

**系统 SHALL:**
- 捕获并记录 IPC 调用错误
- 不中断应用程序运行
- 提供降级处理（使用默认值）

#### Scenario: 偏好写入失败
- **WHEN** 调用 `writePreferences()` 失败
- **THEN** 系统记录错误到控制台
- **AND** 不影响语言切换的界面更新

> 来源: `apps/electron/src/renderer/contexts/I18nContext.tsx`

---

### 10.1 Requirement: RTL 语言支持

**Requirement: RTL 语言支持**

系统 SHALL 为未来支持 RTL（从右到左）语言做好准备架构（阿拉伯语、希伯来语等）。

**子系统 SHALL:**
- 在语言类型中预留 RTL 语言代码
- 考虑 RTL 布局适配
- 提供文本方向切换机制

#### Scenario: RTL 语言预留
- **WHEN** 架构设计预留 RTL 支持
- **THEN** 系统可以轻松添加阿拉伯语等 RTL 语言

> 来源: 架构设计需求（未来扩展）

---

### 10.2 Requirement: 动态加载翻译

**Requirement: 动态加载翻译**

系统 SHALL 支持按需动态加载翻译文件以优化初始加载时间（待实现）。

**子系统 SHALL:**
- 使用代码分割按语言拆分翻译包
- 懒加载非默认语言的翻译
- 提供翻译加载进度指示

#### Scenario: 动态加载优化
- **WHEN** 用户首次应用
- **THEN** 只加载默认语言 `en`
- **AND** 当切换语言时懒加载对应翻译

> 来源: 性能优化需求（未来扩展）

---

### 10.3 Requirement: 翻译更新

**Requirement: 翻译更新**

系统 SHALL 支持从远程服务器更新翻译文件（待实现）。

**子系统 SHALL:**
- 提供翻译更新检查机制
- 支持增量翻译下载
- 提供翻译版本管理

#### Scenario: 远程翻译更新
- **WHEN** 系统检测到新的翻译版本
- **THEN** 从服务器下载更新
- **AND** 应用新的翻译内容

> 来源: 功能需求（未来扩展）

---

## MODIFIED Requirements

（空 - 这是初始规格文档）

---

## REMOVED Requirements

（空 - 这是初始规格文档）
