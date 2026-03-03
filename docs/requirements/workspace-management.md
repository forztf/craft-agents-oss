# 工作区管理模块需求文档 (Workspace Management Requirements)

## ADDED Requirements

### Requirement: 工作区切换器显示
系统 SHALL 提供工作区切换器组件，用于显示和管理多个工作区。

#### Scenario: 显示当前工作区
- **WHEN** 侧边栏未折叠状态
- **THEN** 系统显示当前工作区的头像（圆形图标）和名称，带下拉箭头标识

#### Scenario: 折叠状态显示
- **WHEN** 侧边栏处于折叠状态
- **THEN** 系统仅显示当前工作区的头像（图标模式）

#### Scenario: 头像加载
- **WHEN** 工作区有自定义图标
- **THEN** 系统加载并显示工作区图标，支持本地文件（file://）和远程URL（http：//或https://）
- **WHEN** 图标加载失败
- **THEN** 系统显示工作区名称的首字母作为头像回退（圆形背景）

#### Scenario: 工作区图标缓存
- **WHEN** 工作区使用本地文件图标
- **THEN** 系统通过IPC转换本地文件为data URL并缓存，检测文件变更后重新加载

---

### Requirement: 工作区列表显示
系统 SHALL 提供工作区列表功能，列出所有可用工作区。

#### Scenario: 展开工作区列表
- **WHEN** 用户点击工作区切换器触发器
- **THEN** 系统展开下拉菜单，列出所有工作区（头像+名称）

#### Scenario: 标记活动工作区
- **WHEN** 下拉菜单渲染
- **THEN** 当前活动工作区显示选中状态（高亮背景+勾选图标）

#### Scenario: 工作区项悬停
- **WHEN** 用户悬停在非活动工作区项上
- **THEN** 系统显示"在新窗口打开"按钮（外部链接图标）

---

### Requirement: 工作区选择与切换
系统 SHALL 提供工作区选择和切换功能。

#### Scenario: 点击切换工作区
- **WHEN** 用户点击列表中的工作区项
- **THEN** 系统切换到指定工作区并关闭下拉菜单

#### Scenario: 快捷键在新窗口打开
- **WHEN** 用户按Cmd/Ctrl键并点击工作区项
- **THEN** 系统在新窗口中打开该工作区

#### Scenario: 按钮在新窗口打开
- **WHEN** 用户点击工作区项上的"在新窗口打开"按钮
- **THEN** 系统在新窗口中打开该工作区，阻止事件冒泡

---

### Requirement: 工作区创建流程
系统 SHALL 提供工作区创建流程，支持两种创建方式。

#### Scenario: 进入创建流程
- **WHEN** 用户点击下拉菜单底部的"Add Workspace..."选项
- **THEN** 系统打开全屏创建界面，显示创建方式选择（Create new / Open folder）

#### Scenario: 选择创建新工作区
- **WHEN** 用户点击"Create new"卡片
- **THEN** 系统进入创建新工作区步骤

#### Scenario: 选择打开文件夹
- **WHEN** 用户点击"Open folder"卡片
- **THEN** 系统进入打开现有文件夹步骤

#### Scenario: 返回选择页面
- **WHEN** 用户在创建步骤中点击"Back"按钮
- **THEN** 系统返回到创建方式选择页面

#### Scenario: 关闭创建界面
- **WHEN** 用户点击关闭按钮或按ESC键
- **THEN** 系统关闭创建界面并返回主应用

---

### Requirement: 创建新工作区
系统 SHALL 提供创建新工作区功能。

#### Scenario: 输入工作区名称
- **WHEN** 用户在创建新工作区页面输入名称
- **THEN** 系统实时验证名称，生成URL安全格式的slug（小写字母+数字+连字符）

#### Scenario: 默认存储位置
- **WHEN** 用户选择"Default location"选项
- **THEN** 系统在`~/.craft-agent/workspaces/{slug}/`创建工作区文件夹

#### Scenario: 自定义存储位置
- **WHEN** 用户选择"Choose a location"选项并点击"Browse"
- **THEN** 系统打开文件夹选择对话框，用户确认后在选定路径创建工作区文件夹

#### Scenario: Slug重复验证
- **WHEN** 用户输入名称生成的slug已存在
- **THEN** 系统显示错误提示"A workspace named '{slug}' already exists"，禁用创建按钮

#### Scenario: Slug去重生成
- **WHEN** 创建工作区且目标路径已存在
- **THEN** 系统在slug后追加数字后缀（my-workspace, my-workspace-2, my-workspace-3...）

#### Scenario: 创建按钮状态
- **WHEN** 名称字段为空或存在验证错误
- **THEN** 系统禁用"Create"按钮并显示半透明状态

