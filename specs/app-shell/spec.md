# App Shell Specification

## Purpose
应用壳(App Shell)模块是 Craft Agents 应用的核心布局框架，负责管理应用的整体界面结构、侧边栏导航、面板切换和工作区切换。该模块采用三栏布局（左侧导航、中间列表、右侧内容），支持面板展开/折叠、多窗口模式、聚焦模式等功能。App Shell 提供了应用的基础设施，包括导航状态管理、响应式面板调整、键盘焦点管理和统一的上下文菜单系统。

## Requirements

### Requirement: 应用布局结构
系统 SHALL 提供响应式的三栏布局结构，支持动态调整面板宽度和显示状态。
> 来源: apps/electron/src/renderer/components/app-shell/AppShell.tsx

#### Scenario: 标准三栏布局
- **WHEN** 应用处于默认状态
- **THEN** 系统 SHALL 显示左侧边栏（导航菜单）
- **THEN** 系统 SHALL 显示中间导航面板（会话列表/源列表/Skill列表）
- **THEN** 系统 SHALL 显示右侧内容面板（聊天详情/设置/源详情）
- **THEN** 各面板 SHALL 支持拖拽调整宽度

#### Scenario: 侧边栏折叠
- **WHEN** 用户折叠左侧边栏
- **THEN** 左侧边栏 SHALL 切换为仅显示图标模式
- **THEN** 导航项目图标 SHALL 居中显示
- **THEN** 文本标签 SHALL 隐藏
- **THEN** 悬停时 SHALL 显示完整按钮内容

#### Scenario: 聚焦模式
- **WHEN** 应用进入聚焦模式（单窗口）
- **THEN** 系统 SHALL 隐藏左侧边栏
- **THEN** 系统 SHALL 隐藏中间导航面板
- **THEN** 系统 SHALL 仅显示主内容区域
- **THEN** 系统 SHALL 补偿 macOS 红绿灯按钮的空间偏移

---

### Requirement: 左侧边栏导航
系统 SHALL 提供可扩展的左侧导航菜单，支持多层级导航和拖拽排序。
> 来源: apps/electron/src/renderer/components/app-shell/LeftSidebar.tsx

#### Scenario: 显示导航项目
- **WHEN** 左侧边栏处于展开状态
- **THEN** 系统 SHALL 显示所有导航链接项
- **THEN** 每个项目 SHALL 显示图标和文本标签
- **THEN** 当前活动项目 SHALL 使用高亮样式显示

#### Scenario: 导航项目展开/折叠
- **WHEN** 用户点击可扩展的导航项目（如状态、标签、视图）
- **THEN** 系统 SHALL 展开/折叠该项目的子菜单
- **THEN** 子菜单 SHALL 显示缩进和垂直分隔线
- **THEN** 展开/折叠 SHALL 使用动画效果

#### Scenario: 显示项目徽章
- **WHEN** 导航项目有数量信息
- **THEN** 系统 SHALL 在项目右侧显示徽章
- **THEN** 徽章 SHALL 在组悬停时显示
- **THEN** 徽章 SHALL 显示项目数量或状态

#### Scenario: 拖拽排序
- **WHEN** 项目支持拖拽排序（如状态列表）
- **THEN** 系统 SHALL 允许用户拖拽项目调整顺序
- **THEN** 系统 SHALL 显示拖拽覆盖层
- **THEN** 拖拽完成后 SHALL 更新项目顺序

---

### Requirement: 右侧边栏内容路由
系统 SHALL 根据 NavigationState 路由不同类型的右侧边栏内容。
> 来源: apps/electron/src/renderer/components/app-shell/RightSidebar.tsx

#### Scenario: 显示会话元数据面板
- **WHEN** 导航状态为会话元数据类型
- **THEN** 系统 SHALL 显示 SessionMetadataPanel
- **THEN** 系统 SHALL 显示会话 ID、配置信息和 Token 使用统计

#### Scenario: 显示文件面板
- **WHEN** 导航状态为文件类型
- **THEN** 系统 SHALL 显示会话文件列表
- **THEN** 系统 SHALL 支持文件树导航

#### Scenario: 显示历史面板
- **WHEN** 导航状态为历史类型
- **THEN** 系统 SHALL 显示会话修改历史

#### Scenario: 隐藏边栏
- **WHEN** 导航状态为 'none'
- **THEN** 系统 SHALL 隐藏右侧边栏

---

### Requirement: 主内容面板路由
系统 SHALL 根据导航状态路由不同类型的主内容。
> 来源: apps/electron/src/renderer/components/app-shell/MainContentPanel.tsx

#### Scenario: 显示聊天页面
- **WHEN** 导航状态为会话会话且选择了会话
- **THEN** 系统 SHALL 显示 ChatPage
- **THEN** 系统 SHALL 加载并显示会话消息

#### Scenario: 显示多选面板
- **WHEN** 用户处于多选模式且选择了多个会话
- **THEN** 系统 SHALL 显示 MultiSelectPanel
- **THEN** 系统 SHALL 显示批量操作按钮（设置状态、添加标签、归档）
- **THEN** 系统 SHALL 显示选中的会话数量

#### Scenario: 显示源信息页面
- **WHEN** 导航状态为源导航且选择了源
- **THEN** 系统 SHALL 显示 SourceInfoPage
- **THEN** 系统 SHALL 显示源的配置和状态

#### Scenario: 显示设置页面
- **WHEN** 导航状态为设置导航
- **THEN** 系统 SHALL 根据 subpage 显示对应的设置页面组件
- **THEN** 设置页面 SHALL 在补光灯模式下正确显示

