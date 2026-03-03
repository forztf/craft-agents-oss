# UI Components Specification

## Purpose
UI 组件模块是 Craft Agents 应用的基础界面组件库，提供可复用的 UI 元素以构建一致的用户界面。该模块包含按钮、输入框、弹出菜单、对话框、图标徽章、头像等常用组件，遵循统一的设计系统和样式规范。所有组件支持主题适配、可访问性和国际化，为应用提供视觉一致和交互一致的体验。

## Requirements

### Requirement: 按钮组件
系统 SHALL 提供标准化的按钮组件，支持多种变体和状态。
> 来源: apps/electron/src/renderer/components/ui/button.tsx

#### Scenario: 基础按钮
- **WHEN** 使用默认按钮
- **THEN** 按钮 SHALL 应用默认样式（正常边框、中等内边距）
- **THEN** 按钮 SHALL 支持悬停和焦点状态

#### Scenario: 按钮变体
- **WHEN** 使用不同的 variant 属性
- **THEN** 'default' 变体 SHALL 使用深色背景和浅色文字
- **THEN** 'secondary' 变体 SHALL 使用半透明背景
- **THEN** 'outline' 变体 SHALL 使用边框样式
- **THEN** 'ghost' 变体 SHALL 无背景，仅悬停时显示

#### Scenario: 按钮尺寸
- **WHEN** 使用不同的 size 属性
- **THEN** 'default' 尺寸 SHALL 使用中等内边距
- **THEN** 'sm' 尺寸 SHALL 使用小内边距
- **THEN** 'lg' 尺寸 SHALL 使用大内边距
- **THEN** 'icon' 尺寸 SHALL 为方形按钮

#### Scenario: 按钮状态
- **WHEN** 按钮被禁用
- **THEN** 按钮 SHALL 应用半透明样式
- **THEN** 按钮 SHALL 禁用所有交互

---

### Requirement: 头部图标按钮
系统 SHALL 提供用于面板头部操作的图标按钮，样式统一。
> 来源: apps/electron/src/renderer/components/ui/HeaderIconButton.tsx

#### Scenario: 显示头部图标按钮
- **WHEN** 组件被渲染
- **THEN** 按钮 SHALL 使用固定大小（28x28px）
- **THEN** 按钮 SHALL 显示居中的图标内容
- **THEN** 按钮 SHALL 使用圆角样式（6px）

#### Scenario: 悬停和活动状态
- **WHEN** 用户悬停按钮
- **THEN** 图标 SHALL 变为前景色
- **THEN** 背景 SHALL 显示为半透明
- **WHEN** 菜单处于打开状态
- **THEN** 按钮 SHALL 显示活动状态样式

#### Scenario: 工具提示
- **WHEN** 提供了 tooltip 属性
- **THEN** 系统 SHALL 在悬停时显示工具提示

---

### Requirement: 顶部栏按钮
系统 SHALL 提供应用顶部栏的按钮样式，用于导航和操作。
> 来源: apps/electron/src/renderer/components/ui/TopBarButton.tsx

#### Scenario: 显示顶部栏按钮
- **WHEN** 组件被渲染
- **THEN** 按钮 SHALL 使用固定大小（28x28px）
- **THEN** 按钮 SHALL 内容垂直和水平居中
- **THEN** 按钮 SHALL 使用圆角样式（6px）

#### Scenario: 活动状态
- **WHEN** isActive 属性为 true
- **THEN** 按钮 SHALL 应用活动背景（前景色 5% 透明度）

#### Scenario: 禁用状态
- **WHEN** 按钮被禁用
- **THEN** 按钮 SHALL 应用 30% 不透明度
- **THEN** 按钮 SHALL 禁用所有鼠标事件

---

### Requirement: 头部菜单
系统 SHALL 提供面板头部的下拉菜单，支持在新窗口打开和学习更多链接。
> 来源: apps/electron/src/renderer/components/ui/HeaderMenu.tsx

#### Scenario: 显示头部菜单
- **WHEN** 组件被渲染
- **THEN** 系统 SHALL 显示"..."图标按钮作为触发器
- **THEN** 系统 SHALL 在点击时显示下拉菜单

#### Scenario: 在新窗口打开
- **WHEN** 用户点击"Open in New Window"菜单项
- **THEN** 系统 SHALL 使用 electronAPI 打开新窗口
- **THEN** 系统 SHALL 使用 focused 模式（隐藏侧边栏）
- **THEN** 路由 SHALL 使用 craftagents:// 协议

