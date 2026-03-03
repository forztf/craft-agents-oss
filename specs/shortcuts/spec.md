# OpenSpec Requirement Specification: Shortcuts / Actions Module

## ADDED Requirements

### Requirement: 快捷键注册机制

**Requirement: 快捷键注册机制**

系统 SHALL 提供统一的快捷键注册机制，允许组件将其操作处理器注册到中央注册表。

**子系统 SHALL:**
- 接受操作ID（`ActionId`）、处理器函数和可选启用条件作为注册参数
- 维护操作ID到处理器列表的映射关系
- 为每个注册返回清理函数，在组件卸载时自动注销处理器

**系统 SHALL:**
- 支持同一操作ID注册多个处理器
- 按注册顺序执行处理器，找到第一个启用的处理器后终止

**系统 SHALL NOT:**
- 允许注册空操作ID或空处理器函数

#### Scenario: 组件注册快捷键处理器
- **WHEN** 组件调用 `useAction('app.newChat', handler, options)`
  - **THEN** 系统将处理器注册到中央注册表
  - **THEN** 返回清理函数供组件卸载时调用

#### Scenario: 多处理器优先级
- **WHEN** 同一操作ID注册了多个处理器
  - **WHEN** 第一个处理器未启用（enabled 返回 false）
    - **THEN** 系统尝试执行下一个启用的处理器
    - **THEN** 找到第一个启用的处理器后终止执行

> 来源: `apps/electron/src/renderer/actions/registry.tsx`, `apps/electron/src/renderer/actions/useAction.ts`, `apps/electron/src/renderer/actions/types.ts`

---

### Requirement: 跨平台快捷键处理

**Requirement: 跨平台快捷键处理**

系统 SHALL 根据用户操作系统平台自动适配快捷键键位映射和显示符号。

**子系统 SHALL:**
- 检测当前平台类型（`isMac`）
- 将通用修饰键 `mod` 映射为平台特定键位（macOS: ⌘/Cmd，Windows/Linux: Ctrl）
- 将快捷键格式化为平台特定的显示字符串

**系统 SHALL:**
- 支持以下修饰键映射：
  - `mod` → macOS: ⌘，Windows: Ctrl
  - `shift` → macOS: ⇧，Windows: Shift
  - `alt` → macOS: ⌥，Windows: Alt
- 支持特殊键位：
  - `[`、`]`、`,`、`.`、`←`、`→`、`↑`、`↓`
  - `Escape` / `Esc`、`Tab`

#### Scenario: macOS 快捷键显示
- **WHEN** 在 macOS 系统上显示 `mod+n` 快捷键
  - **THEN** 系统显示为 `⌘N`

#### Scenario: Windows 快捷键显示
- **WHEN** 在 Windows 系统上显示 `mod+shift+n` 快捷键
  - **THEN** 系统显示为 `Ctrl+Shift+N`

> 来源: `apps/electron/src/renderer/actions/registry.tsx`, `apps/electron/lib/platform.ts`

---

### Requirement: 全局键盘事件捕获

**Requirement: 全局键盘事件捕获**

系统 SHALL 在捕获阶段监听全局键盘事件，确保快捷键事件不会被其他事件处理器拦截。

**子系统 SHALL:**
- 在 `window` 对象的 `keydown` 事件上注册捕获阶段监听器
- 对每个键盘事件检查所有已注册操作的快捷键匹配

**系统 SHALL:**
- 匹配快捷键时执行以下检查：
  - 检查当前焦点元素是否为输入元素（INPUT/TEXTAREA 或 contentEditable）
  - 检查输入元素中的文本选择状态
  - 检查操作是否标记为 `inputSafe`
  - 匹配修饰键和主键的组合
- 匹配成功时阻止默认事件和冒泡

#### Scenario: 非输入元素中的快捷键触发
- **WHEN** 用户在聊天显示区域按下 `mod+n`
  - **WHEN** 聊天显示区域不是输入元素
  - **WHEN** `app.newChat` 操作已注册
    - **THEN** 系统触发 `app.newChat` 处理器
    - **THEN** 阻止默认浏览器行为

#### Scenario: 输入元素中的非 inputSafe 快捷键
- **WHEN** 用户在文本输入框中按下 `mod+n`
  - **WHEN** `app.newChat` 操作未标记为 `inputSafe`
    - **THEN** 系统忽略该快捷键
    - **THEN** 允许默认浏览器行为

> 来源: `apps/electron/src/renderer/actions/registry.tsx`

---

### Requirement: 输入安全模式

**Requirement: 输入安全模式**

系统 SHALL 支持 `inputSafe` 标记，允许特定快捷键在用户输入文本时仍能触发。

**子系统 SHALL:**
- 在操作定义中提供 `inputSafe` 布尔属性
- 在快捷键匹配时检查 `inputSafe` 属性

**系统 SHALL:**
- 对于 `inputSafe` 的 Escape 快捷键：
  - 尊重浏览器的文本选择清除行为
  - 在文本选择存在时不触发操作
- 对于其他 `inputSafe` 快捷键：
  - 直接触发操作处理器
  - 阻止默认浏览器行为

#### Scenario: Escape 停止处理
- **WHEN** 用户在聊天输入框中选中文本
  - **WHEN** 按下 Escape 键
    - **THEN** 系统清除文本选择
    - **THEN** 不触发 `chat.stopProcessing` 操作