#### Scenario: 显示空状态
- **WHEN** 导航状态为会话导航但未选择会话
- **THEN** 系统 SHALL 显示空状态提示
- **THEN** 系统 SHALL 根据过滤器类型显示不同提示文本

---

### Requirement: 工作区切换
系统 SHALL 提供工作区切换功能，支持快速切换工作区。
> 来源: apps/electron/src/renderer/components/app-shell/WorkspaceSwitcher.tsx

#### Scenario: 显示当前工作区
- **WHEN** 左侧边栏处于展开状态
- **THEN** 系统 SHALL 在顶部显示工作区选择器
- **THEN** 系统 SHALL 显示当前工作区图标和名称
- **THEN** 系统 SHALL 显示展开/折叠指示箭头

#### Scenario: 切换工作区
- **WHEN** 用户点击工作区选择器并选择其他工作区
- **THEN** 系统 SHALL 切换到选定的工作区
- **THEN** 系统 SHALL 加载该工作区的会话、源和 Skill
- **THEN** 系统 SHALL 更新 UI 显示对应数据

#### Scenario: 在新窗口打开工作区
- **WHEN** 用户按 Cmd/Ctrl 键点击工作区项
- **THEN** 系统 SHALL 在新窗口中打开该工作区
- **THEN** 新窗口 SHALL 独立运行，共享部分状态

#### Scenario: 折叠状态下的工作区选择器
- **WHEN** 左侧边栏处于折叠状态
- **THEN** 系统 SHALL 仅显示工作区图标
- **THEN** 系统 SHALL 隐藏工作区名称

#### Scenario: 创建新工作区
- **WHEN** 用户点击"Add Workspace..."选项
- **THEN** 系统 SHALL 显示工作区创建屏幕
- **THEN** 系统 SHALL 显示全屏覆盖层
- **THEN** 系统 SHALL 在创建后切换到新工作区并显示成功提示

---

### Requirement: 后台任务栏
系统 SHALL 显示当前运行的后台任务，提供任务管理和监控功能。
> 来源: apps/electron/src/renderer/components/app-shell/ActiveTasksBar.tsx

#### Scenario: 显示活动任务
- **WHEN** 有后台任务运行
- **THEN** 系统 SHALL 在聊天输入区域上方显示任务徽章
- **THEN** 每个任务 SHALL 显示类型图标
- **THEN** 系统 SHALL 显示任务 ID（前8位）
- **THEN** 系统 SHALL 显示已运行时间

#### Scenario: 任务操作菜单
- **WHEN** 用户点击任务徽章
- **THEN** 系统 SHALL 显示任务操作菜单
- **THEN** 菜单 SHALL 包含"终止任务"、"插入消息"、"显示终端输出"选项

#### Scenario: 终止任务
- **WHEN** 用户点击"终止任务"
- **THEN** 系统 SHALL 发送终止信号到对应任务
- **THEN** 系统 SHALL 移除任务徽章

#### Scenario: 显示终端输出
- **WHEN** 用户点击"显示终端输出"
- **THEN** 系统 SHALL 显示终端输出覆盖层
- **THEN** 覆盖层 SHALL 显示任务的实时输出

#### Scenario: 格式化时间显示
- **WHEN** 任务运行时间不同
- **THEN** 系统 SHALL 使用紧凑格式显示时间（"15s"、"3m 20s"、"2h 10m"）

---

### Requirement: 认证横幅
系统 SHALL 在需要认证时显示提示横幅，引导用户完成设置。
> 来源: apps/electron/src/renderer/components/app-shell/SetupAuthBanner.tsx

#### Scenario: 显示 MCP 认证横幅
- **WHEN** MCP 源需要认证
- **THEN** 系统 SHALL 显示"Connection required"标题
- **THEN** 系统 SHALL 显示描述文本
- **THEN** 系统 SHALL 显示"Connect"按钮

#### Scenario: 显示 API 认证横幅
- **WHEN** API 源需要凭证
- **THEN** 系统 SHALL 显示"API credentials required"标题
- **THEN** 系统 SHALL 显示描述文本
- **THEN** 系统 SHALL 显示"Add Credentials"按钮

#### Scenario: 显示错误横幅
- **WHEN** 发生错误
- **THEN** 系统 SHALL 显示"Something went wrong"标题
- **THEN** 系统 SHALL 显示描述文本
- **THEN** 系统 SHALL 显示"Retry"按钮

#### Scenario: 横幅变体
- **WHEN** 横幅变体为 'inputAreaCover'
- **THEN** 系统 SHALL 显示与聊天输入区样式匹配的圆角边框
- **THEN** 系统 SHALL 居中显示内容
- **WHEN** 横幅变体为 'banner'
- **THEN** 系统 SHALL 显示单行布局（48px 高度）
- **THEN** 系统 SHALL 左右对齐标题和按钮

#### Scenario: 隐藏横幅
- **WHEN** 状态为 'hidden'
- **THEN** 系统 SHALL 不显示任何内容

---

### Requirement: 会话搜索头
系统 SHALL 提供统一的会话搜索界面组件。
> 来源: apps/electron/src/renderer/components/app-shell/SessionSearchHeader.tsx

#### Scenario: 显示搜索输入框
- **WHEN** 组件处于默认状态
- **THEN** 系统 SHALL 显示搜索图标（左侧）
- **THEN** 系统 SHALL 显示输入框
- **THEN** 系统 SHALL 显示占位符文本

#### Scenario: 执行搜索
- **WHEN** 用户输入关键词
- **THEN** 系统 SHALL 调用 onSearchChange 回调
- **THEN** 系统 SHALL 更新 searchQuery 值

#### Scenario: 关闭搜索
- **WHEN** 用户点击关闭按钮
- **THEN** 系统 SHALL 调用 onSearchClose 回调
- **THEN** 系统 SHALL 清空搜索查询