#### Scenario: 子菜单项
- **WHEN** 提供了 children 属性
- **THEN** 系统 SHALL 在分隔符上方渲染子菜单项
- **THEN** 子菜单项 SHALL 格式为 StyledDropdownMenuItem

#### Scenario: 学习更多链接
- **WHEN** 提供了 helpFeature 属性
- **THEN** 系统 SHALL 在分隔符下方显示"Learn More"链接
- **THEN** 点击 SHALL 打开对应的文档链接

---

### Requirement: 空状态组件
系统 SHALL 提供标准化的空状态显示组件。
> 来源: apps/electron/src/renderer/components/ui/empty.tsx

#### Scenario: 空状态容器
- **WHEN** Empty 组件被渲染
- **THEN** 系统 SHALL 居中对齐内容
- **THEN** 系统 SHALL 使用弹性布局
- **THEN** 系统 SHALL 应用内边距

#### Scenario: 空状态头部
- **WHEN** EmptyHeader 组件被渲染
- **THEN** 系统 SHALL 限制最大宽度为 sm
- **THEN** 系统 SHALL 居中对齐子元素

#### Scenario: 媒体图标区域
- **WHEN** EmptyMedia 组件被渲染
- **THEN** 系统 SHALL 支持默认和 icon 两种变体
- **THEN** icon 变体 SHALL 调整 SVG 尺寸为 10
- **THEN** icon 变体 SHALL 调整 SVG 描边宽度为 1.5

#### Scenario: 空状态标题
- **WHEN** EmptyTitle 组件被渲染
- **THEN** 系统 SHALL 使用中等字重
- **THEN** 系统 SHALL 使用小字体尺寸

#### Scenario: 空状态描述
- **WHEN** EmptyDescription 组件被渲染
- **THEN** 系统 SHALL 使用次要文字颜色
- **THEN** 系统 SHALL 支持链接样式（加下划线）
- **THEN** 链接悬停 SHALL 使用主色调

#### Scenario: 空状态内容区
- **WHEN** EmptyContent 组件被渲染
- **THEN** 系统 SHALL 使用水平布局
- **THEN** 元素 SHALL 居中对齐
- **THEN** 系统 SHALL 使用中等字体尺寸

---

### Requirement: 头像组件
系统 SHALL 提供头像显示组件，支持图片和文本两种形式。
> 来源: apps/electron/src/renderer/components/ui/avatar.tsx

#### Scenario: 图片头像
- **WHEN** 提供了 src 属性
- **THEN** 系统 SHALL 显示图片头像
- **THEN** 系统 SHALL 使用圆形边框

#### Scenario: 文本头像（fallback）
- **WHEN** 未提供 src 或图片加载失败
- **THEN** 系统 SHALL 显示 fallback 文本（通常为名称首字母）
- **THEN** 系统 SHALL 使用圆形背景和对比色文字

#### Scenario: 加载状态
- **WHEN** 图片正在加载
- **THEN** 系统 SHALL 显示加载指示器或占位符

---

### Requirement: 实体图标
系统 SHALL 提供基于颜色的实体图标组件。
> 来源: apps/electron/src/renderer/components/ui/entity-icon.tsx

#### Scenario: 显示实体图标
- **WHEN** 组件被渲染
- **THEN** 系统 SHALL 根据实体类型显示对应图标
- **THEN** 系统 SHALL 使用实体颜色作为图标颜色

#### Scenario: 裸模式
- **WHEN** bare 属性为 true
- **THEN** 系统 SHALL 不渲染包围容器
- **THEN** 系统 SHALL 仅渲染图标本身

---

### Requirement: 徽章组件
系统 SHALL 提供徽章组件用于显示状态或计数。
> 来源: apps/electron/src/renderer/components/ui/badge.tsx

#### Scenario: 显示徽章
- **WHEN** 组件被渲染
- **THEN** 系统 SHALL 使用小字体尺寸
- **THEN** 系统 SHALL 应用内边距
- **THEN** 系统 SHALL 使用圆角样式

---

### Requirement: 输入组件
系统 SHALL 提供文本输入框组件。
> 来源: apps/electron/src/renderer/components/ui/input.tsx

#### Scenario: 基础输入框
- **WHEN** 组件被渲染
- **THEN** 系统 SHALL 显示标准文本输入框
- **THEN** 系统 SHALL 支持占位符文本

#### Scenario: 禁用状态
- **WHEN** 输入框被禁用
- **THEN** 系统 SHALL 应用禁用样式
- **THEN** 用户 SHALL 无法输入

---

### Requirement: 文本区域组件
系统 SHALL 提供多行文本输入区域。
> 来源: apps/electron/src/renderer/components/ui/textarea.tsx