- **WHEN** 用户第二次按下 Escape 键
  - **WHEN** 没有文本选择存在
    - **THEN** 系统触发 `chat.stopProcessing` 操作

#### Scenario: Tab 切换权限模式
- **WHEN** 用户在聊天输入框中键入时按下 `Shift+Tab`
  - **WHEN** `chat.cyclePermissionMode` 操作标记为 `inputSafe`
    - **THEN** 系统触发权限模式切换
    - **THEN** 不阻止输入框内的 Tab 行为

> 来源: `apps/electron/src/renderer/actions/registry.tsx`, `apps/electron/src/renderer/actions/definitions.ts`, `apps/electron/src/renderer/actions/types.ts`

---

### Requirement: 操作启用条件

**Requirement: 操作启用条件**

系统 SHALL 允许为每个操作处理器指定动态启用条件。

**子系统 SHALL:**
- 接受 `enabled()` 函数作为可选参数
- 在匹配快捷键后调用 `enabled()` 函数检查是否启用

**系统 SHALL:**
- 仅执行已启用的处理器
- 当处理器未启用时尝试执行下一个处理器（如果有）

#### Scenario: 区域性快捷键
- **WHEN** 会话列表组件注册 `sessionList.selectAll` 操作
  - **WHEN** 启用条件检查焦点是否在会话列表区域
  - **WHEN** 用户焦点不在会话列表时按下 `mod+a`
    - **THEN** 系统不触发该操作处理器
    - **THEN** 尝试查找其他启用的处理器

> 来源: `apps/electron/src/renderer/actions/useAction.ts`, `apps/electron/src/renderer/actions/types.ts`

---

### Requirement: 用户快捷键覆盖

**Requirement: 用户快捷键覆盖**

系统 SHALL 支持用户自定义快捷键覆盖默认快捷键（架构预留）。

**子系统 SHALL:**
- 在注册表中维护 `userOverrides` 映射
- 在获取快捷键时优先检查用户覆盖

**系统 SHALL:**
- 允许用户将快捷键设置为 `null` 以禁用操作
- 允许用户将快捷键设置为自定义组合键

#### Scenario: 用户自定义快捷键
- **WHEN** 用户将 `app.newChat` 的快捷键从 `mod+n` 改为 `mod+shift+n`
  - **WHEN** 系统存储用户覆盖
    - **THEN** 用户按下 `mod+shift+n` 时触发 `app.newChat`
    - **THEN** 原 `mod+n` 快捷键不再绑定该操作

#### Scenario: 禁用快捷键
- **WHEN** 用户将键盘快捷键对话框的快捷键设置为 `null`
  - **THEN** `app.keyboardShortcuts` 操作不再响应任何快捷键
  - **THEN** 用户只能通过菜单或其他方式打开对话框

> 来源: `apps/electron/src/renderer/actions/registry.tsx`, `apps/electron/src/renderer/actions/types.ts`

---

### Requirement: 快捷键显示

**Requirement: 快捷键显示**

系统 SHALL 提供格式化的快捷键显示字符串，用于 UI 元素中的快捷键提示。

**子系统 SHALL:**
- 提供 `getHotkeyDisplay(actionId)` 函数
- 根据 `userOverrides` 和 `defaultHotkey` 计算实际快捷键
- 格式化为平台特定的显示字符串

**系统 SHALL:**
- Mac 平台使用连接符号格式（如 `⌘⇧N`）
- Windows/Linux 使用加号分隔格式（如 `Ctrl+Shift+N`）

#### Scenario: 工具提示中的快捷键
- **WHEN** 组件调用 `useHotkeyLabel('app.newChat')`
  - **THEN** 系统返回平台特定的快捷键字符串
  - **THEN** Mac 返回 `⌘N`
  - **THEN** Windows 返回 `Ctrl+N`

> 来源: `apps/electron/src/renderer/actions/registry.tsx`, `apps/electron/src/renderer/actions/useHotkeyLabel.ts`

---

### Requirement: 国际化标签

**Requirement: 国际化标签**

系统 SHALL 支持操作标签和描述的国际化。

**子系统 SHALL:**
- 提供使用 i18n 的标签 getter 函数
- 使用 `actions/definitions` 命名空间翻译标签和描述

**系统 SHALL:**
- 返回当前语言环境下的翻译文本
- 提供标签、描述和快捷键显示信息

#### Scenario: 中英文标签显示
- **WHEN** 当前语言为 `zh-CN`
  - **THEN** 操作标签显示为中文翻译（如"新建聊天"）
  - **THEN** 描述显示为中文翻译
- **WHEN** 当前语言为 `en`
  - **THEN** 操作标签显示为英文原文（如"New Chat"）
  - **THEN** 描述显示为英文原文

> 来源: `apps/electron/src/renderer/actions/useHotkeyLabel.ts`, `apps/electron/src/contexts/I18nContext.tsx`

---

### Requirement: 键盘快捷键对话框

**Requirement: 键盘快捷键对话框**

系统 SHALL 提供键盘快捷键参考对话框，按分类显示所有已注册的操作快捷键。

**子系统 SHALL:**
- 使用模态对话框组件显示快捷键列表
- 按操作分类分组显示（General、Navigation、View、Session List、Chat）
- 显示操作标签和对应的快捷键组合