#### Scenario: 显示搜索状态
- **WHEN** 搜索查询长度 >= 2 且正在搜索
- **THEN** 系统 SHALL 显示 Spinner
- **THEN** 系统 SHALL 显示"Loading…"文本
- **WHEN** 搜索完成
- **THEN** 系统 SHALL 显示结果数量（如 "15 results"）
- **THEN** 系统 SHALL 在超过限制时显示 "100+"

#### Scenario: 键盘导航
- **WHEN** 用户按下 Escape 键
- **THEN** 系统 SHALL 调用 onSearchClose

---

### Requirement: 导航面板
系统 SHALL 提供统一的导航面板容器，包含标题和操作按钮。
> 来源: apps/electron/src/renderer/components/app-shell/NavigatorPanel.tsx

#### Scenario: 显示导航面板
- **WHEN** 面板被渲染
- **THEN** 系统 SHALL 显示面板标题
- **THEN** 系统 SHALL 显示操作按钮（如果有）
- **THEN** 子内容 SHALL 在可滚动区域中显示

#### Scenario: 补光灯偏移补偿
- **WHEN** 侧边栏不可见
- **THEN** 系统 SHALL 在面板标题中应用补光灯偏移补偿（在 macOS 上）

---

### Requirement: 面板组件
系统 SHALL 提供可配置的面板底层组件。
> 来源: apps/electron/src/renderer/components/app-shell/Panel.tsx

#### Scenario: 可变宽度的面板
- **WHEN** 面板 variant 设置为 'shrink'
- **THEN** 系统 SHALL 使用指定的 width
- **THEN** 系统 SHALL 支持拖拽调整宽度

#### Scenario: 自动扩展面板
- **WHEN** 面板 variant 设置为 'grow'
- **THEN** 系统 SHALL 占据可用空间
- **THEN** 系统 SHALL 不支持拖拽调整宽度

#### Scenario: 水平调整手柄
- **WHEN** 面板支持调整宽度
- **THEN** 系统 SHALL 显示水平调整手柄
- **THEN** 用户 SHALL 可以拖拽手柄调整面板宽度

---

### Requirement: 面板头部
系统 SHALL 提供标准化的面板头部组件，支持补光灯偏移补偿。
> 来源: apps/electron/src/renderer/components/app-shell/PanelHeader.tsx

#### Scenario: 显示面板头部
- **WHEN** 组件被渲染
- **THEN** 系统 SHALL 显示面板标题
- **THEN** 系统 SHALL 在右侧显示操作按钮（如果有）

#### Scenario: 补光灯偏移补偿
- **WHEN** compensateForStoplight 为 true
- **THEN** 系统 SHALL 在 macOS 上应用左内边距以避开红绿灯按钮区域

---

### Requirement: 多选面板
系统 SHALL 在多选模式下显示批量操作界面。
> 来源: apps/electron/src/renderer/components/app-shell/MultiSelectPanel.tsx

#### Scenario: 显示多选状态
- **WHEN** 用户选中多个会话
- **THEN** 系统 SHALL 显示选中数量（如 "3 conversations selected"）
- **THEN** 系统 SHALL 显示取消选择按钮

#### Scenario: 批量设置状态
- **WHEN** 用户点击状态下拉菜单
- **THEN** 系统 SHALL 显示所有可用的 Todo 状态
- **WHEN** 用户选择某个状态
- **THEN** 系统 SHALL 将所有选中会话更新为该状态

#### Scenario: 批量添加/移除标签
- **WHEN** 用户点击标签按钮
- **THEN** 系统 SHALL 显示标签菜单
- **WHEN** 用户选择标签
- **THEN** 系统 SHALL 切换标签在所有选中会话中的状态

#### Scenario: 批量归档
- **WHEN** 用户点击归档按钮
- **THEN** 系统 SHALL 归档所有选中的会话
- **THEN** 系统 SHALL 显示成功提示
- **THEN** 系统 SHALL 清除多选状态

#### Scenario: 取消多选
- **WHEN** 用户点击取消按钮
- **THEN** 系统 SHALL 清除所有选中的会话
- **THEN** 系统 SHALL 恢复到单选模式

---

### Requirement: 源列表面板
系统 SHALL 提供已配置源的可视化列表。
> 来源: apps/electron/src/renderer/components/app-shell/SourcesListPanel.tsx

#### Scenario: 显示源列表
- **WHEN** 用户导航到源视图
- **THEN** 系统 SHALL 显示所有已配置的源
- **THEN** 系统 SHALL 显示源图标和名称
- **THEN** 系统 SHALL 显示源状态（在线/离线/错误）

#### Scenario: 选择源
- **WHEN** 用户点击源项
- **THEN** 系统 SHALL 在主内容面板显示源详情页面

#### Scenario: 空状态
- **WHEN** 没有已配置的源
- **THEN** 系统 SHALL 显示空状态提示
- **THEN** 系统 SHALL 提供添加源的入口

---

### Requirement: Skill 列表面板
系统 SHALL 提供已配置 Skill 的可视化列表。
> 来源: apps/electron/src/renderer/components/app-shell/SkillsListPanel.tsx

#### Scenario: 显示 Skill 列表
- **WHEN** 用户导航到 Skill 视图
- **THEN** 系统 SHALL 显示所有已配置的 Skill
- **THEN** 系统 SHALL 显示 Skill 图标和名称
- **THEN** 系统 SHALL 显示 Skill 状态

#### Scenario: 选择 Skill
- **WHEN** 用户点击 Skill 项
- **THEN** 系统 SHALL 在主内容面板显示 Skill 详情页面