#### Scenario: 多行文本区域
- **WHEN** 组件被渲染
- **THEN** 系统 SHALL 显示多行输入区域
- **THEN** 系统 SHALL 支持自动调整高度

---

### Requirement: 弹出菜单组件
系统 SHALL 提供触发器和内容分离的弹出菜单。
> 来源: apps/electron/src/renderer/components/ui/popover.tsx

#### Scenario: 显示弹出菜单
- **WHEN** 用户点击触发器
- **THEN** 系统 SHALL 显示弹出内容
- **THEN** 系统 SHALL 在外部点击时关闭

#### Scenario: 控制弹出位置
- **WHEN** 使用不同的 align 和 side 属性
- **THEN** 系统 SHALL 根据 props 调整弹出位置

---

### Requirement: 下拉菜单组件
系统 SHALL 提供下拉菜单组件，支持子菜单。
> 来源: apps/electron/src/renderer/components/ui/dropdown-menu.tsx

#### Scenario: 基础下拉菜单
- **WHEN** 组件被渲染
- **THEN** 系统 SHALL 显示下拉菜单触发器
- **THEN** 系统 SHALL 点击时显示菜单内容

#### Scenario: 子菜单支持
- **WHEN** 菜单项配置了子菜单
- **THEN** 系统 SHALL 显示子菜单指示箭头
- **THEN** 用户 SHALL 可以展开子菜单

---

### Requirement: 样式化下拉菜单
系统 SHALL 提供应用专用的下拉菜单样式。
> 来源: apps/electron/src/renderer/components/ui/styled-dropdown.tsx

#### Scenario: 统一样式
- **WHEN** 使用 StyledDropdownMenuItem
- **THEN** 系统 SHALL 应用统一的菜单项样式
- **THEN** 系统 SHALL 支持悬停和活动状态

#### Scenario: 分隔线
- **WHEN** 使用 StyledDropdownMenuSeparator
- **THEN** 系统 SHALL 显示菜单分隔线

---

### Requirement: 上下文菜单组件
系统 SHALL 提供右键上下文菜单。
> 来源: apps/electron/src/renderer/components/ui/context-menu.tsx

#### Scenario: 显示上下文菜单
- **WHEN** 用户在 ContextMenu 覆盖的元素上右键点击
- **THEN** 系统 SHALL 在鼠标位置显示上下文菜单
- **THEN** 系统 SHALL 点击外部时关闭

---

### Requirement: 样式化上下文菜单
系统 SHALL 提供应用专用的上下文菜单样式。
> 来源: apps/electron/src/renderer/components/ui/styled-context-menu.tsx

#### Scenario: 统一样式
- **WHEN** 使用 StyledContextMenuContent
- **THEN** 系统 SHALL 应用统一的菜单样式
- **THEN** 系统 SHALL 与下拉菜单样式保持一致

---

### Requirement: 对话框组件
系统 SHALL 提供模态对话框组件。
> 来源: apps/electron/src/renderer/components/ui/dialog.tsx

#### Scenario: 显示对话框
- **WHEN** 触发器被激活
- **THEN** 系统 SHALL 显示遮罩层和对话框
- **THEN** 系统 SHALL 允许通过 Escape 键关闭
- **THEN** 系统 SHALL 允许点击遮罩层关闭（默认行为）

#### Scenario: 对话框关闭
- **WHEN** 用户执行关闭操作
- **THEN** 系统 SHALL 执行 onOpenChange 回调
- **THEN** 系统 SHALL 关闭对话框

---

### Requirement: 抽屉组件
系统 SHALL 提供侧边抽屉组件。
> 来源: apps/electron/src/renderer/components/ui/drawer.tsx

#### Scenario: 显示抽屉
- **WHEN** 触发器被激活
- **THEN** 系统 SHALL 从侧面滑出抽屉
- **THEN** 系统 SHALL 使用动画效果

#### Scenario: 关闭抽屉
- **WHEN** 用户执行关闭操作
- **THEN** 系统 SHALL 将抽屉滑出屏幕区域
- **THEN** 系统 SHALL 从 DOM 中移除

---

### Requirement: 选择器组件
系统 SHALL 提供下拉选择器组件。
> 来源: apps/electron/src/renderer/components/ui/select.tsx

#### Scenario: 显示选择器
- **WHEN** 组件被渲染
- **THEN** 系统 SHALL 显示当前选项
- **THEN** 系统 SHALL 点击时显示选项列表