**系统 SHALL:**
- 格式化快捷键显示为键盘按键样式（kbd 标签）
- 在 macOS 上使用符号连接格式
- 在 Windows/Linux 上使用加号分隔格式
- 支持对话框通过快捷键（如 `CMD+W`）关闭

#### Scenario: 打开快捷键对话框
- **WHEN** 用户按下 `mod+/` 快捷键
  - **OR** 用户从菜单选择"键盘快捷键"选项
    - **THEN** 系统打开快捷键对话框
    - **THEN** 按分类显示所有快捷键
    - **THEN** 显示操作标签和对应的快捷键组合

#### Scenario: 阅读快捷键列表
- **WHEN** 用户浏览快捷键对话框
  - **THEN** 对话框按分类组织内容
  - **THEN** 每个分类显示分类标题
  - **THEN** 每个操作占一行，左侧显示标签，右侧显示快捷键
  - **THEN** 快捷键使用键盘按键样式显示

> 来源: `apps/electron/src/renderer/components/KeyboardShortcutsDialog.tsx`, `apps/electron/src/renderer/actions/definitions.ts`

---

### Requirement: 快捷键设置页面

**Requirement: 快捷键设置页面**

系统 SHALL 提供快捷键设置页面，作为查看快捷键参考的主要入口。

**子系统 SHALL:**
- 显示与对话框相同的快捷键内容
- 使用页面导航结构而非模态对话框
- 支持页面内滚动浏览所有快捷键

**系统 SHALL:**
- 提供搜索功能筛选快捷键（可选）
- 保持与快捷键对话框同步的内容更新

#### Scenario: 通过设置页面查看快捷键
- **WHEN** 用户导航到设置页面的"快捷键"选项
  - **THEN** 系统显示快捷键列表页面
  - **THEN** 用户可以滚动浏览所有快捷键
  - **THEN** 快捷键显示格式与对话框一致

> 来源: `apps/electron/src/renderer/pages/ShortcutsPage.tsx`, `apps/electron/src/renderer/pages/settings/ShortcutsPage.tsx`

---

### Requirement: 组件特定快捷键

**Requirement: 组件特定快捷键**

系统 SHALL 在快捷键参考中显示组件级别的快捷键，这些快捷键不是全局操作。

**子系统 SHALL:**
- 在快捷键对话框和设置页面中显示组件特定快捷键
- 分类显示：List Navigation（列表导航）、Session List（会话列表）、Agent Tree（代理树）、Chat Input（聊天输入）

**系统 SHALL:**
- 支持这些快捷键的国际化显示
- 使用与全局操作一致的显示格式

#### Scenario: 会话列表快捷键
- **WHEN** 用户查看会话列表分类的快捷键
  - **THEN** 系统显示以下快捷键：
    - `Enter`: 聚焦聊天输入
    - `Right-click`: 打开上下文菜单
    - （可选：`Delete`: 删除会话，`R`: 重命名会话）

> 来源: `apps/electron/src/renderer/components/KeyboardShortcutsDialog.tsx`, `apps/electron/src/renderer/pages/ShortcutsPage.tsx`

---

### Requirement: 通用操作

**Requirement: 通用操作**

系统 SHALL 定义以下通用操作：

| 操作ID | 标签 | 快捷键 | 描述 |
|--------|------|--------|------|
| `app.newChat` | New Chat | `mod+n` | Create a new chat session |
| `app.settings` | Settings | `mod+,` | Open application settings |
| `app.toggleTheme` | Toggle Theme | `mod+shift+a` | Switch between light and dark mode |
| `app.search` | Search | `mod+f` | Open search panel |
| `app.keyboardShortcuts` | Keyboard Shortcuts | `mod+/` | Show keyboard shortcuts reference |
| `app.newWindow` | New Window | `mod+shift+n` | Open a new window |
| `app.quit` | Quit | `mod+q` | Quit the application |

**系统 SHALL:**
- 为每个操作提供可翻译的标签和描述
- 设置默认快捷键
- 分配到 `General` 分类

> 来源: `apps/electron/src/renderer/actions/definitions.ts`

---

### Requirement: 导航操作

**Requirement: 导航操作**

系统 SHALL 定义以下导航操作：

| 操作ID | 标签 | 快捷键 | 描述 |
|--------|------|--------|------|
| `nav.focusSidebar` | Focus Sidebar | `mod+1` | 聚焦侧边栏 |
| `nav.focusSessionList` | Focus Session List | `mod+2` | 聚焦会话列表 |
| `nav.focusChat` | Focus Chat | `mod+3` | 聚焦聊天区域 |
| `nav.nextZone` | Focus Next Zone | `Tab` | 聚焦下一区域 |
| `nav.goBack` | Go Back | `mod+[` | Navigate to previous session |
| `nav.goForward` | Go Forward | `mod+]` | Navigate to next session |
| `nav.goBackAlt` | Go Back | `mod+left` | Navigate to previous session (arrow key) |
| `nav.goForwardAlt` | Go Forward | `mod+right` | Navigate to next session (arrow key) |

**系统 SHALL:**
- 分配所有导航操作到 `Navigation` 分类
- 支持多种导航方式（括号键、方向键）

