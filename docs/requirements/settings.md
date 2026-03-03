# Settings 设置页面需求规格说明书

## 文档信息

| 项目 | 内容 |
|------|------|
| 文档标题 | Settings 设置页面需求规格说明书 |
| 文档版本 | 1.0.0 |
| 创建日期 | 2026-03-03 |
| 模块标识 | settings |
| 负责人 | 需求提取团队 |

## 1. 执行摘要

Settings 设置页面是 Craft Agents 应用的配置管理中心，提供应用级别和工作区级别的各种设置选项。用户可以在此配置 AI 连接、外观主题、个人偏好、权限控制、快捷键、标签管理等核心功能。

### 1.1 核心功能

- **AI 设置**：API 连接管理、模型配置、推理深度、工作区覆盖
- **外观设置**：主题模式、颜色主题、字体、工作区主题覆盖、工具图标映射
- **偏好设置**：个人信息、时区、语言、位置、备注
- **工作区设置**：工作区名称、图标、权限模式、高级配置
- **应用设置**：通知、电源、关于、自动更新
- **权限设置**：默认权限配置、工作区自定义权限
- **标签设置**：标签层级、自动应用规则
- **快捷键**：键盘快捷键参考、组件特定快捷键

### 1.2 页面导航结构

```
设置根目录
├── AI (ai)
├── 外观 (appearance)
├── 偏好 (preferences)
├── 权限 (permissions)
├── 标签 (labels)
├── 工作区 (workspace)
├── 快捷键 (shortcuts)
└── 应用 (app)
```

---

## 2. 架构概览

### 2.1 设置页面层次结构

```
Settings (设置)
│
├── 应用级别设置
│   ├── 通知控制
│   ├── 屏幕唤醒保持
│   ├── 版本信息
│   └── 自动更新
│
├── 外观级别设置
│   ├── 默认主题
│   │   ├── 模式（系统/浅色/深色）
│   │   ├── 颜色主题
│   │   └── 字体
│   ├── 工作区主题覆盖
│   └── 工具图标映射
│
├── AI 设置
│   ├── 默认设置
│   │   ├── 连接
│   │   ├── 模型
│   │   └── 推理深度
│   ├── 工作区覆盖
│   └── 连接管理
│       ├── 添加连接
│       ├── 编辑连接
│       ├── 设置默认
│       ├── 验证连接
│       └── 重新认证
│
├── 个人偏好
│   ├── 基本信息
│   ├── 位置信息
│   └── 备注
│
├── 工作区设置
│   ├── 工作区信息
│   │   ├── 名称
│   │   └── 图标
│   ├── 权限
│   │   ├── 默认模式
│   │   └── 模式切换
│   └── 高级
│       ├── 工作目录
│       └── 本地 MCP 服务器
│
├── 权限设置
│   ├── 关于权限
│   ├── 默认权限
│   └── 工作区自定义
│
├── 标签设置
│   ├── 关于标签
│   ├── 标签层级
│   └── 自动应用规则
│
└── 快捷键
    ├── 注册表驱动快捷键
    └── 组件特定快捷键
```

### 2.2 UI 组件层次结构

```
SettingsPage
├── PanelHeader
├── ScrollArea
│   ├── SettingsSection
│   │   ├── SettingsSectionHeader (title, description, action)
│   │   └── SettingsCard
│   │       ├── SettingsRow
│   │       │   ├── Label
│   │       │   ├── Description
│   │       │   └── Action/Control
│   │       ├── SettingsToggle
│   │       ├── SettingsInput
│   │       ├── SettingsTextarea
│   │       ├── SettingsMenuSelect
│   │       ├── SettingsMenuSelectRow
│   │       └── SettingsSegmentedControl
```

---

## 3. 详细需求规格

---

## 3.1 AI 设置页面

#### Requirement: AI 默认设置显示

**系统 SHALL** 显示 AI 默认设置配置。
- 系统 SHALL 显示默认连接选择器
- 系统 SHALL 显示默认模型选择器
- 系统 SHALL 显示推理深度选择器
- 系统 SHALL 在没有配置连接时显示空状态提示
- 系统 SHALL 保持设置与连接状态的同步