#### Scenario: 选择选项
- **WHEN** 用户选择某个选项
- **THEN** 系统 SHALL 更新当前选项
- **THEN** 系统 SHALL 关闭选项列表

---

### Requirement: 选项卡组件
系统 SHALL 提供选项卡导航组件。
> 来源: apps/electron/src/renderer/components/ui/tabs.tsx

#### Scenario: 选项卡切换
- **WHEN** 用户点击不同的选项卡
- **THEN** 系统 SHALL 激活被点击的选项卡
- **THEN** 系统 SHALL 显示对应的内容面板

#### Scenario: 选项卡样式
- **WHEN** 选项卡被激活
- **THEN** 系统 SHALL 显示活动指示器（底部边框或背景）

---

### Requirement: 开关组件
系统 SHALL 提供切换开关组件。
> 来源: apps/electron/src/renderer/components/ui/switch.tsx

#### Scenario: 切换开关
- **WHEN** 用户点击开关
- **THEN** 系统 SHALL 在开/关状态间切换
- **THEN** 系统 SHALL 执行 onCheckedChange 回调

---

### Requirement: 分隔线组件
系统 SHALL 提供水平或垂直分隔线。
> 来源: apps/electron/src/renderer/components/ui/separator.tsx

#### Scenario: 水平分隔线
- **WHEN** 组件被渲染（默认方向）
- **THEN** 系统 SHALL 显示水平分隔线
- **THEN** 系统 SHALL 使用全宽

#### Scenario: 垂直分隔线
- **WHEN** 方向设置为 vertical
- **THEN** 系统 SHALL 显示垂直分隔线
- **THEN** 系统 SHALL 使用全高

---

### Requirement: 可滚动区域组件
系统 SHALL 提供可滚动内容的容器。
> 来源: apps/electron/src/renderer/components/ui/scroll-area.tsx

#### Scenario: 显示可滚动内容
- **WHEN** 内容超出容器边界
- **THEN** 系统 SHALL 启用滚动
- **THEN** 系统 SHALL 显示自定义滚动指示器（可选）

---

### Requirement: 折叠组件
系统 SHALL 提供可折叠内容功能。
> 来源: apps/electron/src/renderer/components/ui/collapsible.tsx

#### Scenario: 展开/折叠内容
- **WHEN** 用户点击折叠触发器
- **THEN** 系统 SHALL 切换内容的展开/折叠状态
- **THEN** 系统 SHALL 使用动画过渡效果

#### Scenario: 动画折叠内容
- **WHEN** 使用 AnimatedCollapsibleContent
- **THEN** 系统 SHALL 使用高度动画
- **THEN** 系统 SHALL 使用弹性过渡效果

---

### Requirement: 工具提示组件
系统 SHALL 提供悬停提示功能。
> 来源: @craft-agent/ui (导入的组件)

#### Scenario: 显示工具提示
- **WHEN** 用户悬停在触发器元素上
- **THEN** 系统 SHALL 显示工具提示内容
- **THEN** 系统 SHALL 延迟显示以避免意外触发

#### Scenario: 工具提示关闭
- **WHEN** 用户移开鼠标
- **THEN** 系统 SHALL 延迟后隐藏工具提示

---

### Requirement: 键盘快捷键显示组件
系统 SHALL 提供显示键盘快捷键的组件。
> 来源: apps/electron/src/renderer/components/ui/kbd.tsx

#### Scenario: 显示快捷键
- **WHEN** 组件被渲染
- **THEN** 系统 SHALL 显示带样式的快捷键组合
- **THEN** 系统 SHALL 使用等宽字体、边框和阴影

---

### Requirement: 加载指示器组件
系统 SHALL 提供加载状态指示器。
> 来源: @craft-agent/ui (导入的 Spinner 组件)

#### Scenario: 显示加载指示器
- **WHEN** 组件被渲染
- **THEN** 系统 SHALL 显示旋转动画
- **THEN** 系统 SHALL 可配置尺寸

---

### Requirement: 可调整大小的容器
系统 SHALL 提供可调整大小的容器组件。
> 来源: apps/electron/src/renderer/components/ui/resizable.tsx

#### Scenario: 调整大小
- **WHEN** 用户拖动手柄
- **THEN** 系统 SHALL 调整容器尺寸
- **THEN** 系统 SHALL 限制最小和最大尺寸

---

### Requirement: 水平调整手柄
系统 SHALL 提供用于水平调整大小的手柄。
> 来源: apps/electron/src/renderer/components/ui/horizontal-resize-handle.tsx