#### Scenario: 执行创建操作
- **WHEN** 用户点击"Create"按钮
- **THEN** 系统显示"Creating..."加载状态，异步创建工作区并切换到该工作区，显示成功提示"Created workspace '{name}'"

---

### Requirement: 打开现有文件夹为工作区
系统 SHALL 提供打开现有文件夹为工作区的功能。

#### Scenario: 浏览文件夹
- **WHEN** 用户点击"Browse"按钮
- **THEN** 系统打开文件夹选择对话框

#### Scenario: 显示选中路径
- **WHEN** 用户选择文件夹后
- **THEN** 系统显示文件夹完整路径

#### Scenario: 自动填充工作区名称
- **WHEN** 用户选择文件夹
- **THEN** 系统提取文件夹名称并填充到"Workspace name"输入框

#### Scenario: 打开按钮状态
- **WHEN** 尚未选择文件夹或名称为空
- **THEN** 系统禁用"Open"按钮

#### Scenario: 执行打开操作
- **WHEN** 用户点击"Open"按钮
- **THEN** 系统显示"Opening..."加载状态，将指定文件夹注册为工作区并切换到该工作区

---

### Requirement: 工作区配置结构
系统 SHALL 创建完整的工作区目录结构和配置文件。

#### Scenario: 创建工作区目录结构
- **WHEN** 系统执行工作区创建
- **THEN** 系统创建以下目录结构：
  ```
  {rootPath}/
  ├── config.json          # 工作区配置
  ├── sources/             # 数据源
  ├── sessions/            # 会话
  └── skills/              # 技能
  ```

#### Scenario: 生成工作区配置
- **WHEN** 系统创建工作区
- **THEN** 系统生成config.json包含：
  - id: 唯一工作区ID（ws_前缀+UUID）
  - name: 显示名称
  - slug: URL安全格式文件夹名
  - defaults: 默认设置（继承全局配置）
  - localMcpServers: 本地MCP服务器配置
  - createdAt: 创建时间戳
  - updatedAt: 更新时间戳

#### Scenario: 初始化状态配置
- **WHEN** 系统创建工作区
- **THEN** 系统创建默认状态配置（Todo, In Progress, Needs Review, Done, Cancelled）和对应的图标文件

#### Scenario: 初始化标签配置
- **WHEN** 系统创建工作区
- **THEN** 系统创建默认标签配置（两个嵌套组+值标签）

#### Scenario: 初始化插件清单
- **WHEN** 系统创建工作区
- **THEN** 系统创建`.claude-plugin/plugin.json`清单，支持SDK插件集成（技能、命令、代理）

---

### Requirement: 工作区默认设置
系统 SHALL 为新工作区提供合理的默认配置。

#### Scenario: 权限模式默认值
- **WHEN** 系统创建新工作区
- **THEN** 系统设置默认权限模式为'ask'（Ask to Edit），支持SHIFT+TAB循环切换

#### Scenario: 源默认值
- **WHEN** 系统创建新工作区
- **THEN** 系统设置默认启用源列表为空数组（用户手动添加）

#### Scenario: 工作目录默认值
- **WHEN** 系统创建新工作区
- **THEN** 系统设置默认工作目录为undefined（用户手动配置）

#### Scenario: 思考级别默认值
- **WHEN** 系统创建新工作区
- **THEN** 系统设置默认思考级别为undefined（继承应用级别默认值'think'）

#### Scenario: 颜色主题默认值
- **WHEN** 系统创建新工作区
- **THEN** 系统设置默认颜色主题为undefined（继承应用级别默认值）

---

### Requirement: 工作区验证
系统 SHALL 提供工作区验证功能。

#### Scenario: 验证工作区存在性
- **WHEN** 系统检查指定路径是否为有效工作区
- **THEN** 系统检测是否存在config.json文件

#### Scenario: Slug实时验证
- **WHEN** 用户在创建新工作区时输入名称
- **THEN** 系统在300ms防抖后验证slug在默认位置是否已存在

#### Scenario: 跨机器路径可移植性
- **WHEN** 系统保存工作区配置
- **THEN** 系统将工作目录路径转换为可移植格式（支持~、环境变量等）

#### Scenario: 路径扩展
- **WHEN** 系统加载工作区配置
- **THEN** 系统展开路径变量为绝对路径

---

### Requirement: 工作区删除
系统 SHALL 提供工作区删除功能。

#### Scenario: 删除工作区文件夹
- **WHEN** 系统执行工作区删除
- **THEN** 系统递归删除整个工作区文件夹及其内容

#### Scenario: 删除失败处理
- **WHEN** 目标路径不存在或删除操作失败
- **THEN** 系统返回false并处理错误

---

### Requirement: 工作区颜色主题
系统 SHALL 支持工作区级别的颜色主题配置。