**Scenario: 显示默认 AI 设置**
- WHEN 用户进入 AI 设置页面
- THEN 系统显示"默认"设置区块
- THEN 系统显示"新聊天的设置"描述
- THEN 系统显示当前配置的连接、模型和推理深度选项

**Scenario: 无连接时空状态**
- WHEN 用户尚未配置任何 AI 连接
- THEN 系统不显示默认设置区块
- THEN 系统在连接管理区块显示提示消息

**Scenario: 更改默认连接**
- WHEN 用户从连接下拉菜单选择新的默认连接
- THEN 系统更新默认连接配置
- THEN 系统刷新连接列表

**Scenario: 更改默认模型**
- WHEN 用户从模型下拉菜单选择新的默认模型
- THEN 系统更新所选连接的默认模型配置
- THEN 系统保存配置并刷新

**Scenario: 更改推理深度**
- WHEN 用户从推理深度下拉菜单选择新的深度设置
- THEN 系统更新默认推理深度配置
- THEN 系统保存配置

---

#### Requirement: AI 连接管理列表

**系统 SHALL** 显示所有已配置的 AI 连接列表。
- 系统 SHALL 按连接名称排序显示（默认连接优先）
- 系统 SHALL 为每个连接显示名称、提供商、状态
- 系统 SHALL 标记默认连接
- 系统 SHALL 为每个连接提供操作菜单
- 系统 SHALL 在无连接时显示添加提示

**Scenario: 显示连接列表**
- WHEN 用户进入 AI 设置页面
- THEN 系统在"连接管理"区块显示所有已配置的连接
- THEN 每个连接显示名称、提供商类型、认证状态
- THEN 默认连接显示"默认"标签

**Scenario: 连接排序**
- WHEN 用户查看连接列表
- THEN 默认连接显示在列表顶部
- THEN 其余连接按名称字母顺序排序

**Scenario: 无连接空状态**
- WHEN 用户尚未配置任何 AI 连接
- THEN 系统显示"未配置连接。添加连接以开始使用。"

---

#### Requirement: AI 连接操作

**系统 SHALL** 提供连接的增删改查操作。
- 系统 SHALL 支持添加新连接
- 系统 SHALL 支持编辑现有连接
- 系统 SHALL 支持删除非默认连接
- 系统 SHALL 支持设置默认连接
- 系统 SHALL 支持验证连接有效性
- 系统 SHALL 支持重新认证

**Scenario: 添加新连接**
- WHEN 用户点击"+ 添加连接"按钮
- THEN 系统打开全屏 API 设置向导
- THEN 用户完成配置后系统返回并刷新连接列表

**Scenario: 编辑连接**
- WHEN 用户从连接菜单选择"编辑"选项
- THEN 系统打开全屏 API 设置向导预填充当前连接数据
- THEN 用户更新配置后系统返回并刷新连接列表

**Scenario: 删除连接**
- WHEN 用户从连接菜单选择"删除"选项
- THEN 系统要求确认删除操作
- THEN 系统删除该连接
- THEN 系统刷新连接列表
- THEN 如果删除的是唯一连接，系统阻止删除

**Scenario: 设置默认连接**
- WHEN 用户从非默认连接菜单选择"设为默认"选项
- THEN 系统将该连接设为默认
- THEN 系统刷新连接列表
- THEN 默认连接标签更新位置

**Scenario: 验证连接**
- WHEN 用户从连接菜单选择"验证连接"选项
- THEN 系统发起连接验证请求
- THEN 系统显示"验证中..."状态
- THEN 验证成功后显示"连接有效"状态 3 秒
- THEN 验证失败后显示错误消息 5 秒

**Scenario: 重新认证**
- WHEN 用户从连接菜单选择"重新认证"选项
- THEN 系统打开全屏 API 设置向导
- THEN 系统根据连接类型选择相应的认证流程
- THEN 重新认证完成后系统刷新连接列表

