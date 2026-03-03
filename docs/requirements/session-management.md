# 会话管理模块需求规格文档 (Session Management)

## 文档版本
- **版本:** 1.0
- **创建日期:** 2026-03-03
- **模块负责人:** Product Team

## 执行摘要

会话管理模块是 Craft Agents 的核心功能之一，负责管理用户与 AI 的对话会话。该模块提供完整的会话生命周期管理，包括创建、查看、搜索、组织、归档和删除会话的功能。

### 核心功能
- 会话列表展示与分组（按日期）
- 会话搜索（标题和内容）
- 会话筛选（状态、标签、视图）
- 会话元数据编辑（名称、备注）
- 会话状态管理（Flag、标记已读、标状态）
- 会话标签管理
- 会话分享（生成可分享链接）
- 会话归档与恢复
- 会话多窗口打开
- 会话文件浏览

---

## 需求规格

### SM-001: 会话列表展示

**Requirement SM-001: 会话列表展示**

系统 SHALL 提供会话列表视图，显示工作区中的所有会话。

#### 功能性需求
- 系统 SHALL 按最后消息时间降序排列会话
- 系统 SHALL 按日期分组显示会话（今天、昨日、具体日期）
- 系统 SHALL 显示每个会话的名称、最后消息时间、消息数量
- 系统 SHALL 显示会话状态徽章（Flag、New、处理中）
- 系统 SHALL 支持分页加载（初始20条，滚动加载更多）
- 系统 SHALL 在查询时限制结果数量为100条

#### Scenario SM-001.1: 查看会话列表
- WHEN 用户打开应用导航到会话主页
- THEN 系统渲染按日期分组的会话列表
- THEN 会话按最后消息时间降序排列

#### Scenario SM-001.2: 滚动加载更多会话
- WHEN 用户滚动到会话列表底部
- THEN 系统自动加载下一批会话（20条）

#### Scenario SM-001.3: 空状态显示
- WHEN 工作区中没有会话
- THEN 系统显示空状态提示和创建新会话的引导

---

### SM-002: 会话搜索

**Requirement SM-002: 会话搜索**

系统 SHALL 提供会话搜索功能，支持按标题和内容搜索会话。

#### 功能性需求
- 系统 SHALL 提供搜索输入框
- 系统 SHALL 支持同时搜索会话标题和消息内容
- 系统 SHALL 在用户输入2个字符后触发搜索
- 系统 SHALL 使用模糊匹配算法搜索结果
- 系统 SHALL 限制搜索结果为100条
- 系统 SHALL 在搜索时显示"正在加载..."状态
- 系统 SHALL 显示搜索结果数量

#### Scenario SM-002.1: 搜索会话标题
- WHEN 用户在搜索框输入查询（>=2字符）
- THEN 系统搜索匹配的会话标题
- THEN 系统显示搜索结果数量

#### Scenario SM-002.2: 搜索消息内容
- WHEN 用户在搜索框输入查询（>=2字符）
- THEN 系统搜索所有消息内容中匹配的会话
- THEN 显示匹配的会话

#### Scenario SM-002.3: 清除搜索
- WHEN 用户点击搜索框的关闭按钮
- THEN 系统清除搜索查询
- THEN 系统恢复显示会话列表

---

### SM-003: 会话筛选

**Requirement SM-003: 会话筛选**

系统 SHALL 提供多层级的会话筛选功能。

#### 功能性需求
- 系统 SHALL 支持主导航筛选（所有会话、Flagged、特定状态、特定标签、特定视图）
- 系统 SHALL 支持次级状态筛选（通过状态芯片）
- 系统 SHALL 支持次级标签筛选（通过标签芯片）
- 系统 SHALL 支持筛选组合（主筛选 + 次级筛选）
- 系统 SHALL 显示当前筛选结果数量

#### Scenario SM-003.1: 切换主筛选
- WHEN 用户点击左侧导航的筛选项
- THEN 系统更新会话列表以只显示匹配主筛选的会话