#### Scenario: 获取工作区主题
- **WHEN** 系统查询工作区主题配置
- **THEN** 系统返回config.defaults.colorTheme或undefined（继承应用默认）

#### Scenario: 设置工作区主题
- **WHEN** 系统更新工作区主题
- **THEN** 系统验证主题ID（字母数字+连字符+下划线，最多64字符），更新config并保存

#### Scenario: 恢复默认主题
- **WHEN** 用户传入undefined作为主题ID
- **THEN** 系统删除config.defaults.colorTheme，工作区使用应用默认主题

---

### Requirement: 本地MCP服务器配置
系统 SHALL 支持工作区级别的本地MCP服务器控制。

#### Scenario: 默认启用本地MCP
- **WHEN** 工作区未配置本地MCP设置且未设置环境变量
- **THEN** 系统默认启用本地（stdio）MCP服务器

#### Scenario: 环境变量覆盖
- **WHEN** 设置了CRAFT_LOCAL_MCP_ENABLED环境变量
- **THEN** 系统使用环境变量值（true/false）忽略工作区配置

#### Scenario: 工作区配置生效
- **WHEN** 工作区配置了localMcpServers.enabled
- **THEN** 系统使用工作区配置控制MCP服务器启用状态

---

### Requirement: 工作区自动发现
系统 SHALL 支持自动发现默认位置的工作区。

#### Scenario: 扫描默认位置
- **WHEN** 系统启动或刷新工作区列表
- **THEN** 系统扫描`~/.craft-agent/workspaces/`目录，找到所有包含config.json的有效工作区

#### Scenario: 扫描失败处理
- **WHEN** 扫描目录时发生错误
- **THEN** 系统忽略错误，继续扫描其他条目

---

### Requirement: 工作区元数据索引
系统 SHALL 提供工作区元数据摘要信息。

#### Scenario: 获取工作区摘要
- **WHEN** 系统需要显示工作区列表
- **THEN** 系统为每个工作区计算摘要：slug、name、sourceCount、sessionCount、createdAt、updatedAt

#### Scenario: 加载完整工作区
- **WHEN** 系统需要加载工作区进行交互
- **THEN** 系统加载完整配置、源slug列表、会话数量

---

### Requirement: 工作区最后访问时间
系统 SHALL 跟踪工作区的最后访问时间。

#### Scenario: 更新最后访问时间
- **WHEN** 用户切换到某个工作区
- **THEN** 系统更新该工作区的lastAccessedAt时间戳

#### Scenario: 最近工作区排序
- **WHEN** 系统需要显示工作区列表
- **THEN** 系统可按lastAccessedAt排序显示最近使用的工作区

---

### Requirement: 工作区图标管理
系统 SHALL 支持工作区自定义图标。

#### Scenario: 设置远程图标
- **WHEN** 工作区配置了远程iconUrl（http://或https://）
- **THEN** 系统直接使用该URL显示图标，无需缓存

#### Scenario: 设置本地图标
- **WHEN** 工作区配置了本地iconUrl（file://）
- **THEN** 系统通过IPC读取文件并转换为data URL

#### Scenario: SVG图标处理
- **WHEN** 本地图标文件是.svg格式
- **THEN** 系统读取原始SVG内容并编码为base64 data URL

#### Scenario: 图标变更检测
- **WHEN** 本地图标文件的查询参数变更（如?t=123缓存清除器）
- **THEN** 系统检测到sourceUrl变化后重新加载图标

#### Scenario: 图标加载失败
- **WHEN** 图标加载失败
- **THEN** 系统在控制台记录错误并显示首字母回退头像

---

### Requirement: 文本截断显示
系统 SHALL 提供工作区名称的渐进式文本截断。

#### Scenario: 名称渐变截断
- **WHEN** 工作区名称超过容器宽度
- **THEN** 系统使用FadingText组件显示，名称末尾渐变消失而非硬截断

---

### Requirement: 创建过程状态管理
系统 SHALL 提供创建过程的防误操作保护。

#### Scenario: 创建中锁定界面
- **WHEN** 工作区创建进行中（isCreating=true）
- **THEN** 系统禁用返回按钮、创建按钮、关闭按钮，显示半透明不可点击状态

#### Scenario: ESC键保护
- **WHEN** 用户按ESC键且isCreating=true
- **THEN** 系统忽略关闭请求，防止创建过程中意外关闭

#### Scenario: 创建完成后回调
- **WHEN** 工作区创建成功
- **THEN** 系统调用onWorkspaceCreated回调，关闭创建界面，自动切换到新工作区

---

## MODIFIED Requirements

无。

---

## REMOVED Requirements

无。

---

## 版本历史
- v1.0 - 完整需求提取 (2026-03-03)