#### Scenario: 空状态
- **WHEN** 没有已配置的 Skill
- **THEN** 系统 SHALL 显示空状态提示
- **THEN** 系统 SHALL 提供添加 Skill 的入口

---

### Requirement: 会话菜单
系统 SHALL 提供会话的快捷操作菜单。
> 来源: apps/electron/src/renderer/components/app-shell/SessionMenu.tsx

#### Scenario: 显示会话菜单
- **WHEN** 用户点击会话的更多选项按钮
- **THEN** 系统 SHALL 显示下拉菜单
- **THEN** 菜单 SHALL 包含常用操作（重命名、Flag、归档、删除等）

#### Scenario: 动态菜单项
- **WHEN** 会话处于不同状态
- **THEN** 系统 SHALL 根据状态显示不同菜单项（Flag/Unflag、Archive/Unarchive）

#### Scenario: 子菜单
- **WHEN** 菜单项有子选项
- **THEN** 系统 SHALL 显示子菜单指示箭头
- **THEN** 用户 SHALL 可以展开子菜单

---

### Requirement: 侧边栏菜单
系统 SHALL 提供统一的侧边栏项目上下文菜单。
> 来源: apps/electron/src/renderer/components/app-shell/SidebarMenu.tsx

#### Scenario: 配置状态
- **WHEN** 用户点击"Configure Statuses"
- **THEN** 系统 SHALL 显示状态配置界面

#### Scenario: 配置标签
- **WHEN** 用户点击"Configure Labels"
- **THEN** 系统 SHALL 显示标签配置界面

#### Scenario: 添加标签
- **WHEN** 用户点击"Add New Label"
- **THEN** 系统 SHALL 显示创建标签对话框
- **THEN** 系统 SHALL 使用父标签 ID 作为新标签的父级

#### Scenario: 删除标签
- **WHEN** 用户点击"Delete Label"
- **THEN** 系统 SHALL 请求删除确认
- **THEN** 系统 SHALL 删除标签及其所有子标签

#### Scenario: 添加源/Skill
- **WHEN** 用户点击"Add Source"或"Add Skill"
- **THEN** 系统 SHALL 显示添加源/Skill 的配置界面

#### Scenario: Learn More 链接
- **WHEN** 用户点击"Learn More"
- **THEN** 系统 SHALL 根据源类型打开对应的文档页面

#### Scenario: 配置视图
- **WHEN** 用户点击"Edit Views"
- **THEN** 系统 SHALL 显示视图配置界面

#### Scenario: 删除视图
- **WHEN** 用户点击"Delete"
- **THEN** 系统 SHALL 请求删除确认
- **THEN** 系统 SHALL 删除配置的视图

---

### Requirement: 输入容器
系统 SHALL 提供聊天输入的容器，支持自由输入和结构化输入两种模式。
> 来源: apps/electron/src/renderer/components/app-shell/input/InputContainer.tsx

#### Scenario: 自由输入模式
- **WHEN** 会话处于自由输入模式
- **THEN** 系统 SHALL 显示富文本编辑器
- **THEN** 用户 SHALL 可以输入任意文本
- **THEN** 系统 SHALL 支持 @提及、#标签、/命令等快捷方式

#### Scenario: 结构化输入模式
- **WHEN** AI 需要用户提供特定信息（如权限、凭证）
- **THEN** 系统 SHALL 显示结构化输入表单
- **THEN** 系统 SHALL 根据 Request 类型显示对应的表单字段

#### Scenario: 发送消息
- **WHEN** 用户点击发送按钮或按 Enter
- **THEN** 系统 SHALL 调用 onSendMessage 回调
- **THEN** 系统 SHALL 传递当前输入内容和附件

#### Scenario: 附件上传
- **WHEN** 用户拖拽文件到输入区域
- **THEN** 系统 SHALL 显示文件预览
- **THEN** 系统 SHALL 准备文件附件数据

#### Scenario: 停止生成（Escape）
- **WHEN** AI 正在生成时用户按 Escape
- **THEN** 系统 SHALL 显示中断覆盖层
- **THEN** 用户 SHALL 可以确认或取消中断操作

---

### Requirement: 附件预览
系统 SHALL 在输入区域显示已上传文件的预览。
> 来源: apps/electron/src/renderer/components/app-shell/AttachmentPreview.tsx

#### Scenario: 显示图片附件
- **WHEN** 用户上传图片文件
- **THEN** 系统 SHALL 显示图片缩略图
- **THEN** 系统 SHALL 显示文件名
- **THEN** 系统 SHALL 显示移除按钮

#### Scenario: 显示其他文件类型
- **WHEN** 用户上传非图片文件
- **THEN** 系统 SHALL 显示文件图标
- **THEN** 系统 SHALL 显示文件名和大小

#### Scenario: 移除附件
- **WHEN** 用户点击移除按钮
- **THEN** 系统 SHALL 从附件列表中移除该文件

---

### Requirement: 活动选项徽章
系统 SHALL 显示当前活动的会话选项（Todo 状态、标签、源等）。
> 来源: apps/electron/src/renderer/components/app-shell/ActiveOptionBadges.tsx

#### Scenario: 显示状态徽章
- **WHEN** 会话设置了 Todo 状态
- **THEN** 系统 SHALL 显示状态图标和名称
- **THEN** 系统 SHALL 使用状态对应的颜色

#### Scenario: 显示标签徽章
- **WHEN** 会话设置了标签
- **THEN** 系统 SHALL 显示标签徽章
- **THEN** 系统 SHALL 在悬停时显示完整标签树

#### Scenario: 显示源徽章
- **WHEN** 会话选择了特定源
- **THEN** 系统 SHALL 显示源图标和名称