#### Scenario: 显示水平调整手柄
- **WHEN** 组件被添加到面板分隔处
- **THEN** 系统 SHALL 显示可拖拽的手柄区域
- **THEN** 系统 SHALL 在悬停时显示调整光标

---

### Requirement: 渐变调整手柄
系统 SHALL 提供带渐变的调整手柄视觉效果。
> 来源: apps/electron/src/renderer/components/ui/gradient-resize-handle.tsx

#### Scenario: 显示渐变手柄
- **WHEN** 组件被渲染
- **THEN** 系统 SHALL 显示渐变背景效果
- **THEN** 系统 SHALL 增强调整手柄的可见性

---

### Requirement: 可排序列表
系统 SHALL 提供可拖拽排序的列表组件。
> 来源: apps/electron/src/renderer/components/ui/sortable-list.tsx

#### Scenario: 列表排序
- **WHEN** 用户拖拽项目
- **THEN** 系统 SHALL 显示拖拽覆盖层
- **THEN** 系统 SHALL 重新排列项目顺序
- **THEN** 系统 SHALL 调用 onReorder 回调

---

### Requirement: 表格组件
系统 SHALL 提供表格组件。
> 来源: apps/electron/src/renderer/components/ui/table.tsx

#### Scenario: 显示表格
- **WHEN** 组件被渲染
- **THEN** 系统 SHALL 渲染表头和表体
- **THEN** 系统 SHALL 支持行和单元格样式

---

### Requirement: 数据表格组件
系统 SHALL 提供功能丰富的数据表格。
> 来源: apps/electron/src/renderer/components/ui/data-table.tsx

#### Scenario: 显示数据表格
- **WHEN** 组件被渲染
- **THEN** 系统 SHALL 支持列排序
- **THEN** 系统 SHALL 支持选择行
- **THEN** 系统 SHALL 支持分页

---

### Requirement: 命令面板组件
系统 SHALL 提供命令面板搜索界面。
> 来源: apps/electron/src/renderer/components/ui/command.tsx

#### Scenario: 显示命令面板
- **WHEN** 组件被渲染
- **THEN** 系统 SHALL 显示搜索输入框
- **THEN** 系统 SHALL 显示命令列表
- **THEN** 系统 SHALL 支持键盘导航

---

### Requirement: 标签图标组件
系统 SHALL 提供标签的图标显示。
> 来源: apps/electron/src/renderer/components/ui/label-icon.tsx

#### Scenario: 标签类型图标
- **WHEN** 组件被渲染
- **THEN** 系统 SHALL 根据标签类型显示对应图标
- **THEN** 系统 SHALL 支持标签值类型图标

---

### Requirement: 标签徽章组件
系统 SHALL 提供标签徽章显示。
> 来源: apps/electron/src/renderer/components/ui/label-badge.tsx

#### Scenario: 显示标签徽章
- **WHEN** 组件被渲染
- **THEN** 系统 SHALL 显示标签图标和文本
- **THEN** 系统 SHALL 使用标签颜色

---

### Requirement: 标签徽章行组件
系统 SHALL 提供标签徽章行显示。
> 来源: apps/electron/src/renderer/components/ui/label-badge-row.tsx

#### Scenario: 显示标签徽章行
- **WHEN** 组件被渲染
- **THEN** 系统 SHALL 显示多个标签徽章
- **THEN** 系统 SHALL 在标签数量过多时截断显示

---

### Requirement: 标签菜单组件
系统 SHALL 提供标签选择菜单。
> 来源: apps/electron/src/renderer/components/ui/label-menu.tsx

#### Scenario: 显示标签菜单
- **WHEN** 用户触发标签菜单
- **THEN** 系统 SHALL 显示标签树结构
- **THEN** 系统 SHALL 支持展开/折叠标签组

---

### Requirement: 标签值弹窗组件
系统 SHALL 提供编辑标签值的弹窗。
> 来源: apps/electron/src/renderer/components/ui/label-value-popover.tsx

#### Scenario: 显示标签值弹窗
- **WHEN** 用户点击标签徽章
- **THEN** 系统 SHALL 显示标签值编辑界面
- **THEN** 系统 SHALL 显示当前标签值和可用选项

---

### Requirement: Todo 筛选菜单组件
系统 SHALL 提供 Todo 状态筛选菜单。
> 来源: apps/electron/src/renderer/components/ui/todo-filter-menu.tsx

#### Scenario: 显示状态筛选菜单
- **WHEN** 用户触发状态筛选
- **THEN** 系统 SHALL 显示所有可用的 Todo 状态
- **THEN** 系统 SHALL 显示状态图标和颜色

---