#### Scenario SM-003.2: 应用次级状态筛选
- WHEN 用户在筛选栏点击状态芯片（如done）
- THEN 系统在当前主筛选基础上再按状态筛选会话

#### Scenario SM-003.3: 应用次级标签筛选
- WHEN 用户在筛选栏点击标签芯片
- THEN 系统在当前基础筛选上再按标签筛选会话

#### Scenario SM-003.4: 组合筛选
- WHEN 用户同时应用主筛选和次级筛选
- THEN 系统显示同时满足所有筛选条件的会话

---

### SM-004: 会话状态管理

**Requirement SM-004: 会话状态管理**

系统 SHALL 提供多种会话状态管理功能。

#### 功能性需求
- 系统 SHALL 支持 Flag 标记（标记重要会话）
- 系统 SHALL 支持标记已读/未读状态
- 系统 SHALL 支持 Todo 状态（如todo、done、blocked、in-progress）
- 系统 SHALL 支持 Archive（归档）状态
- 系统 SHALL 在列表中显示状态徽章

#### Scenario SM-004.1: Flag/取消 Flag 会话
- WHEN 用户在会话菜单点击 "Flag"
- THEN 会话被标记为 Flag
- WHEN 用户在已 Flag 的会话上点击 "Unflag"
- THEN 会话的 Flag 标记被移除

#### Scenario SM-004.2: 标记已读/未读
- WHEN 用户在会话菜单点击 "Mark as Unread"
- THEN 会话被标记为未读
- THEN 会话显示 New 徽章

#### Scenario SM-004.3: 更改 Todo 状态
- WHEN 用户在会话菜单选择某个 Todo 状态
- THEN 会话的 Todo 状态被更新
- THEN 会话显示对应的状态图标和颜色

#### Scenario SM-004.4: 归档/恢复会话
- WHEN 用户在会话菜单点击 "Archive"
- THEN 会话被归档
- THEN 归档的会话不再在默认列表中显示
- WHEN 用户在已归档的会话上点击 "Unarchive"
- THEN 会话恢复显示在列表中

---

### SM-005: 会话标签管理

**Requirement SM-005: 会话标签管理**

系统 SHALL 支持为会话添加和管理标签。

#### 功能性需求
- 系统 SHALL 支持为会话添加多个标签
- 系统 SHALL 支持层级标签结构
- 系统 SHALL 支持标签值的配置（如priority::3）
- 系统 SHALL 在会话列表显示标签数量徽章
- 系统 SHALL 提供标签切换菜单

#### Scenario SM-005.1: 添加标签到会话
- WHEN 用户在会话菜单选择 "Labels" 并点击某个标签
- THEN 该标签被添加到会话
- THEN 会话显示更新的标签数量

#### Scenario SM-005.2: 移除会话标签
- WHEN 用户在会话菜单中已选中的标签上再次点击
- THEN 该标签从会话中移除

#### Scenario SM-005.3: 导航层级标签
- WHEN 用户在标签子菜单中展开父标签
- THEN 系统显示子标签
- THEN 用户可以切换子标签

---

### SM-006: 会话重命名

**Requirement SM-006: 会话重命名**

系统 SHALL 允许用户重命名会话。

#### 功能性需求
- 系统 SHALL 提供会话重命名对话框
- 系统 SHALL 实时保存会话名称（500ms 防抖）
- 系统 SHALL 在右侧面板也提供名称编辑
- 系统 SHALL 支持会话名称验证

#### Scenario SM-006.1: 通过菜单重命名
- WHEN 用户在会话菜单点击 "Rename"
- THEN 系统显示重命名对话框
- WHEN 用户输入新名称并确认
- THEN 会话名称被更新

#### Scenario SM-006.2: 通过右侧面板重命名
- WHEN 用户在右侧面板的名称输入框中编辑
- THEN 系统在500ms后自动保存新名称