---

#### Requirement: AI 凭据健康警告

**系统 SHALL** 检测并显示凭据健康问题。
- 系统 SHALL 在启动时检查凭据健康状态
- 系统 SHALL 检测文件损坏问题
- 系统 SHALL 检测加密失败（机器迁移）问题
- 系统 SHALL 检测默认凭据缺失问题
- 系统 SHALL 显示警告横幅并提供重新认证入口

**Scenario: 显示凭据损坏警告**
- WHEN 系统检测到凭据文件损坏
- THEN 系统在 AI 设置页面顶部显示警告横幅
- THEN 系统显示"凭据问题检测到"标题
- THEN 系统显示"凭据文件损坏。请重新认证。"消息
- THEN 系统提供"重新认证"按钮

**Scenario: 显示机器迁移警告**
- WHEN 系统检测到来自其他机器的凭据
- THEN 系统显示警告横幅
- THEN 系统显示"检测到来自另一台机器的凭据"消息

**Scenario: 处理重新认证**
- WHEN 用户点击警告横幅中的"重新认证"按钮
- THEN 系统打开默认连接的 API 设置向导
- THEN 重新认证成功后清除警告

---

#### Requirement: AI 工作区覆盖设置

**系统 SHALL** 支持工作区级别的 AI 设置覆盖。
- 系统 SHALL 为每个工作区显示可展开的覆盖卡片
- 系统 SHALL 显示工作区名称、图标和当前配置摘要
- 系统 SHALL 支持覆盖连接、模型和推理深度
- 系统 SHALL 支持"使用默认"选项以恢复应用默认设置
- 系统 SHALL 实时更新设置变更

**Scenario: 显示工作区覆盖**
- WHEN 用户进入 AI 设置页面且有配置的工作区
- THEN 系统在"工作区覆盖"区块显示所有工作区卡片
- THEN 每个卡片显示工作区图标、名称和配置摘要（如"使用默认"或具体配置）

**Scenario: 展开工作区详情**
- WHEN 用户点击工作区卡片
- THEN 系统展开该工作区的详细配置选项
- THEN 用户可修改连接、模型和推理深度

**Scenario: 覆盖连接设置**
- WHEN 用户在工作区卡片中选择特定的连接
- THEN 系统为该工作区设置覆盖连接
- THEN 系统更新配置摘要

**Scenario: 恢复默认设置**
- WHEN 用户在工作区卡片中选择"使用默认"选项
- THEN 系统清除该工作区的覆盖设置
- THEN 工作区将使用应用默认设置

**Scenario: 多工作区配置**
- WHEN 用户配置多个工作区的不同 AI 设置
- THEN 每个工作区的配置独立保存和应用
- THEN 配置摘要显示每个工作区的特定设置

---

## 3.2 外观设置页面

#### Requirement: 默认主题配置

**系统 SHALL** 允许用户配置默认主题。
- 系统 SHALL 提供主题模式选择（系统/浅色/深色）
- 系统 SHALL 提供颜色主题下拉选择
- 系统 SHALL 提供字体选择
- 系统 SHALL 实时预览主题变更

**Scenario: 切换主题模式**
- WHEN 用户从模式分段控制器选择模式
- THEN 系统更新全局主题模式
- THEN 可选选项包括"系统"、"浅色"、"深色"
- THEN 每个选项显示对应的图标

**Scenario: 切换颜色主题**
- WHEN 用户从颜色主题下拉菜单选择新主题
- THEN 系统更新全局颜色主题
- THEN 系统加载预设主题列表供选择

**Scenario: 切换字体**
- WHEN 用户从字体分段控制器选择字体
- THEN 系统更新全局字体设置

---

#### Requirement: 工作区主题覆盖

**系统 SHALL** 支持工作区级别的主题覆盖。
- 系统 SHALL 为每个工作区显示主题选择器
- 系统 SHALL 提供"使用默认"选项
- 系统 SHALL 显示应用默认主题标签
- 系统 SHALL 支持独立配置每个工作区的主题