### Requirement: 提及菜单组件
系统 SHALL 提供用户/源/Skill 提及菜单。
> 来源: apps/electron/src/renderer/components/ui/mention-menu.tsx

#### Scenario: 显示提及菜单
- **WHEN** 用户在聊天输入中输入 '@'
- **THEN** 系统 SHALL 显示提及菜单
- **THEN** 系统 SHALL 过滤并在输入时更新匹配项

---

### Requirement: 技能提及菜单组件
系统 SHALL 提供专门的 Skill 提及菜单。
> 来源: apps/electron/src/renderer/components/ui/skill-mention-menu.tsx

#### Scenario: 显示 Skill 提及
- **WHEN** 用户在聊天输入中输入 '@skill'
- **THEN** 系统 SHALL 显示 Skill 列表
- **THEN** 系统 SHALL 显示 Skill 头像和名称

---

### Requirement: 提及徽章组件
系统 SHALL 提供提及标记的徽章显示。
> 来源: apps/electron/src/renderer/components/ui/mention-badge.tsx

#### Scenario: 显示提及徽章
- **WHEN** 组件被渲染
- **THEN** 系统 SHALL 显示实体图标
- **THEN** 系统 SHALL 显示实体名称

---

### Requirement: 斜杠命令菜单组件
系统 SHALL 提供斜杠命令菜单。
> 来源: apps/electron/src/renderer/components/ui/slash-command-menu.tsx

#### Scenario: 显示斜杠命令菜单
- **WHEN** 用户在聊天输入中输入 '/'
- **THEN** 系统 SHALL 显示可用的斜杠命令
- **THEN** 系统 SHALL 显示命令描述

---

### Requirement: 富文本输入组件
系统 SHALL 提供富文本编辑器。
> 来源: apps/electron/src/renderer/components/ui/rich-text-input.tsx

#### Scenario: 输入富文本
- **WHEN** 用户在编辑器中输入
- **THEN** 系统 SHALL 支持文本格式化
- **THEN** 系统 SHALL 支持 Markdown 渲染
- **THEN** 系统 SHALL 支持语法高亮

---

### Requirement: 编辑弹窗组件
系统 SHALL 提供用于编辑设置的弹窗组件。
> 来源: apps/electron/src/renderer/components/ui/EditPopover.tsx

#### Scenario: 传统模式
- **WHEN** 使用传统模式编辑
- **THEN** 系统 SHALL 在新窗口打开聊天会话
- **THEN** 系统 SHALL 用于详细编辑

#### Scenario: 内联模式
- **WHEN** 使用内联模式编辑
- **THEN** 系统 SHALL 在弹窗内渲染 compact ChatDisplay
- **THEN** 系统 SHALL 支持快速的 AI 辅助编辑
- **THEN** 系统 SHALL 使用紧凑的输入占位符（如"Just tell me what to change"）

#### Scenario: 请求会话创建
- **WHEN** 编辑弹窗需要创建聊天会话
- **THEN** 系统 SHALL 创建隐藏会话（hidden: true）
- **THEN** 系统 SHALL 使用工作区的默认配置
- **THEN** 系统 SHALL 将会话 ID 传递给 ChatDisplay

#### Scenario: 显示加载状态
- **WHEN** 编辑正在加载
- **THEN** 系统 SHALL 在内容区域显示 Spinner
- **THEN** 占位符 SHALL 仅在加载时显示

#### Scenario: 上下文配置
- **WHEN** 提供了 editContext 属性
- **THEN** 系统 SHALL 为会话创建提供编辑上下文
- **THEN** 系统 SHALL 传递 filePath（用于 AI 知道编辑位置）
- **THEN** 系统 SHALL 传递 context（提供额外指令）

---

### Requirement: 重命名对话框组件
系统 SHALL 提供重命名对话框。
> 来源: apps/electron/src/renderer/components/ui/rename-dialog.tsx

#### Scenario: 显示重命名对话框
- **WHEN** 组件被渲染
- **THEN** 系统 SHALL 显示当前名称在输入框中
- **THEN** 系统 SHALL 提供确认和取消按钮

#### Scenario: 提交重命名
- **WHEN** 用户点击确认按钮
- **THEN** 系统 SHALL 调用 onSubmit 回调
- **THEN** 系统 SHALL 传递输入的新名称

---

### Requirement: 淡出文本组件
系统 SHALL 提供文本渐变淡出效果。
> 来源: apps/electron/src/renderer/components/ui/fading-text.tsx

#### Scenario: 显示淡出文本
- **WHEN** 文本内容超出容器宽度
- **THEN** 系统 SHALL 在边缘显示渐变淡出效果
- **THEN** 系统 SHALL 保持文本可读性