#### Scenario SM-006.3: AI 生成标题
- WHEN 用户在会话菜单点击 "Regenerate Title"
- THEN 系统 AI 基于最近消息生成新标题
- THEN 新标题被应用到会话

---

### SM-007: 会话分享

**Requirement SM-007: 会话分享**

系统 SHALL 支持分享会话为公开链接。

#### 功能性需求
- 系统 SHALL 为会话生成可分享的 URL
- 系统 SHALL 提供复制链接功能
- 系统 SHALL 支持在浏览器中打开分享链接
- 系统 SHALL 支持更新分享（同步最新内容）
- 系统 SHALL 支持停止分享

#### Scenario SM-007.1: 生成分享链接
- WHEN 用户在会话菜单点击 "Share"
- THEN 系统生成分享链接
- THEN 链接被复制到剪贴板
- THEN 系统显示成功提示

#### Scenario SM-007.2: 打开分享链接
- WHEN用户点击分享链接菜单中的 "Open in Browser"
- THEN 系统在默认浏览器中打开该链接

#### Scenario SM-007.3: 更新分享
- WHEN 用户在已分享的会话中点击 "Update Share"
- THEN 系统同步最新内容到分享链接

#### Scenario SM-007.4: 停止分享
- WHEN 用户点击 "Stop Sharing"
- THEN 系统撤销分享链接
- THEN 分享链接不再可访问

---

### SM-008: 会话元数据

**Requirement SM-008: 会话元数据**

系统 SHALL 支持查看和编辑会话元数据。

#### 功能性需求
- 系统 SHALL 显示会话名称
- 系统 SHALL 支持编辑会话备注（Notes）
- 系统 SHALL 自动保存备注（500ms 防抖）
- 系统 SHALL 显示会话创建时间
- 系统 SHALL 显示会话最后更新时间
- 系统 SHALL 显示会话消息数量
- 系统 SHALL 显示令牌使用统计

#### Scenario SM-008.1: 编辑会话备注
- WHEN 用户在右侧面板的备注区域输入内容
- THEN 系统在500ms后自动保存

#### Scenario SM-008.2: 查看令牌统计
- WHEN 用户查看会话元数据面板
- THEN 系统显示输入/输出/总令牌数和成本

---

### SM-009: 会话文件浏览

**Requirement SM-009: 会话文件浏览**

系统 SHALL 支持浏览会话关联的文件。

#### 功能性需求
- 系统 SHALL 显示会话目录中的文件树
- 系统 SHALL 支持文件夹展开/折叠
- 系统 SHALL 显示文件图标（基于类型）
- 系统 SHALL 显示文件大小
- 系统 SHALL 支持点击显示文件
- 系统 SHALL 支持双击打开文件
- 系统 SHALL 支持文件监听（自动刷新）
- 系统 SHALL 持久化文件夹展开状态

#### Scenario SM-009.1: 浏览会话文件
- WHEN 用户在右侧面板打开 Files 区域
- THEN 系统递归显示会话目录结构

#### Scenario SM-009.2: 展开/折叠文件夹
- WHEN 用户点击文件夹
- THEN 文件夹展开显示子内容
- WHEN 用户再次点击
- THEN 文件夹折叠

#### Scenario SM-009.3: 自动刷新文件
- WHEN 外部程序修改会话目录中的文件
- THEN 系统检测到变化并自动刷新文件树

---

### SM-010: 会话删除

**Requirement SM-010: 会话删除**

系统 SHALL 支持删除会话。

#### 功能性需求
- 系统 SHALL 提供"删除"菜单项
- 系统 SHALL 在删除前提示确认
- 系统 SHALL 删除会话及其所有消息
- 系统 SHALL 删除会话文件

#### Scenario SM-010.1: 删除确认
- WHEN 用户在会话菜单点击 "Delete"
- THEN 系统显示删除确认对话框
- WHEN 用户确认删除
- THEN 会话被删除

---

### MODIFIED

（此区块留空，用于标记已修改的需求）

---

### REMOVED

（此区块留空，用于标记已移除的需求）