**Scenario: 显示工作区主题列表**
- WHEN 用户进入外观设置页面
- THEN 系统在"工作区主题"区块显示所有工作区
- THEN 每个工作区显示图标、名称和主题选择器

**Scenario: 为工作区设置自定义主题**
- WHEN 用户为工作区选择特定的颜色主题
- THEN 系统为该工作区设置覆盖主题
- THEN 该工作区的主题选择器显示所选主题

**Scenario: 恢复工作区默认主题**
- WHEN 用户为工作区选择"使用默认"选项
- THEN 系统清除该工作区的主题覆盖
- THEN 该工作区使用应用默认主题

---

#### Requirement: 工具图标映射

**系统 SHALL** 显示 CLI 命令到工具图标的映射表。
- 系统 SHALL 显示图标预览、工具名称和触发命令
- 系统 SHALL 支持搜索工具
- 系统 SHALL 显示图标存储路径信息
- 系统 SHALL 提供 AI 辅助编辑和文件编辑入口

**Scenario: 显示工具图标表**
- WHEN 用户进入外观设置页面
- THEN 系统在"工具图标"区块显示工具图标映射数据表
- THEN 表格包含图标、工具名称、命令列
- THEN 每行显示对应的工具图标预览

**Scenario: 搜索工具图标**
- WHEN 用户在工具图标表输入搜索关键词
- THEN 系统过滤显示匹配的工具行

**Scenario: 编辑工具图标配置**
- WHEN 用户点击"编辑"按钮
- THEN 系统打开 AI 辅助编辑弹窗
- THEN 系统提供"编辑文件"次级操作打开 tool-icons.json

**Scenario: 无工具图标空状态**
- WHEN 工具图标映射表为空
- THEN 系统显示"未找到工具图标映射"提示

---

## 3.3 偏好设置页面

#### Requirement: 个人信息配置

**系统 SHALL** 允许用户配置个人信息。
- 系统 SHALL 提供姓名输入字段
- 系统 SHALL 提供时区输入字段
- 系统 SHALL 提供语言选择器
- 系统 SHALL 自动保存配置变更

**Scenario: 配置姓名**
- WHEN 用户在"姓名"输入框输入内容
- THEN 系统自动保存（500ms 防抖）
- THEN 保存成功后更新配置

**Scenario: 配置时区**
- WHEN 用户在"时区"输入框输入内容
- THEN 系统验证时区格式
- THEN 系统自动保存（500ms 防抖）

**Scenario: 配置语言**
- WHEN 用户从语言下拉菜单选择语言
- THEN 系统立即应用语言设置（无需防抖）
- THEN 系统更新界面语言
- THEN 语言选项包括英语、简体中文

---

#### Requirement: 位置信息配置

**系统 SHALL** 允许用户配置位置信息。
- 系统 SHALL 提供城市输入字段
- 系统 SHALL 提供国家/地区输入字段
- 系统 SHALL 自动保存配置变更
- 系统 SHALL 支持位置感知响应

**Scenario: 配置城市**
- WHEN 用户在"城市"输入框输入内容
- THEN 系统自动保存（500ms 防抖）

**Scenario: 配置国家**
- WHEN 用户在"国家"输入框输入内容
- THEN 系统自动保存（500ms 防抖）

---

#### Requirement: 备注配置

**系统 SHALL** 允许用户添加自由形式的个人备注。
- 系统 SHALL 提供多行文本区域用于输入备注
- 系统 SHALL 自动保存配置变更
- 系统 SHALL 提供 AI 辅助编辑和文件编辑入口

**Scenario: 输入备注**
- WHEN 用户在"备注"文本区域输入内容
- THEN 系统自动保存（500ms 防抖）

**Scenario: 编辑备注文件**
- WHEN 用户点击备注区域的"编辑"按钮
- THEN 系统打开 AI 辅助编辑弹窗
- THEN 系统提供"编辑文件"次级操作打开 preferences.json

---

#### Requirement: 偏好表单验证