> 来源: `apps/electron/src/renderer/actions/definitions.ts`

---

### Requirement: 视图操作

**Requirement: 视图操作**

系统 SHALL 定义以下视图操作：

| 操作ID | 标签 | 快捷键 | 描述 |
|--------|------|--------|------|
| `view.toggleSidebar` | Toggle Sidebar | `mod+b` | 切换侧边栏显示/隐藏 |
| `view.toggleFocusMode` | Toggle Focus Mode | `mod+.` | 隐藏两个侧边栏以进行无干扰工作 |

**系统 SHALL:**
- 分配所有视图操作到 `View` 分类
- `toggleFocusMode` 提供描述说明功能

> 来源: `apps/electron/src/renderer/actions/definitions.ts`

---

### Requirement: 会话列表操作

**Requirement: 会话列表操作**

系统 SHALL 定义以下会话列表操作：

| 操作ID | 标签 | 快捷键 | 作用域 | inputSafe |
|--------|------|--------|--------|-----------|
| `sessionList.selectAll` | Select All Sessions | `mod+a` | `session-list` | false |
| `sessionList.clearSelection` | Clear Selection | `Escape` | `session-list` | true |

**系统 SHALL:**
- 分配所有会话列表操作到 `Session List` 分类
- 设置 `session-list` 作用域
- `clearSelection` 标记为 `inputSafe`

> 来源: `apps/electron/src/renderer/actions/definitions.ts`, `apps/electron/src/renderer/actions/types.ts`

---

### Requirement: 聊天操作

**Requirement: 聊天操作**

系统 SHALL 定义以下聊天操作：

| 操作ID | 标签 | 快捷键 | 作用域 | inputSafe |
|--------|------|--------|--------|-----------|
| `chat.stopProcessing` | Stop Processing | `Escape` | `chat` | true |
| `chat.cyclePermissionMode` | Cycle Permission Mode | `shift+tab` | `chat` | false |
| `chat.nextSearchMatch` | Next Search Match | `mod+g` | `chat` | true |
| `chat.prevSearchMatch` | Previous Search Match | `mod+shift+g` | `chat` | true |

**系统 SHALL:**
- 分配所有聊天操作到 `Chat` 分类
- 设置 `chat` 作用域
- `stopProcessing`、`nextSearchMatch`、`prevSearchMatch` 标记为 `inputSafe`
- `stopProcessing` 提供描述说明需要双按触发

> 来源: `apps/electron/src/renderer/actions/definitions.ts`, `apps/electron/src/renderer/actions/types.ts`

---

### Requirement: TypeScript 类型安全

**Requirement: TypeScript 类型安全**

系统 SHALL 使用 TypeScript 提供完整的类型安全。

**子系统 SHALL:**
- 定义 `ActionDefinition` 接口包含所有操作属性
- 定义 `ActionScope` 类型作为作用域联合类型
- 定义 `ActionHandler` 接口包含处理器和启用条件
- 从操作定义衍生类型安全的 `ActionId` 类型

**系统 SHALL:**
- 确保所有快捷键字符串都符合预期格式
- 防止拼写错误的操作ID

> 来源: `apps/electron/src/renderer/actions/types.ts`, `apps/electron/src/renderer/actions/definitions.ts`

---

### Requirement: React Hook 集成

**Requirement: React Hook 集成**

系统 SHALL 提供 React Hook 以简化组件中的快捷键管理。

**子系统 SHALL:**
- 提供 `useAction` hook 用于注册操作处理器
- 提供 `useActionRegistry` hook 用于访问注册表
- 提供 `useHotkeyLabel` hook 获取快捷键显示字符串
- 提供 `useActionLabel` hook 获取操作完整信息

**系统 SHALL:**
- 支持依赖数组参数以响应状态变化
- 确保处理器引用在组件重新渲染时保持最新

> 来源: `apps/electron/src/renderer/actions/useAction.ts`, `apps/electron/src/renderer/actions/useHotkeyLabel.ts`, `apps/electron/src/renderer/actions/registry.tsx`

---

### Requirement: 事件捕获性能

**Requirement: 事件捕获性能**

系统 SHALL 优化键盘事件处理的性能。

**系统 SHALL:**
- 使用高效的快捷键匹配算法
- 优先检查 `inputSafe` 和焦点元素以快速跳过不相关事件
- 避免在键盘事件处理中执行耗时操作

> 来源: `apps/electron/src/renderer/actions/registry.tsx`

---

### Requirement: 响应性

**Requirement: 响应性**

系统 SHALL 确保快捷键响应时间小于 50ms。

#### Scenario: 快捷键响应
- **WHEN** 用户按下已注册快捷键
  - **THEN** 系统在 50ms 内触发对应操作

> 来源: `apps/electron/src/renderer/actions/registry.tsx`

---

### Requirement: 可靠性

**Requirement: 可靠性**

系统 SHALL 确保快捷键处理的可靠性。

**系统 SHALL:**
- 正确处理操作处理器卸载
- 清理不再需要的键盘事件监听器
- 避免内存泄漏

#### Scenario: 组件卸载
- **WHEN** 注册快捷键的组件被卸载
  - **THEN** 系统自动清理对应的处理器
  - **THEN** 移除键盘事件监听器

> 来源: `apps/electron/src/renderer/actions/registry.tsx`, `apps/electron/src/renderer/actions/useAction.ts`

