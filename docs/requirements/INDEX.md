# Craft Agents 需求文档索引

## 概述

本目录包含 Craft Agents 应用程序各模块的需求规格文档（EARS 格式）。每个文档都使用标准化模板编写，包含详细的用户场景和技术规范。

---

## 文档列表

| 文档 | 模块 | 描述 | 状态 |
|------|------|------|------|
| [session-management.md](./session-management.md) | 会话管理 | 会话列表、搜索、筛选、状态管理、标签管理、重命名、分享、元数据、文件浏览、删除 | ✓ 完成 |
| [workspace-management.md](./workspace-management.md) | 工作区管理 | 工作区选择器、创建流程、打开文件夹、标识设置、权限模式、模式循环、高级设置 | ✓ 完成 |
| [api-setup.md](./api-setup.md) | API配置与连接 | 提供商选择、认证方式、端点配置、连接验证、表单提交 | ✓ 完成 |
| [ai-chat.md](./ai-chat.md) | AI交互与聊天 | 消息显示、流式预览、工具执行可视化、结构化输入、富文本输入、搜索导航 | ✓ 完成 |
| [onboarding.md](./onboarding.md) | Onboarding引导流程 | 欢迎页面、Git Bash检测、API选择、凭据输入、OAuth认证、配 置完成、会话过期 | ✓ 完成 |
| [settings.md](./settings.md) | 设置页面 | AI设置、外观设置、偏好设置、权限设置、标签设置、工作区设置、快捷键、应用设置 | ✓ 完成 |
| [shortcuts.md](./shortcuts.md) | 快捷键与操作 | 定义全局快捷键、操作注册、跨平台映射、输入安全模式 | ✓ 完成 |
| [i18n.md](./i18n.md) | 国际化 | 定义多语言支持、翻译函数、命名空间、语言切换 | ✓ 完成 |

---

## 模块分类

### 核心交互模块

#### 会话管理 (session-management.md)
- **功能点**: 会话列表显示、搜索过滤、状态管理、标签管理、重命名、分享、元数据展示、文件浏览、会话删除、会话选择
- **需求规格**: 10个核心需求，54个场景
- **范围**: SM-001 到 SM-010

#### 工作区管理 (workspace-management.md)
- **功能点**: 工作区选择器、创建新工作区、打开文件夹、工作区标识设置、权限模式、模式循环切换、高级配置、工作区设置页面、图标缓存
- **需求规格**: 10个核心需求，30个场景
- **范围**: WM-001 到 WM-010

#### 快捷键与操作 (shortcuts.md)
- **功能点**: 快捷键注册、跨平台处理、全局事件捕获、输入安全模式、操作启用条件、用户快捷键覆盖
- **关键组件**: ActionRegistry、KeyboardListener、KeyboardShortcutsDialog、ShortcutsPage
- **操作分类**: General（通用）、Navigation（导航）、View（视图）、Session List（会话列表）、Chat（聊天）

### AI 集成模块

#### API配置与连接 (api-setup.md)
- **功能点**: 提供商选择（Anthropic/OpenAI）、认证方式（API Key/OAuth）、端点配置（预设/自定义）、连接验证、错误处理
- **关键组件**: ApiKeyInput、OAuthConnect、APISetupStep、CredentialsStep

#### AI交互与聊天 (ai-chat.md)
- **功能点**: 消息显示、轮次分组、流式响应预览、工具执行可视化、结构化输入处理、富文本输入、搜索高亮导航、模型管理、连接管理
- **关键组件**: ChatDisplay、TurnCard、InputContainer、FreeFormInput、StructuredInput

### 用户引导模块

#### Onboarding 引导流程 (onboarding.md)
- **功能点**: 欢迎页面、Git Bash依赖检测、API连接方式选择、API Key凭据输入、Claude OAuth认证、ChatGPT OAuth认证、配置完成页面、会话过期重新认证
- **关键组件**: WelcomeStep、GitBashWarning、APISetupStep、CredentialsStep、CompletionStep、ReauthScreen

### 配置管理模块

#### 设置页面 (settings.md)
- **AI设置**: 连接管理、模型配置、推理深度、工作区覆盖
- **外观设置**: 主题模式、颜色主题、字体、工具图标映射
- **偏好设置**: 个人信息、时区、语言、位置、备注
- **工作区设置**: 名称、图标、权限模式、高级配置
- **权限设置**: 默认权限配置、工作区自定义权限
- **标签设置**: 标签层级、自动应用规则
- **快捷键**: 注册表快捷键显示、组件特定快捷键
- **应用设置**: 通知、电源、关于、自动更新

### 本地化模块

#### 国际化 (i18n.md)
- **功能点**: 语言支持、翻译文件加载、翻译函数、命名空间隔离、语言切换、语言偏好加载
- **支持语言**: 英语（en）、简体中文（zh-CN）
- **核心 API**: `t(key, namespace, params)`、`useTranslation(namespace)`、`useI18n()`
- **翻译格式**: JSON，使用原始英文文本作为 key

---

## EARS 格式规范

需求文档遵循 [Easy Approach to Requirements Syntax (EARS)](https://www.modernanalyst.com/Careers/InterviewQuestions/tabid/128/ID/6212/What-is-EARS.aspx) 格式：

### 需求模板

```
### Requirement: [功能名]

**Requirement: [功能名]**

[系统 SHALL 描述]

**子系统 SHALL:**
[子系统责任列表]

**系统 SHALL:**
[系统责任列表]

**系统 SHALL NOT:**
[约束条件列表]

**Scenario: [场景名]**
- WHEN [前提条件]
- THEN [预期结果]
- AND [附加结果]
```

---

## 文档使用指南

### 对于开发人员
1. 开始实现前阅读对应模块的需求文档
2. 确保实现符合所有 `SHALL` 要求
3. 实现所有场景描述的功能
4. 遵守 `SHALL NOT` 约束条件

### 对于测试人员
1. 根据场景编写测试用例
2. 确保覆盖所有正常流、异常流和边界情况
3. 验证约束条件

### 对于项目经理
1. 使用场景作为验收标准
2. 根据需求模块拆分开发任务
3. 跟踪需求覆盖进度

---

## 更新日志

| 日期 | 版本 | 描述 | 作者 |
|------|------|------|------|
| 2026-03-03 | 1.0 | 初版索引，全部8个模块需求文档完成 | 需求提取团队 |

---

## 版本信息

- **总模块数**: 8个
- **已完成模块**: 8/8 (100%)
- **需求规格数量**: 80+ 个
- **场景描述数量**: 200+ 个
- **文档创建日期**: 2026-03-03

---

## 备注

- 所有需求从用户/业务角度编写，而非实现角度
- 使用"系统 SHALL"的标准 EARS 语法
- 场景描述包含正常流、异常流、边界情况
- 文档中的代码引用使用 `file_path:line_number` 格式
- 所有文档均由 AI Agent Team 自动逆向生成，基于代码分析