**系统 SHALL** 验证偏好配置的数据完整性。
- 系统 SHALL 处理读取 preferences.json 的错误
- 系统 SHALL 处理写入 preferences.json 的错误
- 系统 SHALL 在卸载时保存未保存的变更
- 系统 SHALL 支持语言设置的旧版兼容

**Scenario: 首次加载**
- WHEN preferences.json 不存在或为空
- THEN 系统显示空表单
- THEN 系统不显示错误

**Scenario: 保存失败处理**
- WHEN 写入 preferences.json 失败
- THEN 系统在控制台记录错误
- THEN 系统保持 UI 状态不变

**Scenario: 旧版语言兼容**
- WHEN 系统检测到旧版语言格式（如"简体中文"）
- THEN 系统自动转换为"zh-CN"格式

---

## 3.4 权限设置页面

#### Requirement: 关于权限说明

**系统 SHALL** 提供权限功能的说明信息。
- 系统 SHALL 解释权限的功能和用途
- 系统 SHALL 推荐工作流（Explore → Execute）
- 系统 SHALL 提供文档链接

**Scenario: 显示权限说明**
- WHEN 用户进入权限设置页面
- THEN 系统显示"关于权限"区块
- THEN 系统显示权限控制功能的详细说明

**Scenario: 打开权限文档**
- WHEN 用户点击"了解更多"链接
- THEN 系统在浏览器打开权限文档页面

---

#### Requirement: 默认权限配置

**系统 SHALL** 显示应用级别的默认权限配置。
- 系统 SHALL 显示允许的 Bash 命令模式
- 系统 SHALL 显示允许的 MCP 服务器模式
- 系统 SHALL 显示允许的 API 端点
- 系统 SHALL 显示允许的写入路径
- 系统 SHALL 支持 AI 辅助编辑和文件编辑入口

**Scenario: 显示默认权限表**
- WHEN 用户进入权限设置页面
- THEN 系统显示"默认权限"区块
- THEN 权限数据表列出所有默认允许的模式
- THEN 每行显示访问类型、类型、模式和备注

**Scenario: 编辑默认权限**
- WHEN 用户点击"编辑"按钮
- THEN 系统打开 AI 辅助编辑弹窗
- THEN 系统提供"编辑文件"次级操作打开 default.json

**Scenario: 监听文件变更**
- WHEN default.json 文件被外部编辑
- THEN 系统自动重新加载默认权限配置
- THEN 系统更新权限数据表

---

#### Requirement: 工作区自定义权限

**系统 SHALL** 显示工作区级别的自定义权限配置。
- 系统 SHALL 显示工作区额外添加的阻止工具
- 系统 SHALL 显示工作区额外添加的 Bash 模式
- 系统 SHALL 显示工作区额外添加的 MCP 模式
- 系统 SHALL 显示工作区额外的 API 端点
- 系统 SHALL 显示工作区额外的写入路径

**Scenario: 显示工作区自定义权限表**
- WHEN 用户当前有活跃工作区且配置了自定义权限
- THEN 系统显示"工作区自定义"区块
- THEN 权限数据表列出所有自定义规则

**Scenario: 编辑工作区权限**
- WHEN 用户点击"编辑"按钮
- THEN 系统打开 AI 辅助编辑弹窗
- THEN 系统提供"编辑文件"次级操作打开 workspace permissions.json

---

#### Requirement: 权限空状态

**系统 SHALL** 在没有权限配置时显示适当的空状态消息。

**Scenario: 无默认权限**
- WHEN default.json 不存在或为空
- THEN 系统显示"未找到默认权限"提示
- THEN 系统显示预期文件路径

**Scenario: 无工作区自定义权限**
- WHEN 工作区没有配置自定义权限
- THEN 系统显示"未配置自定义权限"提示
- THEN 系统提示用户如何创建 permissions.json 文件

---

## 3.5 标签设置页面

#### Requirement: 关于标签说明

**系统 SHALL** 提供标签功能的说明信息。
- 系统 SHALL 解释标签的用途（组织会话）
- 系统 SHALL 解释标签值类型（文本、数字、日期）
- 系统 SHALL 解释自动应用规则的功能
- 系统 SHALL 提供文档链接