#### Scenario: 移除徽章
- **WHEN** 用户点击徽章上的移除按钮
- **THEN** 系统 SHALL 清除对应的选项

---

### Requirement: 键盘导航
系统 SHALL 支持完整的键盘导航以提升可访问性。
> 来源: apps/electron/src/renderer/components/app-shell/AppShell.tsx, apps/electron/src/renderer/hooks/keyboard.ts

#### Scenario: 导航区域焦点
- **WHEN** 用户使用方向键导航
- **THEN** 系统 SHALL 在不同区域间移动焦点（侧边栏 → 会话列表 → 聊天区域）
- **THEN** 系统 SHALL 更新焦点指示器样式

#### Scenario: 快捷键
- **WHEN** 用户按 Cmd+K
- **THEN** 系统 SHALL 打开命令菜单
- **WHEN** 用户按 Cmd+Shift+O
- **THEN** 系统 SHALL 打开源菜单
- **WHEN** 用户按 Cmd+Shift+K
- **THEN** 系统 SHALL 打开 Skill 菜单
- **WHEN** 用户按 Cmd+/
- **THEN** 系统 SHALL 打开快捷键帮助

---

### Requirement: 模糊搜索
系统 SHALL 提供全局模糊搜索功能，快速查找会话、消息、源和 Skill。
> 来源: apps/electron/src/renderer/components/app-shell/AppShell.tsx

#### Scenario: 打开搜索界面
- **WHEN** 用户按 Cmd+K 或点击搜索图标
- **THEN** 系统 SHALL 显示命令菜单
- **THEN** 系统 SHALL 聚焦到搜索输入框

#### Scenario: 搜索结果分类
- **WHEN** 用户输入搜索关键词
- **THEN** 系统 SHALL 对结果进行分类显示（会话、命令、源、Skill）
- **THEN** 系统 SHALL 使用模糊匹配算法排序结果

#### Scenario: 快速操作
- **WHEN** 用户选择搜索结果
- **THEN** 系统 SHALL 执行对应操作（导航到会话、执行命令等）

---

### Requirement: 上下文菜单
系统 SHALL 为界面元素提供右键上下文菜单。
> 来源: apps/electron/src/renderer/components/ui/styled-context-menu.tsx

#### Scenario: 显示上下文菜单
- **WHEN** 用户右键点击元素
- **THEN** 系统 SHALL 在鼠标位置显示上下文菜单
- **THEN** 系统 SHALL 点击元素周围显示高亮状态

#### Scenario: 关闭上下文菜单
- **WHEN** 用户点击菜单外区域
- **THEN** 系统 SHALL 关闭菜单
- **WHEN** 用户按 Escape 键
- **THEN** 系统 SHALL 关闭菜单

---

### Requirement: 响应式设计
系统 SHALL 根据窗口大小自适应布局。
> 来源: apps/electron/src/renderer/components/app-shell/AppShell.tsx

#### Scenario: 窗口调整
- **WHEN** 用户调整窗口大小
- **THEN** 系统 SHALL 相应调整面板宽度比例
- **THEN** 系统 SHALL 保持布局响应性

#### Scenario: 最小尺寸限制
- **WHEN** 窗口缩小到最小尺寸
- **THEN** 系统 SHALL 限制各面板的最小宽度
- **THEN** 系统 SHALL 隐藏次要元素以节省空间

---

## ADDED Requirements

### Requirement: 活动任务管理
系统 SHALL 提供活动任务的可视化和管理功能。
> 来源: apps/electron/src/renderer/components/app-shell/ActiveTasksBar.tsx

#### Scenario: 任务徽章样式
- **WHEN** 有后台活动任务运行
- **THEN** 系统 SHALL 在聊天输入区域上方显示风格一致的任务徽章
- **THEN** 徽章 SHALL 显示类型图标
- **THEN** 系统 SHALL 显示缩短的任务 ID（前8位）
- **THEN** 系统 SHALL 显示已运行时间（紧凑格式：15s、3m、2h）

#### Scenario: 任务操作菜单
- **WHEN** 用户点击任务徽章
- **THEN** 系统 SHALL 显示任务操作菜单
- **THEN** 菜单 SHALL 包含"终止任务"、"插入消息"、"显示终端输出"选项

#### Scenario: 终止执行中的任务
- **WHEN** 用户点击"终止任务"选项
- **THEN** 系统 SHALL 向对应任务发送终止信号
- **THEN** 系统 SHALL 从显示中移除任务徽章

#### Scenario: 将任务输出插入消息
- **WHEN** 用户点击"插入消息"选项
- **THEN** 系统 SHALL 将任务的摘要消息插入到输入框
- **THEN** 用户 SHALL 可以据此继续交互

#### Scenario: 显示终端输出覆盖层
- **WHEN** 用户点击"显示终端输出"选项
- **THEN** 系统 SHALL 在覆盖层中显示任务的实时终端输出
- **THEN** 覆盖层 SHALL 支持滚动查看完整输出

---

### Requirement: 认证状态横幅显示
系统 SHALL 在需要认证时显示友好的提示横幅，引导用户完成设置。
> 来源: apps/electron/src/renderer/components/app-shell/SetupAuthBanner.tsx

#### Scenario: MCP 连接横幅
- **WHEN** MCP 源需要认证连接
- **THEN** 系统 SHALL 显示"Connection required"标题
- **THEN** 系统 SHALL 显示"Connect to required services to continue."描述
- **THEN** 系统 SHALL 显示"Connect"操作按钮

#### Scenario: API 凭证横幅
- **WHEN** API 源需要配置凭证
- **THEN** 系统 SHALL 显示"API credentials required"标题
- **THEN** 系统 SHALL 显示"Enter API credentials to continue."描述
- **THEN** 系统 SHALL 显示"Add Credentials"操作按钮