---

### Requirement: 服务 Logo 组件
系统 SHALL 提供服务 Logo 显示组件。
> 来源: apps/electron/src/renderer/components/ui/service-logo.tsx

#### Scenario: 显示服务 Logo
- **WHEN** 组件被渲染
- **THEN** 系统 SHALL 根据服务类型显示对应的 Logo

---

### Requirement: 源头像组件
系统 SHALL 提供源的头像显示。
> 来源: apps/electron/src/renderer/components/ui/source-avatar.tsx

#### Scenario: 显示源头像
- **WHEN** 组件被渲染
- **THEN** 系统 SHALL 显示源的头像图片
- **THEN** 系统 SHALL 使用源颜色作为边框

---

### Requirement: Skill 头像组件
系统 SHALL 提供 Skill 的头像显示。
> 来源: apps/electron/src/renderer/components/ui/skill-avatar.tsx

#### Scenario: 显示 Skill 头像
- **WHEN** 组件被渲染
- **THEN** 系统 SHALL 显示 Skill 的头像图片
- **THEN** 系统 SHALL 在加载失败时显示 fallback

---

### Requirement: 状态图标组件
系统 SHALL 提供状态图标显示。
> 来源: apps/electron/src/renderer/components/ui/status-icon.tsx

#### Scenario: 显示状态图标
- **WHEN** 组件被渲染
- **THEN** 系统 SHALL 根据状态类型显示对应图标
- **THEN** 系统 SHALL 使用状态对应的颜色

---

### Requirement: 源状态指示器组件
系统 SHALL 提供源连接状态的指示器。
> 来源: apps/electron/src/renderer/components/ui/source-status-indicator.tsx

#### Scenario: 显示源状态
- **WHEN** 源为在线状态
- **THEN** 系统 SHALL 显示绿色指示器
- **WHEN** 源离线
- **THEN** 系统 SHALL 显示灰色或离线指示器
- **WHEN** 源错误
- **THEN** 系统 SHALL 显示红色或错误指示器

---

### Requirement: 窗口头部徽章组件
系统 SHALL 提供窗口头部的徽章显示。
> 来源: apps/electron/src/renderer/components/ui/window-header-badge.tsx

#### Scenario: 显示窗口徽章
- **WHEN** 组件被渲染
- **THEN** 系统 SHALL 显示徽章内容
- **THEN** 系统 SHALL 使用适当的样式

---

### Requirement: 超级思考效果组件
系统 SHALL 提供超级思考模式的视觉效果。
> 来源: apps/electron/src/renderer/components/ui/ultrathink-glow.tsx

#### Scenario: 显示超级思考效果
- **WHEN** ultrathink 模式激活
- **THEN** 系统 SHALL 显示发光效果
- **THEN** 系统 SHALL 在边缘显示渐变

---

### Requirement: Sonner 提示组件
系统 SHALL 提供消息提示功能。
> 来源: apps/electron/src/renderer/components/ui/sonner.tsx

#### Scenario: 显示提示消息
- **WHEN** 调用 toast 方法
- **THEN** 系统 SHALL 在屏幕一角显示提示
- **THEN** 系统 SHALL 自动在几秒后消失

#### Scenario: 提示类型
- **WHEN** 使用不同的 toast 类型
- **THEN** success 类型 SHALL 使用成功样式和图标
- **THEN** error 类型 SHALL 使用错误样式和图标
- **THEN** info 类型 SHALL 使用信息样式和图标

---

### Requirement: 菜单上下文提供者
系统 SHALL 提供菜单上下文以管理菜单状态。
> 来源: apps/electron/src/renderer/components/ui/menu-context.tsx

#### Scenario: 提供菜单上下文
- **WHEN** 组件被渲染
- **THEN** 系统 SHALL 为子菜单提供上下文
- **THEN** 子菜单 SHALL 共享菜单状态

---

### Requirement: 操作菜单项组件
系统 SHALL 提供操作菜单项。
> 来源: apps/electron/src/renderer/components/ui/action-menu-item.tsx

#### Scenario: 显示操作菜单项
- **WHEN** 组件被渲染
- **THEN** 系统 SHALL 显示操作文本和图标
- **THEN** 系统 SHALL 支持键盘快捷键提示

---

### Requirement: 操作工具提示组件
系统 SHALL 提供操作相关的工具提示。
> 来源: apps/electron/src/renderer/components/ui/action-tooltip.tsx

#### Scenario: 显示操作工具提示
- **WHEN** 组件被渲染
- **THEN** 系统 SHALL 显示操作描述