**Scenario: 显示标签说明**
- WHEN 用户进入标签设置页面
- THEN 系统显示"关于标签"区块
- THEN 系统详细说明标签功能和使用场景

---

#### Requirement: 标签层级管理

**系统 SHALL** 显示工作区的标签层级结构。
- 系统 SHALL 显示所有配置的标签
- 系统 SHALL 支持标签嵌套以形成分组
- 系统 SHALL 支持搜索标签
- 系统 SHALL 支持全屏查看
- 系统 SHALL 提供 AI 辅助编辑和文件编辑入口

**Scenario: 显示标签层级表**
- WHEN 用户进入标签设置页面且工作区有标签配置
- THEN 系统显示"标签层级"区块
- THEN 数据表以树形结构显示所有标签
- THEN 支持展开/折叠子标签

**Scenario: 编辑标签配置**
- WHEN 用户点击"编辑"按钮
- THEN 系统打开 AI 辅助编辑弹窗
- THEN 系统提供"编辑文件"次级操作打开 labels/config.json

**Scenario: 无标签空状态**
- WHEN 工作区没有配置标签
- THEN 系统显示"未配置标签"提示
- THEN 系统提示用户如何创建标签配置

---

#### Requirement: 自动应用规则

**系统 SHALL** 显示标签自动应用规则配置。
- 系统 SHALL 显示所有自动应用规则
- 系统 SHALL 显示规则的正则表达式和对应的标签
- 系统 SHALL 支持搜索规则
- 系统 SHALL 支持全屏查看
- 系统 SHALL 提供 AI 辅助编辑和文件编辑入口

**Scenario: 显示自动应用规则表**
- WHEN 用户进入标签设置页面且工作区有自动应用规则配置
- THEN 系统显示"自动应用规则"区块
- THEN 数据表列出所有规则和对应的标签

---

## 3.6 工作区设置页面

#### Requirement: 工作区信息管理

**系统 SHALL** 允许用户管理工作区基本信息。
- 系统 SHALL 显示工作区名称
- 系统 SHALL 显示工作区图标
- 系统 SHALL 支持重命名工作区
- 系统 SHALL 支持更换工作区图标

**Scenario: 显示工作区名称**
- WHEN 用户进入工作区设置页面
- THEN 系统显示工作区当前名称
- THEN 系统提供"编辑"按钮

**Scenario: 重命名工作区**
- WHEN 用户点击"编辑"按钮
- THEN 系统打开重命名对话框
- THEN 用户输入新名称后系统保存
- THEN 系统刷新工作区列表显示新名称

**Scenario: 显示工作区图标**
- WHEN 用户进入工作区设置页面
- THEN 系统显示工作区当前图标
- THEN 若无图标显示首字母占位符
- THEN 系统提供"更改"按钮

**Scenario: 更换工作区图标**
- WHEN 用户点击"更改"按钮并选择图片文件
- THEN 系统验证文件类型（PNG, JPEG, SVG, WebP, GIF）
- THEN 系统上传图片到工作区目录
- THEN 系统刷新显示新图标
- THEN 系统刷新侧边栏图标

**Scenario: 图标上传中状态**
- WHEN 图片上传进行中
- THEN 系统在图标位置显示加载动画
- THEN 按钮显示"上传中..."文本

---

#### Requirement: 工作区权限配置

**系统 SHALL** 允许用户配置工作区的默认权限模式。
- 系统 SHALL 提供权限模式选择器
- 系统 SHALL 显示每个模式的名称和描述
- 系统 SHALL 实时保存配置变更

**Scenario: 设置默认权限模式**
- WHEN 用户从下拉菜单选择权限模式
- THEN 可选模式包括："只读"、"请求"、"完全允许"
- THEN 每个选项显示对应的名称和描述
- THEN 系统保存配置

---

#### Requirement: 模式切换配置