---

### Requirement: 可维护性

**Requirement: 可维护性**

系统 SHALL 提供易于维护的操作定义结构。

**系统 SHALL:**
- 在 `actions/definitions.ts` 中集中定义所有操作
- 提供按分类分组操作的工具函数
- 提供获取操作列表和分类映射的工具函数

#### Scenario: 添加新操作
- **WHEN** 开发者需要添加新操作
  - **THEN** 在 `actions/definitions.ts` 中添加操作定义
  - **THEN** 使用 `useAction` hook 注册处理器
  - **THEN** 无需修改其他快捷键处理代码

> 来源: `apps/electron/src/renderer/actions/definitions.ts`, `apps/electron/src/renderer/actions/useAction.ts`

---

### Requirement: 快捷键冲突

**Requirement: 快捷键冲突**

系统 SHALL 处理多个操作使用相同快捷键的情况。

**系统 SHALL:**
- 按定义顺序或注册顺序执行操作
- 找到第一个启用的处理器后停止
- 允许同一快捷键在不同作用域中有不同行为（通过 `enabled` 条件）

> 来源: `apps/electron/src/renderer/actions/registry.tsx`, `apps/electron/src/renderer/actions/useAction.ts`

---

### Requirement: 浏览器快捷键冲突

**Requirement: 浏览器快捷键冲突**

系统 SHALL 谨慎处理与浏览器原生快捷键的冲突。

**系统 SHALL:**
- 优先保留关键浏览器快捷键（如 `mod+C`、`mod+V`）
- 在必要时阻止浏览器默认行为
- 在输入控件中优先保留文本编辑快捷键

> 来源: `apps/electron/src/renderer/actions/registry.tsx`

---

### Requirement: 快捷键功能测试

**Requirement: 快捷键功能测试**

系统 SHALL 通过自动化测试验证快捷键功能。

**测试 SHALL 包括:**
- 快捷键注册和注销
- 跨平台快捷键映射
- 输入安全模式
- 启用条件检查
- 用户快捷键覆盖

> 来源: `apps/electron/src/renderer/actions/`, 测试目录 (待实现)

---

### Requirement: 键盘事件模拟测试

**Requirement: 键盘事件模拟测试**

系统 SHALL 支持通过模拟键盘事件进行自动化测试。

**测试 SHALL 包括:**
- 模拟按键组合（修饰键 + 主键）
- 验证事件是否被正确拦截
- 验证处理器是否被正确调用

> 来源: `apps/electron/src/renderer/actions/`, 测试目录 (待实现)

---

### Requirement: 注册错误处理

**Requirement: 注册错误处理**

系统 SHALL 提供清晰的错误信息以帮助调试注册问题。

**系统 SHALL:**
- 在注册空操作ID或空处理器时抛出错误
- 在使用未注册的操作ID时提供类型检查错误

> 来源: `apps/electron/src/renderer/actions/useAction.ts`, `apps/electron/src/renderer/actions/registry.tsx`

---

### Requirement: Tab 键区域导航

**Requirement: Tab 键区域导航**

系统 SHALL 支持 Tab 键在不同焦点区域之间进行导航。

**子系统 SHALL:**
- 定义 `nav.nextZone` 操作使用 Tab 键作为默认快捷键
- 支持焦点在会话列表、聊天区域等不同区域间切换

> 来源: `apps/electron/src/renderer/actions/definitions.ts:78-83`

---

### Requirement: 焦点区域顺序定义

**Requirement: 焦点区域顺序定义**

系统 SHALL 为焦点区域定义固定的导航顺序。

**子系统 SHALL:**
- 定义 `FocusZoneId` 类型包含 'sidebar'、'session-list'、'chat'
- 定义区域导航顺序：sidebar → session-list → chat
- 支持 Tab 前进、Shift+Tab 后退

**系统 SHALL:**
- 在循环导航中超出末尾时回到开头
- 在后退导航中超出开头时回到末尾

#### Scenario: Tab 前进导航
- **WHEN** 用户按下 Tab 键
  - **WHEN** 当前焦点在侧边栏
    - **THEN** 焦点转移到会话列表

#### Scenario: Shift+Tab 后退导航
- **WHEN** 用户按下 Shift+Tab 键
  - **WHEN** 当前焦点在会话列表
    - **THEN** 焦点转移到侧边栏

> 来源: `apps/electron/src/renderer/context/FocusContext.tsx:7, 28, 112-124`

---

### Requirement: 焦点意图跟踪

**Requirement: 焦点意图跟踪**

系统 SHALL 跟踪焦点变化的原因，允许组件做出适当的响应。

**子系统 SHALL:**
- 定义三种焦点意图类型：`keyboard`、`click`、`programmatic`
- 在焦点状态中记录当前意图和是否应移动 DOM 焦点

**系统 SHALL:**
- keyboard 导航（如 Cmd+1/2/3、Tab）默认移动 DOM 焦点
- click 导航默认不移动 DOM 焦点
- programmatic 导航默认移动 DOM 焦点
- 允许通过选项覆盖默认行为

#### Scenario: 键盘导航意图
- **WHEN** 用户按下 Cmd+1 聚焦侧边栏
  - **THEN** 焦点意图设置为 'keyboard'
  - **THEN** `shouldMoveDOMFocus` 设置为 true