#### Scenario: 错误重试横幅
- **WHEN** 配置过程发生错误
- **THEN** 系统 SHALL 显示"Something went wrong"标题
- **THEN** 系统 SHALL 显示"Something went wrong. Tap to retry."描述
- **THEN** 系统 SHALL 显示"Retry"操作按钮

#### Scenario: 输入区覆盖样式横幅
- **WHEN** 横幅变体为 'inputAreaCover'
- **THEN** 系统 SHALL 使用圆角边框样式匹配聊天输入区
- **THEN** 系统 SHALL 居中对齐标题和描述
- **THEN** 系统 SHALL 将操作按钮显示在底部

#### Scenario: 单行横幅样式
- **WHEN** 横幅变体为 'banner'
- **THEN** 系统 SHALL 使用单行布局（48px 高度，全宽度）
- **THEN** 系统 SHALL 左右对齐标题在左，按钮在右
- **THEN** 系统 SHALL 添加底部边框分隔

#### Scenario: 自定义描述
- **WHEN** 提供了自定义 reason 参数
- **THEN** 系统 SHALL 显示自定义描述文本而非默认描述

---

### Requirement: 会话搜索界面组件
系统 SHALL 提供标准化的会话搜索界面，支持搜索查询输入和状态显示。
> 来源: apps/electron/src/renderer/components/app-shell/SessionSearchHeader.tsx

#### Scenario: 搜索输入框
- **WHEN** 组件渲染
- **THEN** 系统 SHALL 在左侧显示静态搜索图标
- **THEN** 系统 SHALL 显示输入框
- **THEN** 系统 SHALL 显示占位符文本（默认："Search titles and content..."）

#### Scenario: 执行搜索查询
- **WHEN** 用户在输入框中输入文本
- **THEN** 系统 SHALL 触发 onSearchChange 回调并更新查询
- **THEN** 系统 SHALL 通知父组件执行搜索

#### Scenario: 清除搜索
- **WHEN** 用户点击右侧的 x 关闭按钮
- **THEN** 系统 SHALL 触发 onSearchClose 回调
- **THEN** 系统 SHALL 清空搜索查询并关闭搜索模式

#### Scenario: 搜索加载状态
- **WHEN** 搜索查询长度 >= 2 且 isSearching 为 true
- **THEN** 系统 SHALL 在输入下方显示状态行
- **THEN** 系统 SHALL 显示 Spinner 加载指示器
- **THEN** 系统 SHALL 显示"Loading…"文本

#### Scenario: 搜索结果计数
- **WHEN** 搜索完成且 isSearching 为 false
- **THEN** 系统 SHALL 在输入下方显示状态行
- **THEN** 系统 SHALL 显示结果数量（如 "15 results"）
- **THEN** 系统 SHALL 在结果超过限制显示"100+"

#### Scenario: 键盘导航
- **WHEN** 用户在输入框中按下 Escape 键
- **THEN** 系统 SHALL 触发 onKeyDown 回调
- **THEN** 系统 SHALL 清除搜索并关闭搜索模式

#### Scenario: 只读模式
- **WHEN** readOnly 为 true（如在 playground 演示中）
- **THEN** 系统 SHALL 将输入框设置为只读
- **THEN** 用户 SHALL 无法修改搜索查询

---

### Requirement: 导航面板容器
系统 SHALL 提供标准化的导航面板容器，包含标题和可选的操作按钮区。
> 来源: apps/electron/src/renderer/components/app-shell/NavigatorPanel.tsx

#### Scenario: 导航面板结构
- **WHEN** 组件被渲染
- **THEN** 系统 SHALL 使用 Panel 组件包裹内容
- **THEN** 系统 SHALL 添加 PanelHeader 包含标题
- **THEN** 系统 SHALL 在 headerActions 位置显示操作按钮（如过滤、添加等）
- **THEN** 子内容 SHALL 在可滚动区域中显示

#### Scenario: 补光灯偏移补偿
- **WHEN** isSidebarVisible 为 false（侧边栏隐藏）
- **THEN** 系统 SHALL 在 PanelHeader 中应用补光灯偏移补偿（macOS 上的红绿灯按钮区域）
- **THEN** 系统 SHALL 调整标题区域以避免被红绿灯按钮遮挡

#### Scenario: 使用指定宽度
- **WHEN** 组件被赋予 width 属性
- **THEN** 系统 SHALL 将 width 传递给 Panel 组件
- **THEN** 系统 SHALL 允许拖拽调整面板宽度至初始值附近

---

### Requirement: 右侧边栏内容路由器
系统 SHALL 根据面板类型路由不同的右侧边栏内容组件。
> 来源: apps/electron/src/renderer/components/app-shell/RightSidebar.tsx

#### Scenario: 会话元数据面板
- **WHEN** panel.type 为 'sessionMetadata'
- **THEN** 系统 SHALL 渲染 SessionMetadataPanel
- **THEN** 系统 SHALL 传递 sessionId 用于加载元数据
- **THEN** 系统 SHALL 显示关闭按钮以关闭右侧边栏

#### Scenario: 文件面板（待实现）
- **WHEN** panel.type 为 'files'
- **THEN** 系统 SHALL 显示占位文本"Files panel - Coming soon"

#### Scenario: 历史面板（待实现）
- **WHEN** panel.type 为 'history'
- **THEN** 系统 SHALL 显示占位文本"History panel - Coming soon"

#### Scenario: 无侧边栏
- **WHEN** panel.type 为 'none' 或未定义
- **THEN** 系统 SHALL 返回 null 不渲染任何内容