**系统 SHALL** 允许用户配置可用切换的权限模式。
- 系统 SHALL 显示可切换的权限模式列表
- 系统 SHALL 允许用户启用/禁用模式
- 系统 SHALL 要求至少启用 2 个模式
- 系统 SHALL 实时保存配置变更

**Scenario: 切换权限模式**
- WHEN 用户点击某个权限模式的开关
- THEN 系统更新该模式的启用状态
- THEN 系统验证启用模式数量（至少 2 个）

**Scenario: 禁用最后一个模式**
- WHEN 用户尝试禁用仅剩的 2 个已启用模式中的一个
- THEN 系统阻止操作
- THEN 系统显示"至少需要 2 个模式"错误消息
- THEN 错误消息在 2 秒后自动消失

**Scenario: 保存模式切换配置**
- WHEN 用户成功更新模式切换配置
- THEN 系统保存配置到 cyclablePermissionModes
- THEN 模式切换在聊天输入中可用

---

#### Requirement: 工作区高级配置

**系统 SHALL** 允许用户配置工作区的高级选项。
- 系统 SHALL 允许设置默认工作目录
- 系统 SHALL 允许启用/禁用本地 MCP 服务器

**Scenario: 设置默认工作目录**
- WHEN 用户点击"更改..."按钮
- THEN 系统打开文件夹选择对话框
- THEN 用户选择目录后系统保存路径
- THEN 系统显示所选路径

**Scenario: 清除默认工作目录**
- WHEN用户点击"清除"按钮
- THEN 系统清除默认工作目录设置
- THEN 系统显示"未设置（使用会话文件夹）"

**Scenario: 切换本地 MCP 服务器**
- WHEN 用户切换本地 MCP 服务器开关
- THEN 系统启用/禁用 stdio 子进程服务器
- THEN 系统保存配置

---

#### Requirement: 无工作区空状态

**系统 SHALL** 在没有活跃工作区时显示空状态。

**Scenario: 无工作区**
- WHEN 用户进入工作区设置页面但没有活跃工作区
- THEN 系统显示"工作区设置"标题
| THEN 系统显示"未选择工作区"提示

---

## 3.7 快捷键页面

#### Requirement: 注册表快捷键显示

**系统 SHALL** 从集中式操作注册表显示快捷键。
- 系统 SHALL 按分类组织快捷键
- 系统 SHALL 显示操作名称和对应的快捷键组合
- 系统 SHALL 正确处理 Mac 和 Windows 的快捷键符号

**Scenario: 显示快捷键表**
- WHEN 用户进入快捷键页面
- THEN 系统按操作分类显示快捷键
- THEN 每个快捷键显示操作标签和按键符号

**Scenario: Mac 快捷键显示**
- WHEN 用户使用 Mac 操作系统
- THEN 快捷键使用 Mac 符号（⌘, ⇧）显示

**Scenario: Windows 快捷键显示**
- WHEN 用户使用 Windows 操作系统
- THEN 快捷键使用 Windows 格式（Ctrl, Shift）显示

---

#### Requirement: 组件特定快捷键

**系统 SHALL** 显示组件级别的特定快捷键。

**Scenario: 列表导航快捷键**
- WHEN 用户查看快捷键页面
- THEN 系统显示"列表导航"分区
- THEN 快捷键包括：↑↓（导航）、Home（首项）、End（末项）

**Scenario: 会话列表快捷键**
- WHEN 用户查看快捷键页面
- THEN 系统显示"会话列表"分区
- THEN 快捷键包括：Enter（聚焦聊天输入）、右键（打开上下文菜单）

**Scenario: 聊天输入快捷键**
- WHEN 用户查看快捷键页面
- THEN 系统显示"聊天输入"分区
- THEN 快捷键包括：Enter（发送）、Shift+Enter（新行）、Esc（关闭/失焦）

---

## 3.8 应用设置页面

#### Requirement: 通知设置

**系统 SHALL** 允许用户配置桌面通知。
- 系统 SHALL 提供桌面通知开关
- 系统 SHALL 显示通知功能说明
- 系统 SHALL 实时保存配置变更