#### Scenario: 点击导航意图
- **WHEN** 用户点击某区域进行选择
  - **THEN** 焦点意图设置为 'click'
  - **THEN** `shouldMoveDOMFocus` 设置为 false

> 来源: `apps/electron/src/renderer/context/FocusContext.tsx:16, 38-43, 82-110`

---

### Requirement: 特殊按键映射

**Requirement: 特殊按键映射**

系统 SHALL 支持特殊按键的正确映射和识别。

**子系统 SHALL:**
- 支持符号按键：`[`、`]`、`,`、`.`
- 支持箭头键：`left`、`right`、`up`、`down`
- 支持 Escape 和 Tab 键映射为代码 `Escape`、`Tab`
- 将按键名称映射到 `KeyboardEvent.code` 值

**系统 SHALL:**
- 优先使用 `code` 匹配（如 `BracketLeft`）而非 `key` 匹配（如 `[`）
- 确保跨平台按键行为一致

> 来源: `apps/electron/src/renderer/actions/registry.tsx:179-194`

---

### Requirement: 按键样式显示

**Requirement: 按键样式显示**

系统 SHALL 为快捷键提供一致的按键样式显示。

**子系统 SHALL:**
- 提供 `Kbd` 组件用于渲染单键显示
- 应用统一的样式（圆角、边框、阴影、内边距）
- 设置最小宽度和固定高度

**系统 SHALL:**
- 对快捷键组合进行智能分割
- 显示符合按键物理外观的样式

> 来源: `apps/electron/src/renderer/components/KeyboardShortcutsDialog.tsx:64-70`, `apps/electron/src/renderer/pages/settings/ShortcutsPage.tsx:59-65`

---

### Requirement: macOS 快捷键智能分割

**Requirement: macOS 快捷键智能分割**

系统 SHALL 在 macOS 上对连接符号的快捷键进行智能分割。

**系统 SHALL:**
- 使用正则表达式 `/[⌘⇧⌥←→]|Tab|Esc|./g` 匹配完整的修饰符组合
- 将 `⌘N` 分割为 `['⌘', 'N']` 两个按键
- 在 Windows/Linux 上使用 `+` 分割快捷键字符串

#### Scenario: macOS 快捷键显示分割
- **WHEN** 显示快捷键 `⌘⇧N`
  - **THEN** 系统分割为三个按键元素：`⌘`、`⇧`、`N`
  - **THEN** 每个按键应用 Kbd 样式

> 来源: `apps/electron/src/renderer/components/KeyboardShortcutsDialog.tsx:83-85`, `apps/electron/src/renderer/pages/settings/ShortcutsPage.tsx:78-80`

---

### Requirement: 对话框快捷键关闭

**Requirement: 对话框快捷键关闭**

系统 SHALL 支持通过快捷键关闭快捷键对话框。

**子系统 SHALL:**
- 对话框注册到模态上下文（`ModalContext`）
- 支持 `Cmd+W`（macOS）或类似快捷键关闭对话框

**系统 SHALL:**
- 确保快捷键对话框优先处理关闭快捷键
- 防止关闭快捷键传播到父组件

> 来源: `apps/electron/src/renderer/components/KeyboardShortcutsDialog.tsx:146`

---

### Requirement: 焦点区域标识符

**Requirement: 焦点区域标识符**

系统 SHALL 为焦点区域提供类型安全的标识符。

**子系统 SHALL:**
- 定义 `FocusZoneId` 类型为联合类型：`'sidebar' | 'session-list' | 'chat'`
- 确保 TypeScript 类型检查正确
- 防止拼写错误的区域 ID

> 来源: `apps/electron/src/renderer/context/FocusContext.tsx:7`

---

### Requirement: 焦点区域注册生命周期

**Requirement: 焦点区域注册生命周期**

系统 SHALL 管理焦点区域的注册和注销生命周期。

**子系统 SHALL:**
- 提供 `registerZone` 函数用于组件挂载时注册
- 提供 `unregisterZone` 函数用于组件卸载时注销
- 使用 Map 数据结构存储已注册区域

**系统 SHALL:**
- 自动处理组件卸载时的清理工作
- 确保不再存在的区域不会被导航到
- React Effect 清理函数确保正确注销

> 来源: `apps/electron/src/renderer/context/FocusContext.tsx:74-80`, `apps/electron/src/renderer/hooks/keyboard/useFocusZone.ts:50-61`

---

### Requirement: DOM 焦点移动控制

**Requirement: DOM 焦点移动控制**

系统 SHALL 提供精确控制 DOM 焦点是否移动到焦点区域。

**子系统 SHALL:**
- 在 `FocusZoneOptions` 中提供 `moveFocus` 选项
- 默认值基于焦点意图：keyboard=true，click=false，programmatic=true
- 支持自定义的焦点首元素聚焦行为

**系统 SHALL:**
- 仅在 `moveFocus` 为 true时移动焦点
- 优先使用区域的 `focusFirst` 函数
- 回退到聚焦区域的 ref 元素
- 焦点移动后"消费"意图（立即重置 `shouldMoveDOMFocus`）

#### Scenario: 自定义焦点行为
- **WHEN** 区域定义了 `focusFirst` 函数
  - **WHEN** 调用时 `moveFocus` 为 true
    - **THEN** 系统调用 `focusFirst` 而非直接聚焦 ref