#### Scenario: 关闭按钮显示
- **WHEN** closeButton 属性被提供
- **THEN** 系统 SHALL 在面板头部显示关闭按钮元素

---

### Requirement: 主内容面板路由器
系统 SHALL 根据 NavigationState 状态路由主内容区域的不同页面类型。
> 来源: apps/electron/src/renderer/components/app-shell/MainContentPanel.tsx

#### Scenario: 设置页面路由
- **WHEN** 导航状态为设置页面（isSettingsNavigation 返回 true）
- **THEN** 系统 SHALL 根据 navState.subpage 获取对应设置组件
- **THEN** 系统 SHALL 使用 Panel (variant='grow') 包裹内容
- **THEN** 系统 SHALL 使用 StoplightProvider 包裹以支持补光灯偏移补偿（在聚焦模式下）

#### Scenario: 源详情页面路由
- **WHEN** 导航状态为源导航且 navState.details 存在
- **THEN** 系统 SHALL 渲染 SourceInfoPage
- **THEN** 系统 SHALL 传递 sourceSlug 和 workspaceId
- **THEN** 系统 SHALL 使用 Panel 和 StoplightProvider 包裹

#### Scenario: 源空状态
- **WHEN** 为源导航但 navState.details 不存在
- **THEN** 系统 SHALL 显示"No sources configured"文本
- **THEN** 系统 SHALL 居中显示文本于主内容区域

#### Scenario: Skill 详情页面路由
- **WHEN** 导航状态为 Skill 导航且 navState.details?.type 为 'skill'
- **THEN** 系统 SHALL 渲染 SkillInfoPage
- **THEN** 系统 SHALL 传递 skillSlug 和 workspaceId
- **THEN** 系统 SHALL 使用 Panel 和 StoplightProvider 包裹

#### Scenario: Skill 空状态
- **WHEN** 为 Skill 导航但 navState.details 不存在或类型不匹配
- **THEN** 系统 SHALL 显示"No skills configured"文本
- **THEN** 系统 SHALL 居中显示文本于主内容区域

#### Scenario: 多选模式面板
- **WHEN** 为会话导航且 isMultiSelectActive 为 true
- **THEN** 系统 SHALL 渲染 MultiSelectPanel
- **THEN** 系统 SHALL 传递 selectionCount、todoStates、activeStatusId、labels、appliedLabelIds
- **THEN** 系统 SHALL 传递批量操作回调（onSetStatus、onToggleLabel、onArchive、onClearSelection）

#### Scenario: 会话聊天页面路由
- **WHEN** 为会话导航且 navState.details 存在
- **THEN** 系统 SHALL 渲染 ChatPage
- **THEN** 系统 SHALL 传递 sessionId
- **THEN** 系统 SHALL 使用 Panel 和 StoplightProvider 包裹

#### Scenario: 会话空状态（默认）
- **WHEN** 为会话导航但 navState.details 不存在
- **THEN** 系统 SHALL 根据过滤器类型显示文本
- **THEN** 过滤器为 'flagged' 时显示"No flagged conversations"
- **THEN** 其他过滤器显示"No conversations yet"
- **THEN** 系统 SHALL 居中显示文本

### Requirement: 左侧边栏导航菜单
系统 SHALL 提供功能丰富的导航菜单，支持展开/折叠、右键菜单、拖拽排序等功能。
> 来源: apps/electron/src/renderer/components/app-shell/LeftSidebar.tsx

#### Scenario: 常规链接项显示
- **WHEN** 遍历 sidebar items
- **THEN** 系统 SHALL 显示图标、文本标签和可选徽章（计数）
- **THEN** 'default' variant 使用高亮样式（半透明前景色背景）
- **THEN** 'ghost' variant 使用悬停效果样式
- **THEN** 系统 SHALL 对项目应用 data-focused 和焦点相关样式

#### Scenario: 可展开项目交互
- **WHEN** 项目的 expandable 属性为 true
- **THEN** 系统 SHALL 悬停显示可展开图标（ChevronRight，悬停时替换主图标）
- **THEN** 用户点击图标 SHALL 触发 onToggle 回调展开/折叠子菜单
- **THEN** 子菜单 SHALL 在展开状态下渲染嵌套的 LeftSidebar

#### Scenario: 右键上下文菜单
- **WHEN** 项目配置了 contextMenu
- **THEN** 系统 SHALL 包裹项目在 ContextMenu 和 ContextMenuTrigger 中
- **THEN** 系统 SHALL 点击右键显示 StyledContextMenuContent 和 SidebarMenu
- **THEN** 系统 SHALL 显示为项目配置的操作（配置状态、配置标签、添加源/Skill、删除等）

#### Scenario: 子动画效果
- **WHEN** 嵌套菜单（isNested 为 true）展开/折叠
- **THEN** 系统 SHALL 使用 AnimatePresence 和 motion 动画子项
- **THEN** 系统 SHALL 使用交错(stagger)动画效果，子项依次淡入
- **THEN** 系统 SHALL 在嵌套菜单左侧显示垂直分隔线

#### Scenario: 分隔项目
- **WHEN** 遇到类型为 'separator' 的项目
- **THEN** 系统 SHALL 渲染水平分隔线（1px 高度，半透明前景色）
- **THEN** 分隔线 SHALL 不响应键盘焦点或鼠标交互

#### Scenario: 紧凑模式项目
- **WHEN** 项目的 compact 属性为 true
- **THEN** 系统 SHALL 减少项目的垂直内边距（py-3 替代 py-5）

#### Scenario: 后标题元素显示
- **WHEN** 项目配置了 afterTitle 属性
- **THEN** 系统 SHALL 在项目标题右侧渲染该元素（如标签值类型图标）
- **THEN** 元素 SHALL 仅在组悬停时显示（group-hover:opacity-100）