**Scenario: 启用桌面通知**
- WHEN 用户打开"桌面通知"开关
- THEN 系统启用通知功能
- THEN 系统显示说明"聊天中 AI 工作完成时收到通知"

**Scenario: 禁用桌面通知**
- WHEN 用户关闭"桌面通知"开关
- THEN 系统禁用通知功能

---

#### Requirement: 电源设置

**系统 SHALL** 允许用户配置屏幕唤醒保持选项。
- 系统 SHALL 提供屏幕唤醒保持开关
- 系统 SHALL 显示功能说明
- 系统 SHALL 实时保存配置变更

**Scenario: 启用屏幕唤醒保持**
- WHEN 用户打开"保持屏幕唤醒"开关
- THEN 系统防止在会话运行时屏幕关闭
- THEN 系统显示说明"在会话运行时防止屏幕关闭"

**Scenario: 禁用屏幕唤醒保持**
- WHEN 用户关闭"保持屏幕唤醒"开关
| THEN 系统允许屏幕正常关闭

---

#### Requirement: 关于信息

**系统 SHALL** 显示应用信息。
- 系统 SHALL 显示当前版本号
- 系统 SHALL 提供检查更新按钮
- 系统 SHALL 显示更新可用提示
- 系统 SHALL 提供安装更新按钮

**Scenario: 显示版本信息**
- WHEN 用户进入应用设置页面
- THEN 系统在"关于"区块显示当前版本号

**Scenario: 检查更新**
- WHEN 用户点击"立即检查"按钮
- THEN 系统启动更新检查
- THEN 按钮显示"检查中..."状态和加载动画
- THEN 检查完成后恢复按钮状态

**Scenario: 显示可用更新**
- WHEN 检测到新版本可用
- THEN 系统在版本号旁显示"更新到 {版本}"按钮

**Scenario: 安装更新**
- WHEN 用户点击更新按钮
- THEN 系统准备更新安装
- THEN 如果更新已准备好下载，系统显示"重启以更新"按钮

**Scenario: 版本加载中**
- WHEN 版本信息正在加载
- THEN 系统显示"加载中..."占位文本

---

## 4. 数据模型

### 4.1 LlmConnectionWithStatus

```typescript
interface LlmConnectionWithStatus extends LlmConnection {
  isAuthenticated: boolean       // 是否已认证
  authError?: string             // 认证错误信息
  isDefault: boolean            // 是否为默认连接
}
```

### 4.2 WorkspaceSettings

```typescript
interface WorkspaceSettings {
  name?: string                          // 工作区名称
  permissionMode?: PermissionMode       // 默认权限模式
  workingDirectory?: string              // 默认工作目录
  localMcpEnabled?: boolean             // 本地 MCP 服务器启用
  defaultLlmConnection?: string         // 默认 LLM 连接 slug
  model?: string                         // 默认模型
  thinkingLevel?: ThinkingLevel         // 默认推理深度
  cyclablePermissionModes?: PermissionMode[] // 可切换的权限模式
}
```

### 4.3 PreferencesFormState

```typescript
interface PreferencesFormState {
  name: string         // 用户姓名
  timezone: string     // 时区（如 America/New_York）
  language: string     // 语言（en, zh-CN）
  city: string         // 城市
  country: string      // 国家
  notes: string        // 备注信息
}
```

---

## 5. 修改记录

### MODIFIED 区块

<!-- 本区块用于记录需求的变更历史，初始时为空 -->

```markdown
示例格式：
| 日期 | 版本 | 修改类型 | 修改内容 | 修改人 |
|------|------|----------|----------|--------|
| YYYY-MM-DD | 1.1.0 | 更新 | 添加 XXX 功能需求 | XXX |
```

### REMOVED 区块

<!-- 本区块用于记录已废弃或移除的需求，初始时为空 -->

```markdown
示例格式：
| 日期 | 版本 | 移除需求 | 移除原因 |
|------|------|----------|----------|
| YYYY-MM-DD | 1.1.0 | 原需求编号 | 具体原因 |
```