#### Scenario: 意图消费
- **WHEN** 焦点移动完成
  - **THEN** 系统立即重置 `shouldMoveDOMFocus` 为 false
  - **THEN** 防止副作用在数据变化时重复触发

> 来源: `apps/electron/src/renderer/context/FocusContext.tsx:82-110`
> 来源: `apps/electron/src/renderer/hooks/keyboard/useFocusZone.ts:20-21`

---

### Requirement: 焦点区域管理

**Requirement: 焦点区域管理**

系统 SHALL 支持将组件划分为可导航的焦点区域。

**子系统 SHALL:**
- 提供 `useFocusZone` hook 用于注册焦点区域
- 维护全局焦点状态（当前区域、焦点意图）
- 支持 `keyboard`、`click`、`programmatic` 三种焦点意图

**系统 SHALL:**
- 支持焦点区域注册和注销
- 提供回调函数（`onFocus`、`onBlur`）
- 支持自定义聚焦第一个元素的行为
- 控制 DOM 焦点是否移动到区域
- 返回区域引用和焦点状态

#### Scenario: 焦点区域注册
- **WHEN** 组件调用 `useFocusZone({ zoneId, onFocus, onBlur })`
  - **THEN** 系统注册该区域为可导航焦点区域
  - **THEN** 返回 `zoneRef` 绑定到容器 DOM 元素
  - **THEN** 返回 `isFocused` 表示当前焦点状态
  - **THEN** 组件卸载时自动注销该区域

#### Scenario: 焦点状态跟踪
- **WHEN** 用户通过键盘导航切换区域
  - **THEN** 焦点状态更新为新的区域 ID 和意图类型
  - **THEN** `isFocused` 返回值更新
  - **THEN** `shouldMoveDOMFocus` 指示是否需要移动 DOM 焦点
  - **THEN** `intent` 显示焦点变化的意图类型

> 来源: `apps/electron/src/renderer/hooks/keyboard/useFocusZone.ts`

---

**Requirement: 焦点状态变化通知**

系统 SHALL 通知组件焦点区域的变化。

**子系统 SHALL:**
- 在 `useFocusZone` hook 中跟踪焦点状态变化
- 提供可选的 `onFocus` 和 `onBlur` 回调

**系统 SHALL:**
- 当区域获得焦点时调用 `onFocus` 回调
- 当区域失去焦点时调用 `onBlur` 回调
- 避免重复回调（状态确实变化时才触发）

#### Scenario: 焦点获得通知
- **WHEN** 用户导航到会话列表区域
  - **THEN** `isFocused` 变为 true
  - **THEN** 触发 `onFocus` 回调（如果已设置）
  - **THEN** 组件可执行焦点相关操作

#### Scenario: 焦点失去通知
- **WHEN** 用户从会话列表导航到聊天区域
  - **THEN** `isFocused` 变为 false
  - **THEN** 触发 `onBlur` 回调（如果已设置）
  - **THEN** 组件可清理焦点状态

> 来源: `apps/electron/src/renderer/hooks/keyboard/useFocusZone.ts:42-71`

---

### Requirement: Roving Tab Index 列表导航

**Requirement: Roving Tab Index 列表导航**

系统 SHALL 实现标准的 roving tabindex 模式用于列表键盘导航。

**子系统 SHALL:**
- 提供 `useRovingTabIndex` hook 管理列表导航
- 仅当前活动项设置 `tabIndex=0`，其他项设置为 `tabIndex=-1`
- 支持垂直、水平或双向导航方向
- 支持在列表两端循环导航（可选）

**系统 SHALL:**
- 方向键（↑↓←→）导航列表项并调用 `onNavigate` 回调
- Enter/Space 键触发 `onActivate` 回调用于选择
- Home/End 键跳转到首/末项
- Tab 键退出列表到下一个焦点区域
- 在项目中滚动到视图（通过 `onNavigate`）

#### Scenario: 列表导航
- **WHEN** 用户按下箭头键
  - **THEN** 活动索引更新
  - **THEN** 系统调用 `onNavigate` 回调以滚动到视图
  - **THEN** 焦点移动到新项目

#### Scenario: 选择项目
- **WHEN** 用户按下 Enter 或 Space
  - **THEN** 系统触发 `onActivate` 回调
  - **THEN** 组件执行选择操作

#### Scenario: 循环导航
- **WHEN** 用户在最后一项按下向下箭头
  - **WHEN** `wrap` 选项设置为 true
    - **THEN** 焦点转移到第一项
    - **THEN** 调用 `onNavigate` 回调

> 来源: `apps/electron/src/renderer/hooks/keyboard/useRovingTabIndex.ts`

---

### Requirement: 列表多选支持

**Requirement: 列表多选支持**

系统 SHALL 支持 Shift+箭头键扩展选择范围的多选操作。

**子系统 SHALL:**
- 检测 Shift+箭头键组合
- 调用 `onExtendSelection` 回调传递目标索引

**系统 SHALL:**
- 更新活动索引用于视觉反馈
- 调用 `onNavigate` 回调将新项滚动到视图