#### Scenario: 徽章显示
- **WHEN** 项目配置了 label 属性（计数或状态）
- **THEN** 系统 SHALL 在项目右侧显示徽章
- **THEN** 徽章 SHALL 使用较小字号、淡色文本，仅在组悬停时显示

#### Scenario: 可拖拽排序列表
- **WHEN** 项目的 sortable 属性配置了 onReorder 回调
- **THEN** 子项目 SHALL 包裹在 SortableList 中
- **THEN** 系统 SHALL 支持 Flat list（平铺列表）拖拽排序
- **THEN** 拖拽完成后 SHALL 调用 onReorder 并传递排序后的项目 ID 数组

#### Scenario: 教程目标属性
- **WHEN** 项目配置了 dataTutorial 属性
- **THEN** 系统 SHALL 将该属性设置在按钮元素上
- **THEN** 系统 SHALL 用于教程/引导系统定位该元素

#### Scenario: 键盘焦点管理
- **WHEN** getItemProps 返回了某个项目的焦点状态 'data-focused' 为 true
- **THEN** 系统 SHALL 为该项目应用焦点高亮样式
- **THEN** 系统 SHALL 使用 ref 保存焦点元素引用

---

### Requirement: 工作区切换器下拉菜单
系统 SHALL 提供工作区选择和创建的界面，支持在新窗口打开工作区。
> 来源: apps/electron/src/renderer/components/app-shell/WorkspaceSwitcher.tsx

#### Scenario: 显示当前工作区
- **WHEN** 组件被渲染
- **THEN** 系统 SHALL 显示选中工作区的头像（CrossfadeAvatar）
- **THEN** 系统 SHALL 侧边栏展开时显示工作区名称（FadingText 防止文本溢出）
- **THEN** 系统 SHALL 侧边栏折叠时只显示头像，隐藏文字

#### Scenario: 工作区列表下拉菜单
- **WHEN** 用户点击下拉菜单触发按钮
- **THEN** 系统 SHALL 显示所有可用工作区列表
- **THEN** 每个 SHALL 显示工作区头像和名称
- **WHEN** 工作区为当前活跃
- **THEN** 系统 SHALL 在右侧显示 Check 图标
- **THEN** 系统 SHALL 应用高亮背景（bg-foreground/10）
- **THEN** 系统 SHALL 不显示"在新窗口打开"按钮

#### Scenario: 切换工作区
- **WHEN** 用户点击下拉菜单中的工作区项
- **THEN** 系统 SHALL 调用 onSelect(workspaceId, openInNewWindow)
- **THEN** 系统 SHALL 默认不在新窗口打开（openInNewWindow 为 false）
- **THEN** 系统 SHALL 切换为选定工作区并加载对应数据

#### Scenario: 在新窗口打开工作区
- **WHEN** 用户按 Cmd/Ctrl 键点击非活跃工作区项
- **THEN** 系统 SHALL 设置 openInNewWindow 为 true
- **THEN** 系统 SHALL 在新 Electron 窗口中打开该工作区
- **THEN** 新窗口 SHALL 独立运行但共享部分数据

#### Scenario: 在新窗口按钮（悬停显示）
- **WHEN** 下拉菜单为非活跃工作区且鼠标悬停
- **THEN** 系统 SHALL 在项目右侧显示 ExternalLink 图标按钮
- **THEN** 按钮 SHALL 仅在悬停时显示（opacity-0 group-hover:opacity-100）
- **THEN** 用户点击 SHALL 触发在新窗口打开动作（调用 onSelect(id, true)）

#### Scenario: 头像加载和缓存
- **WHEN** 组件被渲染
- **THEN** 系统 SHALL 遍历所有工作区并通过 IPC 读取本地图标文件
- **THEN** 系统 SHALL 将本地图标转换为 Data URL
- **THEN** 系统 SHALL 缓存图标 URL 以避免重复读取（iconCache 状态）
- **THEN** 系统 SHALL 对于远程 URL (http:// / https://) 直接使用无需缓存

#### Scenario: 添加新工作区
- **WHEN** 用户点击"Add Workspace..."选项
- **THEN** 系统 SHALL 设置 showCreationScreen 为 true
- **THEN** 系统 SHALL 设置 fullscreenOverlayOpenAtom 为 true
- **THEN** 系统 SHALL 创建全屏工作区创建覆盖层（WorkspaceCreationScreen）

#### Scenario: 工作区创建成功
- **WHEN** WorkspaceCreationScreen 调用 onWorkspaceCreated
- **THEN** 系统 SHALL 关闭创建屏幕并覆盖层
- **THEN** 系统 SHALL 调用 toast.success 显示成功提示（"Created workspace "{name}""）
- **THEN** 系统 SHALL 调用 onWorkspaceCreated?.(workspace) 通知父组件
- **THEN** 系统 SHALL 调用 onSelect(workspace.id) 切换到新工作区

#### Scenario: 取消工作区创建
- **WHEN** 用户关闭 WorkspaceCreationScreen
- **THEN** 系统 SHALL 调用 handleCloseCreationScreen
- **THEN** 系统 SHALL 隐藏创建屏幕
- **THEN** 系统 SHALL 清除全屏覆盖层状态

#### Scenario: 折叠状态下的工作区选择器
- **WHEN** isCollapsed 属性为 true
- **THEN** 系统 SHALL 仅显示工作区头像在方形按钮中
- **THEN** 按钮 SHALL 居中显示头像，无文字
- **THEN** 按钮 SHALL 宽为 9，高为 9

---

## MODIFIED Requirements

初版整理，暂无。

## REMOVED Requirements

初版整理，暂无。