---

### Requirement: 头像组组件
系统 SHALL 提供多个头像的堆叠显示。
> 来源: apps/electron/src/renderer/components/ui/avatar-group.tsx

#### Scenario: 显示头像组
- **WHEN** 组件被渲染
- **THEN** 系统 SHALL 堆叠显示多个头像
- **THEN** 系统 SHALL 在数量过多时显示"+N"

---

### Requirement: 日历组件
系统 SHALL 提供日历选择器。
> 来源: apps/electron/src/renderer/components/ui/calendar.tsx

#### Scenario: 选择日期
- **WHEN** 组件被渲染
- **THEN** 系统 SHALL 显示日历
- **THEN** 用户 SHALL 可以选择日期

---

## ADDED Requirements

### Requirement: 编辑弹窗组件
系统 SHALL 提供使用 AI 辅助快速编辑设置的弹窗界面。
> 来源: apps/electron/src/renderer/components/ui/EditPopover.tsx

#### Scenario: 传统编辑模式
- **WHEN** editMode 被设置为 'legacy'
- **THEN** 系统 SHALL 在新窗口打开聊天会话进行编辑
- **THEN** 系统 SHALL 提供完整的聊天界面进行详细编辑
- **THEN** 系统 SHALL 创建专用的编辑会话

#### Scenario: 内联编辑模式
- **WHEN** editMode 被设置为 'inline'
- **THEN** 系统 SHALL 在弹窗内使用 compact ChatDisplay 执行 AI 编辑
- **THEN** 系统 SHALL 使用紧凑的输入占位符（如"Just tell me what to change"）
- **THEN** 系统 SHALL 收到回复后自动关闭弹窗
- **THEN** 系统 SHALL 执行 onReplySuccess? 回调处理返回的命令

#### Scenario: 内联模式下占位符循环
- **WHEN** 在 compact 模式下且输入为空
- **THEN** 系统 SHALL 在输入框显示循环的占位符文本
- **THEN** 占位符 SHALL 包含"Just tell me what to change"、"Describe the update"、"What should I modify?"

#### Scenario: 创建隐藏编辑会话
- **WHEN** 编辑弹窗打开但未创建会话
- **THEN** 系统 SHALL 调用 createSession
- **THEN** 系统 SHALL 传递 hidden: true（不会显示在会话列表）
- **THEN** 系统 SHALL 使用工作区的默认配置创建会话
- **THEN** 系统 SHALL 将会话 ID 设置到 sessionAtom 中

#### Scenario: 请求回复成功处理
- **WHEN** ChatDisplay 收到命令式回复且为 compact 模式
- **THEN** 系统 SHALL 处理工具使用命令
- **THEN** 系统 SHALL 关闭弹窗（handleClose）
- **THEN** 系统 SHALL 调用 onReplySuccess?.(reply) 回调

#### Scenario: AI 知晓编辑上下文
- **WHEN** 提供了 editContext 属性
- **THEN** 系统 SHALL 在会话创建时传递 context 到初始提示中
- **THEN** AI SHALL 知晓正在编辑的文件路径（filePath）
- **THEN** AI SHALL 知晓额外指令（context）

#### Scenario: 加载状态显示
- **WHEN** 编辑弹窗正在加载（isLoading 为 true）
- **THEN** 系统 SHALL 在内容区域显示 Spinner 加载指示器
- **THEN** 占位符组件 SHALL 仅在加载时显示（isLoading && !session）

#### Scenario: 紧凑模式特殊布局
- **WHEN** compactMode 为 true（内联模式）
- **THEN** 系统 SHALL 隐藏输入区域的边框（InputContainer 的 border 变为 hidden）
- **THEN** 系统 SHALL 根据是否有消息隐藏/显示输入区域
- **THEN** PopoverContent SHALL 使用无阴影的白色背景（background）

#### Scenario: 聚焦和 Escape 处理
- **WHEN** 弹窗打开且用户按 Escape 且不是在聊天输入时
- **THEN** 系统 SHALL 关闭弹窗
- **WHEN** 弹窗打开且 AI 正在生成响应时
- **THEN** 系统 SHALL 应用于 EscapeInterruptProvider 的覆盖层处理中断

#### Scenario: 自动关闭对话框
- **WHEN** 弹窗打开且 autoCloseDialog 为 true
- **THEN** 系统 SHALL 不会渲染 Dialog 组件背景，仅作为嵌入上下文使用

---

## MODIFIED Requirements

初版整理，暂无。

## REMOVED Requirements

初版整理，暂无。