#### Scenario: 扩展选择范围
- **WHEN** 用户按下 Shift+向下箭头
  - **WHEN** `onExtendSelection` 回调已设置
    - **THEN** 系统传递下一个索引到 `onExtendSelection`
    - **THEN** 更新活动索引

> 来源: `apps/electron/src/renderer/hooks/keyboard/useRovingTabIndex.ts:27, 234-238`

---

### Requirement: 列表删除操作

**Requirement: 列表删除操作**

系统 SHALL 支持通过 Delete/Backspace 键删除当前聚焦的列表项。

**子系统 SHALL:**
- 检测 Delete 或 Backspace 键
- 检查 `onDelete` 回调是否已设置

**系统 SHALL:**
- 阻止按键的默认浏览器行为
- 调用 `onDelete` 回调传递当前项和索引

#### Scenario: 删除会话
- **WHEN** 用户在会话列表中按下 Delete 键
  - **WHEN** 会话项当前活动
    - **THEN** 系统调用 `onDelete` 回调
    - **THEN** 组件删除对应会话

> 来源: `apps/electron/src/renderer/hooks/keyboard/useRovingTabIndex.ts:204-211`

---

### Requirement: 上下文菜单快捷键

**Requirement: 上下文菜单快捷键**

系统 SHALL 支持通过键盘打开上下文菜单。

**子系统 SHALL:**
- 检测 F10 键（Shift+F10）或 ContextMenu 键
- 调用 `onContextMenu` 回调传递当前项和对应 DOM 元素

**系统 SHALL:**
- 阻止按键的默认浏览器行为
- 仅 Shift+F10 触发上下文菜单（单独 F10 不触发）

#### Scenario: 键盘打开上下文菜单
- **WHEN** 用户按下 Shift+F10
  - **WHEN** 列表项当前活动
  - **WHEN** `onContextMenu` 回调已设置
    - **THEN** 系统调用 `onContextMenu` 回调
    - **THEN** 组件在项的位置显示上下文菜单

> 来源: `apps/electron/src/renderer/hooks/keyboard/useRovingTabIndex.ts:214-227`

---

### Requirement: 非焦点导航模式

**Requirement: 非焦点导航模式**

系统 SHALL 支持在不移动 DOM 焦点的情况下导航列表项。

**子系统 SHALL:**
- 提供 `moveFocus` 选项控制是否移动焦点
- 默认值为 `true`（移动焦点）

**系统 SHALL:**
- 当 `moveFocus` 为 `false` 时更新活动索引但焦点保留在当前位置（如搜索输入框）
- 仍调用 `onNavigate` 回调以滚动到视图

#### Scenario: 搜索时导航列表
- **WHEN** 用户在搜索输入框中输入
  - **WHEN** 用户按下箭头键
  - **WHEN** 列表的 `moveFocus` 设置为 `false`
    - **THEN** 系统更新活动索引以显示高亮
    - **THEN** 焦点保留在搜索输入框
    - **THEN** 用户可继续输入搜索内容

> 来源: `apps/electron/src/renderer/hooks/keyboard/useRovingTabIndex.ts:24-25, 119-131`

---

### Requirement: 无障碍属性支持

**Requirement: 无障碍属性支持**

系统 SHALL 为列表导航提供完整的无障碍（A11y）属性支持。

**子系统 SHALL:**
- 容器设置 `role="listbox"`
- 设置 `aria-activedescendant` 指向当前活动项的 ID
- 每个项目设置 `role="option"`
- 每个项目设置 `aria-selected` 表示活动状态

**系统 SHALL:**
- 确保屏幕阅读器正确识别列表结构
- 支持键盘导航的可访问性

> 来源: `apps/electron/src/renderer/hooks/keyboard/useRovingTabIndex.ts:278, 283-286`

---

### Requirement: 列表项动态处理

**Requirement: 列表项动态处理**

系统 SHALL 正确处理列表项的动态变化。

**系统 SHALL:**
- 当列表为空时重置活动索引为 0
- 当活动索引超出列表范围时调整为有效范围
- 仅在列表长度变化时自动调整（忽略状态变化）

#### Scenario: 动态列表重置
- **WHEN** 当前活动索引为 5
- **WHEN** 列表缩小到 3 个项目
    - **THEN** 系统自动将活动索引调整为 2

> 来源: `apps/electron/src/renderer/hooks/keyboard/useRovingTabIndex.ts:93-100`

---

### Requirement: 程序化索引设置

**Requirement: 程序化索引设置**

系统 SHALL 支持程序化设置活动索引而不触发导航回调。

**子系统 SHALL:**
- 提供 `setActiveIndex` 函数
- 验证索引在有效范围内

**系统 SHALL:**
- 仅更新状态，不调用 `onNavigate` 回调
- 用于初始化或外部设置列表选择

> 来源: `apps/electron/src/renderer/hooks/keyboard/useRovingTabIndex.ts:104-108`

---

### Requirement: 自定义快捷键编辑器

**Requirement: 自定义快捷键编辑器**

系统 SHALL 为用户快捷键覆盖功能提供 UI 编辑器（待实现）。

**子系统 SHALL:**
- 提供快捷键录制界面
- 显示快捷键冲突提示
- 支持快捷键重置到默认值

> 来源: 架构预留，待实现 UI 组件

---

## MODIFIED Requirements

（暂无修改的需求）

---

## REMOVED Requirements

（暂无移除的需求）
