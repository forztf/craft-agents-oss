# Workspace Management Specification

## Purpose
工作区管理模块是 Craft Agents 应用的顶级组织单元。系统 SHALL 提供工作区的创建、切换、配置和删除功能,所有数据源和会话都隶属于特定工作区。

---

## Requirements

### Requirement: 工作区切换器显示
系统 SHALL 在侧边栏提供工作区切换器组件,用于显示当前活动工作区并允许切换。

> 来源: apps/electron/src/renderer/components/app-shell/WorkspaceSwitcher.tsx:42-165

#### Scenario: 侧边栏未折叠显示
- **WHEN** 侧边栏展开 (isCollapsed=false)
- **THEN** 系统显示当前工作区的圆形头像 + 工作区名称 + 下拉箭头图标

#### Scenario: 侧边栏折叠显示
- **WHEN** 侧边栏折叠 (isCollapsed=true)
- **THEN** 系统仅显示当前工作区的圆形头像(图标模式,无文字)

#### Scenario: 工作区头像显示优先级
- **WHEN** 工作区配置了 iconUrl
- **THEN** 系统 SHALL 按优先级使用图标: 1. 缓存的 data URL (本地图标), 2. 远程 URL (http://或https://), 3. 未定义(显示首字母回退)

#### Scenario: 图标加载与缓存
- **WHEN** 工作区有本地文件图标 (file:// 协议)
- **THEN** 系统通过 IPC (readWorkspaceImage) 读取文件并转换为 data URL,缓存到 iconCache 状态,通过 sourceUrl 检测文件变更重新加载

#### Scenario: SVG 图标处理
- **WHEN** 文件扩展名为 .svg
- **THEN** 系统读取原始 SVG 内容并编码为 base64 data URL 格式 (`data:image/svg+xml;base64,...`)

#### Scenario: 头像加载失败回退
- **WHEN** 图标加载失败或未配置
- **THEN** 系统显示工作区名称的首字母作为回退头像 (圆形背景)

#### Scenario: 工作区名称渐变截断
- **WHEN** 工作区名称超过容器宽度
- **THEN** 系统使用 FadingText 组件在名称末尾显示渐变消失效果,而非硬截断

---

### Requirement: 工作区列表显示
系统 SHALL 提供下拉菜单列出所有可用工作区,支持选择和在新窗口打开。

> 来源: apps/electron/src/renderer/components/app-shell/WorkspaceSwitcher.tsx:168-222

#### Scenario: 展开工作区列表
- **WHEN** 用户点击工作区切换器触发器
- **THEN** 系统展开 DropdownMenu,列出所有工作区项 (头像 + 名称)

#### Scenario: 标记活动工作区
- **WHEN** 下拉菜单渲染
- **THEN** 当前活动工作区显示选中状态 (bg-foreground/10 背景色高亮 + Check 图标)

#### Scenario: 工作区项悬停操作
- **WHEN** 用户悬停在非活动工作区项上
- **THEN** 系统显示"在新窗口打开"按钮 (ExternalLink 图标,仅在悬停时可见)

---

### Requirement: 工作区选择与切换
系统 SHALL 支持点击切换工作区,以及在新窗口中打开工作区。

> 来源: apps/electron/src/renderer/components/app-shell/WorkspaceSwitcher.tsx:172-210

#### Scenario: 点击切换工作区
- **WHEN** 用户点击列表中的工作区项
- **THEN** 系统调用 onSelect(workspaceId, false) 切换到指定工作区并关闭下拉菜单

#### Scenario: 快捷键在新窗口打开
- **WHEN** 用户按 Cmd (macOS) 或 Ctrl 键并点击工作区项
- **THEN** 系统调用 onSelect(workspaceId, true) 在新窗口中打开该工作区

#### Scenario: 按钮在新窗口打开
- **WHEN** 用户点击工作区项悬停时显示的"在新窗口打开"按钮
- **THEN** 系统调用 onSelect(workspaceId, true) 在新窗口中打开,阻止事件冒泡

#### Scenario: 添加新工作区入口
- **WHEN** 用户点击下拉菜单底部的"Add Workspace..."选项
- **THEN** 系统触发 handleNewWorkspace,显示 WorkspaceCreationScreen 全屏创建界面

---

### Requirement: 工作区创建界面
系统 SHALL 提供全屏覆盖层用于工作区创建流程,支持 Obsidian 风格的向导式创建。

> 来源: apps/electron/src/renderer/components/workspace/WorkspaceCreationScreen.tsx:32-113

#### Scenario: 进入创建界面
- **WHEN** 用户点击"Add Workspace..."或调用 setShowCreationScreen(true)
- **THEN** 系统打开全屏覆盖层,显示选择步骤 (choice -> create 或 open),设置 fullscreenOverlayOpen 原子值

#### Scenario: 创建流程状态管理
- **WHEN** 用户在创建界面中操作
- **THEN** 系统管理 step 状态 ('choice' | 'create' | 'open') 和 isCreating 加载状态

#### Scenario: 关闭创建界面
- **WHEN** 用户点击关闭按钮或按 ESC 键 (且 isCreating=false)
- **THEN** 系统调用 onClose,重置 showCreationScreen 和 fullscreenOverlayOpen

#### Scenario: 创建过程防误操作
- **WHEN** isCreating=true (创建进行中)
- **THEN** 系统禁用返回按钮、创建按钮、关闭按钮,显示半透明不可点击状态

#### Scenario: 创建成功回调
- **WHEN** 工作区创建成功完成
- **THEN** 系统调用 onWorkspaceCreated 回调,显示成功提示 "Created workspace '{name}'",关闭创建界面并切换到新工作区

---

### Requirement: 工作区创建方式选择
系统 SHALL 提供创建新工作区和打开现有文件夹两种创建方式的选择页面。

> 来源: apps/electron/src/renderer/components/workspace/AddWorkspaceStep_Choice.tsx:56-88

#### Scenario: 选择创建新工作区
- **WHEN** 用户点击"Create new"卡片 (FolderPlus 图标)
- **THEN** 系统调用 onCreateNew,切换到创建新工作区步骤 (step='create')

#### Scenario: 选择打开现有文件夹
- **WHEN** 用户点击"Open folder"卡片 (FolderOpen 图标)
- **THEN** 系统调用 onOpenFolder,切换到打开文件夹步骤 (step='open')

#### Scenario: 卡片悬停反馈
- **WHEN** 用户悬停在选项卡片上
- **THEN** 系统显示 hover:bg-foreground/5 背景渐变效果

---

### Requirement: 创建新工作区
系统 SHALL 提供表单用于输入工作区名称并选择存储位置,支持默认位置和自定义位置。

> 来源: apps/electron/src/renderer/components/workspace/AddWorkspaceStep_CreateNew.tsx:26-186

#### Scenario: 输入工作区名称
- **WHEN** 用户在输入框中键入名称
- **THEN** 系统实时更新 name 状态,自动生成 URL 安全格式的 slug (通过 slugify 工具函数)

#### Scenario: 名称输入验证规则
- **WHEN** 用户输入名称
- **THEN** 系统在 300ms 防抖后验证 slug 是否在默认位置已存在,显示错误提示 "A workspace named '{slug}' already exists" 并禁用创建按钮

#### Scenario: 默认存储位置
- **WHEN** 用户选择"Default location"选项
- **THEN** 系统显示默认路径 (~/.craft-agent/workspaces/),最终路径为 `${defaultBasePath}/${slug}`

#### Scenario: 自定义存储位置浏览
- **WHEN** 用户选择"Choose a location"选项并点击"Browse"按钮
- **THEN** 系统调用 electronAPI.openFolderDialog 打开文件夹选择对话框,设置 customPath 状态

#### Scenario: 自定义路径显示
- **WHEN** 用户选择了自定义位置路径
- **THEN** 系统在副标题位置显示全路径,最终路径为 `${customPath}/${slug}`

#### Scenario: 返回选择页面
- **WHEN** 用户点击"Back"按钮
- **THEN** 系统调用 onBack 返回到创建方式选择页面（仅在非创建状态时可用）

#### Scenario: 创建按钮状态
- **WHEN** 名称字段为空、路径未选择 (customPath 为 null)、存在验证错误、或正在验证/创建中
- **THEN** 系统禁用"Create"按钮 (disabled=true)

#### Scenario: 执行创建操作
- **WHEN** 用户点击"Create"按钮
- **THEN** 系统设置 isCreating=true,调用 onCreate(finalPath, name),显示"Creating..."加载状态按钮

---

### Requirement: 打开现有文件夹为工作区
系统 SHALL 允许用户选择任意现有文件夹并将其注册为工作区。

> 来源: apps/electron/src/renderer/components/workspace/AddWorkspaceStep_OpenFolder.tsx:17-114

#### Scenario: 浏览文件夹
- **WHEN** 用户点击"Browse"按钮
- **THEN** 系统调用 electronAPI.openFolderDialog 打开文件夹选择对话框

#### Scenario: 显示选中路径
- **WHEN** 用户选择文件夹后
- **THEN** 系统在提示框中显示文件夹完整路径 (text-foreground),替换"No folder selected"提示

#### Scenario: 自动填充工作区名称
- **WHEN** 用户选择文件夹
- **THEN** 系统提取文件夹名称 (通过 path.split 获取最后部分) 并填充到"Workspace name"输入框

#### Scenario: 打开按钮状态
- **WHEN** 尚未选择文件夹或名称为空/空白
- **THEN** 系统禁用"Open"按钮

#### Scenario: 执行打开操作
- **WHEN** 用户点击"Open"按钮
- **THEN** 系统调用 onCreate(selectedPath, workspaceName),显示"Opening..."加载状态

---

### Requirement: 工作区配置存储
系统 SHALL 在指定路径创建完整的工作区目录结构和配置文件。

> 来源: packages/shared/src/workspaces/storage.ts:267-322, packages/shared/src/workspaces/types.ts:32-62

#### Scenario: 创建工作区目录结构
- **WHEN** 系统执行工作区创建
- **THEN** 系统创建以下目录结构:
  ```
  {rootPath}/
  ├── config.json          # 工作区配置
  ├── sources/             # 数据源
  ├── sessions/            # 会话
  └── skills/              # 技能
  ```

#### Scenario: 生成配置文件
- **WHEN** 系统创建工作区
- **THEN** 系统生成 config.json 包含:
  * id: 唯一工作区 ID (ws_前缀 + 8位 UUID)
  * name: 显示名称
  * slug: URL 安全格式文件夹名 (通过 generateSlug 生成)
  * defaults: 默认设置 (继承全局配置)
  * localMcpServers: 本地 MCP 服务器配置
  * createdAt: 创建时间戳
  * updatedAt: 更新时间戳

#### Scenario: 初始化状态配置
- **WHEN** 系统创建工作区
- **THEN** 系统保存默认状态配置 (Todo, In Progress, Needs Review, Done, Cancelled) 并确保图标文件存在

#### Scenario: 初始化标签配置
- **WHEN** 系统创建工作区
- **THEN** 系统保存默认标签配置 (两个嵌套组 + 值标签)

#### Scenario: 初始化插件清单
- **WHEN** 系统创建工作区
- **THEN** 系统创建 .claude-plugin/plugin.json 清单文件,支持 SDK 插件集成 (技能、命令、代理)

#### Scenario: 原子写入配置
- **WHEN** 系统保存工作区配置
- **THEN** 系统使用 atomicWriteFileSync 写入配置文件,防止崩溃/中断时造成损坏

---

### Requirement: Slug 生成与去重
系统 SHALL 将工作区名称转换为 URL 安全的 slug 格式,并支持自动去重。

> 来源: packages/shared/src/workspaces/storage.ts:220-258

#### Scenario: Slug 生成规则
- **WHEN** 系统需要从名称生成 slug
- **THEN** 系统 SHALL 执行转换: 转小写 -> 替换非字母数字字符为连字符 -> 去除首尾连字符 -> 截断为 50 字符

#### Scenario: 空名称回退
- **WHEN** 名称处理后为空字符串
- **THEN** 系统使用 'workspace' 作为默认 slug

#### Scenario: Slug 唯一性验证 (UI 侧)
- **WHEN** 用户在创建页面输入名称
- **THEN** 系统通过 IPC 调用 checkWorkspaceSlug 验证默认位置是否存在,返回 { exists, path }

#### Scenario: Slug 自动去重 (后端侧)
- **WHEN** 创建工作区且目标路径已存在
- **THEN** 系统在 slug 后追加数字后缀直到路径不存在 (my-workspace, my-workspace-2, my-workspace-3...)

---

### Requirement: 工作区默认配置
系统 SHALL 为新工作区提供合理的默认值配置。

> 来源: packages/shared/src/workspaces/storage.ts:272-290, packages/shared/src/workspaces/types.ts:32-62

#### Scenario: 权限模式默认值
- **WHEN** 系统创建新工作区
- **THEN** 系统从 config-defaults.json 加载默认权限模式 (通常为 'ask',即 Ask to Edit)

#### Scenario: 可循环权限模式默认值
- **WHEN** 系统创建新工作区
- **THEN** 系统从全局默认加载可循环权限模式列表 (通常为 ['safe', 'ask', 'allow-all'])

#### Scenario: 源默认值
- **WHEN** 系统创建新工作区
- **THEN** 系统设置 enabledSourceSlugs 为空数组 (用户手动添加源)

#### Scenario: 工作目录默认值
- **WHEN** 系统创建新工作区
- **THEN** 系统设置 workingDirectory 为 undefined (用户手动配置,或使用会话文件夹)

#### Scenario: 思考级别默认值
- **WHEN** 系统创建新工作区
- **THEN** 系统设置 thinkingLevel 为 undefined (继承应用级别默认值 'think')

#### Scenario: 模型默认值
- **WHEN** 系统创建新工作区
- **THEN** 系统设置 model 为 undefined (继承应用级别默认模型)

#### Scenario: 本地 MCP 服务器默认值
- **WHEN** 系统创建新工作区
- **THEN** 系统从全局默认加载 localMcpServers 配置 (默认启用)

---

### Requirement: 工作区路径可移植性
系统 SHALL 支持跨机器路径的可移植格式。

> 来源: packages/shared/src/workspaces/storage.ts:124-139

#### Scenario: 路径转换为可移植格式
- **WHEN** 系统保存工作区配置
- **THEN** 系统将 workingDirectory 路径通过 toPortablePath 转换为可移植格式 (支持 ~、环境变量)

#### Scenario: 路径扩展
- **WHEN** 系统加载工作区配置
- **THEN** 系统将 workingDirectory 通过 expandPath 扩展为绝对路径

---

### Requirement: 工作区验证
系统 SHALL 提供工作区存在性验证功能。

> 来源: packages/shared/src/workspaces/storage.ts:343-345, apps/electron/src/main/ipc.ts:217-222

#### Scenario: 验证工作区存在性
- **WHEN** 系统检查指定路径是否为有效工作区
- **THEN** 系统检测是否存在 config.json 文件

#### Scenario: Slug 实时验证 (IPC)
- **WHEN** 客户端通过 IPC 调用 checkWorkspaceSlug
- **THEN** 系统检查 ~/.craft-agent/workspaces/{slug}/ 目录是否存在,返回 { exists, path }

---

### Requirement: 工作区发现与加载
系统 SHALL 支持自动发现默认位置的工作区,并提供摘要和完整加载功能。

> 来源: packages/shared/src/workspaces/storage.ts:369-391, 175-211

#### Scenario: 扫描默认位置
- **WHEN** 系统启动或刷新工作区列表
- **THEN** 系统扫描 ~/.craft-agent/workspaces/ 目录,找到所有包含 config.json 的有效工作区

#### Scenario: 扫描失败处理
- **WHEN** 扫描目录时发生错误
- **THEN** 系统忽略错误,继续扫描其他条目

#### Scenario: 获取工作区摘要
- **WHEN** 系统需要显示工作区列表 (轻量级信息)
- **THEN** 系统为每个工作区返回摘要: slug、name、sourceCount、sessionCount、createdAt、updatedAt

#### Scenario: 加载完整工作区
- **WHEN** 系统需要加载工作区进行交互
- **THEN** 系统返回完整配置、源 slug 列表、会话数量,并确保技能目录和插件清单存在

#### Scenario: 统计子目录数量
- **WHEN** 系统计算 sourceCount 或 sessionCount
- **THEN** 系统通过 readdirSync 统计指定路径下的子目录数量

---

### Requirement: 工作区最后访问时间
系统 SHALL 支持跟踪和更新工作区的最后访问时间。

> 来源: packages/core/src/types/workspace.ts:11-20

#### Scenario: 更新最后访问时间
- **WHEN** 用户切换到某个工作区
- **THEN** 系统更新该工作区的 lastAccessedAt 时间戳

#### Scenario: 最近工作区排序
- **WHEN** 系统需要显示工作区列表
- **THEN** 系统可按 lastAccessedAt 排序显示最近使用的工作区

---

### Requirement: 工作区配置管理
系统 SHALL 支持通过 IPC 接口读取和更新单个工作区设置。

> 来源: apps/electron/src/main/ipc.ts: WORKSPACE_SETTINGS_GET/UPDATE, apps/electron/src/renderer/pages/settings/WorkspaceSettingsPage.tsx

#### Scenario: 读取工作区设置
- **WHEN** 客户端通过 IPC 调用 getWorkspaceSettings(workspaceId)
- **THEN** 系统返回包含 name、permissionMode、workingDirectory、localMcpEnabled、cyclablePermissionModes 等设置的 WorkspaceSettings 对象

#### Scenario: 更新工作区设置
- **WHEN** 客户端通过 IPC 调用 updateWorkspaceSetting(workspaceId, key, value)
- **THEN** 系统更新指定工作区的设置项并持久化

---

### Requirement: 工作区重命名
系统 SHALL 支持重命名工作区 (更新 config.json 中的 name 字段)。

> 来源: packages/shared/src/workspaces/storage.ts:352-359, apps/electron/src/renderer/pages/settings/WorkspaceSettingsPage.tsx:355-371

#### Scenario: 重命名工作区
- **WHEN** 用户在设置页面修改工作区名称并提交
- **THEN** 系统调用 updateWorkspaceSetting('name', newName),更新 config.json 中的 name 字段,并刷新工作区列表

#### Scenario: 重命名对话框
- **WHEN** 用户点击"Edit"按钮
- **THEN** 系统打开 RenameDialog,显示输入框预填充当前名称,支持提交新名称

---

### Requirement: 工作区图标管理
系统 SHALL 支持工作区自定义图标的读取和写入。

> 来源: apps/electron/src/main/ipc.ts: WORKSPACE_READ_IMAGE/WORKSPACE_WRITE_IMAGE, apps/electron/src/renderer/pages/settings/WorkspaceSettingsPage.tsx:143-193

#### Scenario: 读取工作区图标
- **WHEN** 客户端通过 IPC 调用 readWorkspaceImage(workspaceId, relativePath)
- **THEN** 系统读取指定工作区目录下的图片文件,对于 .svg 返回原始内容,其他格式转换为 base64 data URL

#### Scenario: 写入工作区图标
- **WHEN** 客户端通过 IPC 调用 writeWorkspaceImage(workspaceId, relativePath, base64, mimeType)
- **THEN** 系统将 base64 编码的图片写入指定工作区目录

#### Scenario: 图标格式验证
- **WHEN** 用户上传图标文件
- **THEN** 系统验证 MIME 类型 (image/png、image/jpeg、image/svg+xml、image/webp、image/gif),拒绝不支持的格式

#### Scenario: 图标列表尝试
- **WHEN** 设置页面加载工作区图标
- **THEN** 系统依次尝试读取 icon.png、icon.jpg、icon.jpeg、icon.svg、icon.webp、icon.gif,找到第一个存在的文件

#### Scenario: 上传图标后刷新
- **WHEN** 用户成功上传图标
- **THEN** 系统立即重新加载图标预览,并调用 onRefreshWorkspaces() 更新侧边栏图标

---

### Requirement: 工作区权限模式管理
系统 SHALL 支持配置工作区默认权限模式和可循环模式。

> 来源: apps/electron/src/renderer/pages/settings/WorkspaceSettingsPage.tsx:374-423

#### Scenario: 设置默认权限模式
- **WHEN** 用户在设置页面更改默认权限模式
- **THEN** 系统更新 permissionMode 设置,选项包括:
    * safe (Explore) - 只读模式
    * ask (Ask to Edit) - 需要批准 (默认)
    * allow-all (Auto) - 自动批准所有命令

#### Scenario: 配置可循环permission模式
- **WHEN** 用户开启或关闭某个权限模式的复选框
- **THEN** 系统更新 cyclablePermissionModes 数组,至少保留 2 个模式

#### Scenario: 模式数量验证
- **WHEN** 用户尝试关闭模式导致可循环模式少于 2 个
- **THEN** 系统显示错误提示 "At least 2 modes required",阻止操作并自动 2 秒后隐藏错误

---

### Requirement: 工作区高级配置
系统 SHALL 支持配置工作目录和本地 MCP 服务器。

> 来源: apps/electron/src/renderer/pages/settings/WorkspaceSettingsPage.tsx:426-460

#### Scenario: 设置默认工作目录
- **WHEN** 用户点击"Change..."按钮并选择文件夹
- **THEN** 系统调用 electronAPI.openFolderDialog,设置 workingDirectory 为选定路径

#### Scenario: 清除工作目录
- **WHEN** 用户点击"Clear"按钮
- **THEN** 系统将 workingDirectory 设置为 undefined (使用会话文件夹)

#### Scenario: 切换本地 MCP 服务器
- **WHEN** 用户切换"Local MCP Servers"开关
- **THEN** 系统更新 localMcpEnabled 设置

---

### Requirement: 本地 MCP 服务器配置
系统 SHALL 支持工作区级别的本地 MCP 服务器控制。

> 来源: packages/shared/src/workspaces/storage.ts:447-469

#### Scenario: 检查本地 MCP 启用状态
- **WHEN** 系统查询某个工作区的本地 MCP 配置
- **THEN** 系统按优先级返回结果: 环境变量 CRAFT_LOCAL_MCP_ENABLED > 工作区配置 localMcpServers.enabled > 默认值 (true)

#### Scenario: 环境变量覆盖
- **WHEN** 设置了 CRAFT_LOCAL_MCP_ENABLED 环境变量
- **THEN** 系统使用环境变量值 (true/false) 忽略工作区配置

#### Scenario: 工作区配置生效
- **WHEN** 工作区配置了 localMcpServers.enabled
- **THEN** 系统使用工作区配置控制本地 MCP 服务器启用状态

---

### Requirement: 工作区颜色主题
系统 SHALL 支持工作区级别的颜色主题配置。

> 来源: packages/shared/src/workspaces/storage.ts:394-441

#### Scenario: 获取工作区主题
- **WHEN** 系统查询工作区主题配置
- **THEN** 系统返回 config.defaults.colorTheme 或 undefined (继承应用默认)

#### Scenario: 设置工作区主题
- **WHEN** 系统更新工作区主题
- **THEN** 系统验证主题 ID (字母数字+连字符+下划线,最多 64 字符),更新 config 并保存

#### Scenario: 恢复默认主题
- **WHEN** 用户传入 null 或 undefined 作为主题 ID
- **THEN** 系统删除 config.defaults.colorTheme,工作区使用应用默认主题

#### Scenario: 主题 ID 验证拒绝
- **WHEN** 传入的主题 ID 不符合格式要求
- **THEN** 系统在控制台记录警告并拒绝更新

---

### Requirement: 工作区窗口管理
系统 SHALL 支持在新窗口中打开工作区,并在窗口间切换工作区。

> 来源: apps/electron/src/main/ipc.ts:242-289, apps/electron/src/main/window-manager.ts:62-140

#### Scenario: 在新窗口打开工作区
- **WHEN** 客户端调用 OPEN_WORKSPACE IPC
- **THEN** 系统调用 windowManager.focusOrCreateWindow(workspaceId),聚焦或创建新窗口

#### Scenario: 当前窗口切换工作区
- **WHEN** 客户端调用 SWITCH_WORKSPACE IPC
- **THEN** 系统更新窗口的工作区映射,更新应用配置的 activeWorkspaceId

#### Scenario: 更新最后访问时间
- **WHEN** 系统切换工作区
- **THEN** 系统更新工作区的 lastAccessedAt 时间戳

---

### Requirement: 工作区删除
系统 SHALL 支持删除工作区文件夹及其所有内容。

> 来源: packages/shared/src/workspaces/storage.ts:328-337

#### Scenario: 删除工作区文件夹
- **WHEN** 系统执行工作区删除
- **THEN** 系统递归删除整个工作区文件夹及其内容 (rmSync 选项 { recursive: true })

#### Scenario: 删除失败处理
- **WHEN** 目标路径不存在或删除操作失败
- **THEN** 系统返回 false

---

### Requirement: 工作区国际化
系统 SHALL 为工作区管理模块提供完整的国际化支持。

> 来源: apps/electron/src/renderer/components/workspace/*.tsx, apps/electron/src/renderer/pages/settings/WorkspaceSettingsPage.tsx

#### Scenario: 工作区切换器翻译
- **WHEN** 用户界面显示工作区切换器
- **THEN** 系统使用命名空间 'components/app-shell/WorkspaceSwitcher' 翻译所有文本

#### Scenario: 工作区创建界面翻译
- **WHEN** 用户在创建工作区流程中
- **THEN** 系统使用命名空间 'components/workspace/*' 翻译各步骤文本

#### Scenario: 工作区设置翻译
- **WHEN** 用户查看工作区设置页面
- **THEN** 系统使用命名空间 'pages/settings/WorkspaceSettingsPage' 翻译设置项文本

---

## ADDED Requirements

### Requirement: 工作区创建成功通知
系统 SHALL 在工作区创建成功后显示 Toast 通知。

> 来源: apps/electron/src/renderer/components/app-shell/WorkspaceSwitcher.tsx:110-116

#### Scenario: 创建成功通知
- **WHEN** 工作区创建成功完成
- **THEN** 系统调用 toast.success 显示 "Created workspace '{name}'"，并关闭创建界面

---

### Requirement: 全屏覆盖层状态管理
系统 SHALL 使用原子值跟踪全屏覆盖层的打开/关闭状态。

> 来源: apps/electron/src/renderer/components/app-shell/WorkspaceSwitcher.tsx:50-51, 106-120

#### Scenario: 打开创建界面时设置覆盖层
- **WHEN** 用户点击"Add Workspace..."显示创建界面
- **THEN** 系统设置 fullscreenOverlayOpenAtom 为 true

#### Scenario: 关闭创建界面时重置覆盖层
- **WHEN** 创建界面关闭（成功完成或用户取消）
- **THEN** 系统设置 fullscreenOverlayOpenAtom 为 false

---

### Requirement: 工作区切换器无障碍支持
系统 SHALL 为工作区切换器提供适当的 ARIA 标签。

> 来源: apps/electron/src/renderer/components/app-shell/WorkspaceSwitcher.tsx:146, 201

#### Scenario: 切换器按钮无障碍标签
- **WHEN** 工作区切换器按钮渲染
- **THEN** 系统设置 aria-label="Select workspace" 以提供屏幕阅读器支持

#### Scenario: 新窗口打开按钮标题
- **WHEN** 悬停按钮显示在新窗口打开选项上
- **THEN** 系统设置 title="Open in new window" 以显示工具提示

---

### Requirement: 工作区创建界面视觉效果
系统 SHALL 使用动态背景和动画增强创建界面的视觉效果。

> 来源: apps/electron/src/renderer/components/workspace/WorkspaceCreationScreen.tsx:40-50, 104-145

#### Scenario: 窗口尺寸跟踪
- **WHEN** 组件挂载时
- **THEN** 系统监听 window resize 事件并更新 dimensions 状态以适配 shader 渲染

#### Scenario: Dithering shader 背景
- **WHEN** 创建界面渲染
- **THEN** 系统显示 Dithering shader 动画背景，使用适配主题的颜色（暗色模式 '9b7bb8'，浅色模式 '684e85'）

#### Scenario: 动画过渡效果
- **WHEN** 创建界面进入或退出
- **THEN** 系统使用 motion 组件和 overlayTransitionIn 过渡配置实现淡入淡出效果

---

### Requirement: 工作区创建界面关闭按钮
系统 SHALL 在创建界面标题栏提供关闭按钮，支持 ESC 键关闭。

> 来源: apps/electron/src/renderer/components/workspace/WorkspaceCreationScreen.tsx:148-172

#### Scenario: 关闭按钮拖拽区域隔离
- **WHEN** 关闭按钮渲染
- **THEN** 系统设置 titlebar-no-drag 类以允许点击，同时父容器 titlebar-drag-region 支持窗口拖拽

#### Scenario: 创建过程中禁用关闭
- **WHEN** isCreating=true（创建进行中）
- **THEN** 系统禁用关闭按钮，设置 opacity-50 和 cursor-not-allowed 防止误操作

#### Scenario: ESC 键关闭保护
- **WHEN** 创建过程中按 ESC 键
- **THEN** 系统通过 handleClose 包装函数阻止关闭，仅在 isCreating=false 时允许关闭

---

### Requirement: 工作区选择回退文本
系统 SHALL 在没有选中工作区时显示默认选择提示。

> 来源: apps/electron/src/renderer/components/app-shell/WorkspaceSwitcher.tsx:160

#### Scenario: 未选择工作区提示
- **WHEN** selectedWorkspace 为 null 或 undefined
- **THEN** 系统在工作区切换器中显示 "Select workspace" 作为默认文本

---

### Requirement: 工作区设置页面加载状态
系统 SHALL 在加载工作区设置时显示加载指示器。

> 来源: apps/electron/src/renderer/pages/settings/WorkspaceSettingsPage.tsx:282-291

#### Scenario: 加载状态显示
- **WHEN** isLoadingWorkspace=true（正在加载工作区设置）
- **THEN** 系统在内容区域显示 Spinner 组件动画

#### Scenario: 加载状态初始化
- **WHEN** 组件挂载或 activeWorkspaceId 变化时
- **THEN** 系统设置 isLoadingWorkspace=true，加载完成后设置为 false

---

### Requirement: 工作区设置页面空状态
系统 SHALL 在没有活动工作区时显示空状态提示。

> 来源: apps/electron/src/renderer/pages/settings/WorkspaceSettingsPage.tsx:270-279

#### Scenario: 无工作区选中空状态
- **WHEN** activeWorkspaceId 为 null 或 undefined
- **THEN** 系统在内容区域显示 "No workspace selected" 提示文本

---

### Requirement: 工作区图标上传状态显示
系统 SHALL 在图标上传过程中显示加载状态。

> 来源: apps/electron/src/renderer/pages/settings/WorkspaceSettingsPage.tsx:331, 342-344

#### Scenario: 上传中按钮状态
- **WHEN** isUploadingIcon=true（图标上传进行中）
- **THEN** 系统"Change"按钮显示 "Uploading..." 文本并禁用输入

#### Scenario: 上传中预览状态
- **WHEN** isUploadingIcon=true
- **THEN** 系统在图标预览区域显示 Spinner 组件替代图片

---

### Requirement: 工作区设置页面刷新回调
系统 SHALL 支持在更改设置后刷新工作区列表。

> 来源: apps/electron/src/renderer/pages/settings/WorkspaceSettingsPage.tsx:53, 186, 366

#### Scenario: 重命名后刷新
- **WHEN** 用户成功重命名工作区
- **THEN** 系统调用 onRefreshWorkspaces() 更新侧边栏工作区列表

#### Scenario: 上传图标后刷新
- **WHEN** 用户成功上传工作区图标
- **THEN** 系统调用 onRefreshWorkspaces() 更新侧边栏图标显示

---

### Requirement: 工作区设置输入重置
系统 SHALL 在文件上传后重置输入控件以允许重复选择同一文件。

> 来源: apps/electron/src/renderer/pages/settings/WorkspaceSettingsPage.tsx:191-192

#### Scenario: 文件输入重置
- **WHEN** 图标上传完成
- **THEN** 系统设置 input 元素的 value 为空字符串，允许再次选择同一文件

---

### Requirement: 工作区图标扩展名尝试顺序
系统 SHALL 按优先级顺序尝试加载工作区图标。

> 来源: apps/electron/src/renderer/pages/settings/WorkspaceSettingsPage.tsx:94-117

#### Scenario: 按扩展名顺序加载图标
- **WHEN** 设置页面加载工作区图标
- **THEN** 系统按顺序尝试以下扩展名：png、jpg、jpeg、svg、webp、gif，找到第一个存在的文件即停止

#### Scenario: 无图标时显示首字母
- **WHEN** 尝试所有扩展名但未找到图标文件
- **THEN** 系统显示工作区名称首字母大写作为图标回退

---

### Requirement: 工作区设置页面路由元数据
系统 SHALL 定义工作区设置页面的路由元数据。

> 来源: apps/electron/src/renderer/pages/settings/WorkspaceSettingsPage.tsx:38-42

#### Scenario: 设置页面路由配置
- **WHEN** 应用初始化工作区设置页面
- **THEN** 系统设置 navigator='settings' 和 slug='workspace' 用于路由注册

---

### Requirement: 工作区设置页面帮助功能
系统 SHALL 在设置页面提供帮助菜单入口。

> 来源: apps/electron/src/renderer/pages/settings/WorkspaceSettingsPage.tsx:273, 285, 295

#### Scenario: 设置页面帮助菜单
- **WHEN** 设置页面渲染 PanelHeader
- **THEN** 系统提供 HeaderMenu 组件并设置 helpFeature="workspaces" 以关联帮助文档

---

### Requirement: 工作区设置滚动区域
系统 SHALL 为长设置列表提供可滚动区域。

> 来源: apps/electron/src/renderer/pages/settings/WorkspaceSettingsPage.tsx:296-298

#### Scenario: 设置内容滚动区域
- **WHEN** 设置页面渲染
- **THEN** 系统使用 ScrollArea 组件包裹内容区域，支持垂直滚动

#### Scenario: 滚动区域渐变遮罩
- **WHEN** 内容溢出时
- **THEN** 系统应用 mask-fade-y 类显示顶部和底部渐变遮罩效果

---

### Requirement: 工作区设置页面的移除警告
系统 SHALL 显示 AI 设置已迁移的说明。

> 来源: apps/electron/src/renderer/pages/settings/WorkspaceSettingsPage.tsx:11

#### Scenario: AI 设置迁移说明
- **WHEN** 代码注释指明
- **THEN** 系统说明 AI 设置（模型、思考、连接）已迁移到 AiSettingsPage

---
