# Craft Agents i18n E2E 测试 - 综合分析报告

**生成时间**: 2026-02-12
**团队**: i18n-e2e-test-team
**报告类型**: 综合分析报告

---

## 执行摘要

### 测试状态概览

| 状态 | 说明 |
|------|------|
| 应用构建 | ✅ 已完成 (bun run electron:build) |
| 静态分析 | ✅ 已完成 |
| 团队成员 | 🔄 执行中 |
| E2E 验证 | ⏳ 待执行 |

### 发现问题统计

| 类别 | 数量 | 说明 |
|------|------|------|
| 扫描文件 | 292 | .tsx/.ts 文件 |
| 总问题数 | 495 | 需要国际化的硬编码文本 |
| 高优先级 | ~100+ | actions/definitions.ts, EditPopover.tsx 等核心组件 |
| 中优先级 | ~300+ | 其他 UI 组件 |
| 低优先级 | ~100+ | playground/ 目录（UI 演示，可忽略） |

---

## 详细问题分析

### 1. 快捷键定义 (actions/definitions.ts) - 33 个问题

**优先级**: 🔴 高

**问题描述**: 快捷键标签未国际化，用户可见文本硬编码

**示例**:
```typescript
// 当前代码
{
  id: 'new-chat',
  label: 'New Chat',
  description: 'Create a new chat session'
}

// 修复建议
import { useTranslation } from '@/contexts/I18nContext'

function HotkeyActions() {
  const { t } = useTranslation('actions/definitions')
  return {
    id: 'new-chat',
    label: t('New Chat'),
    description: t('Create a new chat session')
  }
}
```

**需要国际化的文本**:
- "New Chat", "Create a new chat session"
- "Settings", "Open application settings"
- "Toggle Theme", "Switch between light and dark mode"
- "Search", "Open search panel"
- "Keyboard Shortcuts", "Show keyboard shortcuts reference"
- "New Window", "Open a new window"
- "Quit", "Quit application"

---

### 2. 编辑弹窗组件 (components/ui/EditPopover.tsx) - 29 个问题

**优先级**: 🔴 高

**问题描述**: 编辑弹窗中的用户提示文本未国际化

**问题类型**:
- placeholder 属性（文本输入框）
- aria-label 属性（辅助功能）
- 提示标题和描述

**修复建议**:
```typescript
import { useTranslation } from '@/contexts/I18nContext'

function EditPopover() {
  const { t } = useTranslation('components/ui/EditPopover')
  return (
    <Popover>
      <PopoverTrigger />
      <PopoverContent>
        <input placeholder={t('Enter value...')} />
      </PopoverContent>
    </Popover>
  )
}
```

---

### 3. 面板头部组件 (components/app-shell/PanelHeader.tsx)

**优先级**: 🟡 中

**问题描述**: 面板头部可能包含标题、按钮等需要国际化的文本

**检查重点**:
- 面板标题
- 操作按钮标签
- 工具提示文本

---

### 4. 数据表组件 (components/info/Info_DataTable.tsx)

**优先级**: 🟡 中

**问题描述**: 数据表列标题、空状态消息等可能未国际化

**检查重点**:
- 表格列标题
- 空状态提示
- 操作按钮文本

---

### 5. 设置相关组件 (components/settings/*.tsx)

**优先级**: 🟡 中

**问题描述**: 各种设置输入组件中的标签和提示

**相关文件**:
- SettingsRow.tsx
- SettingsSegmentedControl.tsx
- 其他设置组件

---

### 6. 核心页面 (pages/*.tsx)

**优先级**: 🟡 中

**问题描述**:
- ChatPage.tsx - 对话主页面
- PreferencesPage.tsx - 偏好设置页面

---

### 7. Playground 目录 - 低优先级

**优先级**: 🟢 低（可忽略）

**说明**: `playground/` 目录包含 UI 演示组件，通常不需要国际化

**问题文件分布（Top 10）**:
```
playground/registry/turn-card.tsx: 102 issues
playground/registry/messages.tsx: 57 issues
playground/registry/chat.tsx: 44 issues
playground/registry/onboarding.tsx: 28 issues
playground/registry/edit-popover.tsx: 26 issues
playground/registry/session-list.tsx: 22 issues
playground/registry/input.tsx: 21 issues
playground/registry/markdown.tsx: 20 issues
...
```

---

## 翻译文件完整性检查

### 已存在的翻译文件

#### 英语 (en) - 197 个 JSON 文件
- `i18n/locales/en/components/**/*.json`
- `i18n/locales/en/pages/**/*.json`
- `i18n/locales/en/actions/definitions.json`

#### 简体中文 (zh-CN) - 197 个 JSON 文件
- 镜像英語语言文件结构

### 扩展的翻译文件需求

根据检测到的问题，需要扩展以下翻译文件：

1. **`i18n/locales/en/actions/definitions.json`** - 快捷键标签
2. **`i18n/locales/en/components/ui/EditPopover.json`** - 编辑弹窗
3. 其他组件翻译文件（根据具体发现的问题）

---

## 修复优先级建议

### 第一优先级 🔴（立即处理）

1. **actions/definitions.ts** - 33 个问题
   - 影响范围: 全局快捷键提示
   - 修复复杂度: 中
   - 预计工作量: 30-60 分钟

2. **components/ui/EditPopover.tsx** - 29 个问题
   - 影响范围: 编辑功能
   - 修复复杂度: 中
   - 预计工作量: 30-60 分钟

### 第二优先级 🟡（本周内）

3. **components/app-shell/PanelHeader.tsx**
4. **components/info/Info_DataTable.tsx**
5. **components/settings/*.tsx**
6. **pages/ChatPage.tsx**
7. **pages/PreferencesPage.tsx**

### 第三优先级 🟢（可延后）

8. **playground/** 目录下的文件（UI 演示组件）

---

## 翻译规范检查

### Key 格式要求

#### ✅ 正确示例
```typescript
t('New Chat')
t('Create a new chat session')
t('Enter your API key...')
t('A workspace named "{slug}" already exists', { slug: workspaceName })
```

#### ❌ 不正确示例
```typescript
t('new_chat')
t('auth.enter_key')
t('error.required')
```

### JSON 文件格式要求

```json
{
  "New Chat": "新建对话",
  "Create a new chat session": "创建新的对话会话"
}
```

**要求**:
- 使用 2 空格缩进
- 保持高可读性
- 使用完整英文原文作为 key

---

## 测试报告文件

| 文件 | 大小 | 描述 |
|------|------|------|
| `hardcoded-check-report.json` | 259KB | 详细硬编码检查报告（逐行问题） |
| `hardcoded-strings-analysis.json` | 110KB | 硬编码字符串分析摘要 |
| `i18n-analysis-summary.json` | 1.2KB | i18n 分析摘要 |
| `i18n-check-report.json` | 57KB | i18n 检查报告 |
| `i18n-validation-report.json` | 36KB | i18n 验证报告 |
| `i18n-test-preliminary-report.md` | 4.8KB | 初步测试报告 |

---

## 团队任务进度

### settings-tester (蓝色) 🔄
- [x] 任务已分配
- [x] 扫描设置页面组件
- [ ] 验证翻译文件完整性
- [ ] 检查翻译风格和格式
- [ ] 生成测试报告

### core-pages-tester (绿色) 🔄
- [x] 任务已分配
- [x] 确认任务范围
- [ ] 扫描核心页面
- [ ] 分析翻译文件
- [ ] 生成测试报告

### components-tester (黄色) 🔄
- [x] 任务已分配
- [x] 扫描组件文件结构
- [ ] 验证组件翻译文件
- [ ] 检查翻译风格和 JSON 格式
- [ ] 验证快捷键标签
- [ ] 生成测试报告

### e2e-validator (待启动) ⏳
- [ ] 等待前置任务完成
- [ ] 执行 Playwright E2E 测试
- [ ] 验证语言切换功能
- [ ] 生成最终报告

---

## 下一步计划

### 立即行动

1. **修复快捷键定义** (最高优先级)
   - 创建 `i18n/locales/en/actions/definitions.json`
   - 创建 `i18n/locales/zh-CN/actions/definitions.json`
   - 修改 `actions/definitions.ts` 使用 `t()` 函数

2. **修复编辑弹窗组件**
   - 扩展 `i18n/locales/en/components/ui/EditPopover.json`
   - 扩展 `i18n/locales/zh-CN/components/ui/EditPopover.json`
   - 修改 `components/ui/EditPopover.tsx`

### 后续工作

3. **批量处理其他组件**
   - 修复 PanelHeader, Info_DataTable 等组件
   - 扩展对应翻译文件

4. **E2E 测试**
   - 运行 Playwright E2E 测试
   - 验证语言切换功能（en ↔ zh-CN）

5. **生成最终报告**
   - Markdown 总结报告
   - 控制台摘要

---

## 建议和改进

### 代码结构改进

1. **统一使用 I18nContext**
   - 所有需要国际化的组件导入 `useTranslation` hook
   - 确保翻译 key 使用完整英文原文

2. **组件级翻译文件**
   - 每个组件有对应的 JSON 翻译文件
   - 保持文件结构清晰

3. **自动化检查**
   - 添加 ESLint 规则检测硬编码文本
   - CI/CD 中集成 i18n 验证

### 测试覆盖

1. **静态分析**
   - ✅ 已完成硬编码文本检测
   - ✅ 已完成翻译文件验证

2. **运行时测试**
   - ⏳ 待执行 E2E 测试
   - ⏳ 待执行语言切换测试

3. **回归测试**
   - 在修复后重新运行静态分析
   - 验证修复效果

---

## 附录

### 问题统计（按文件分类）

| 文件路径 | 问题数 | 优先级 |
|----------|--------|--------|
| `actions/definitions.ts` | 33 | 🔴 高 |
| `components/ui/EditPopover.tsx` | 29 | 🔴 高 |
| `components/app-shell/PanelHeader.tsx` | 多 | 🟡 中 |
| `components/info/Info_DataTable.tsx` | 多 | 🟡 中 |
| `components/settings/*.tsx` | 多 | 🟡 中 |
| `pages/ChatPage.tsx` | 多 | 🟡 中 |
| `pages/PreferencesPage.tsx` | 多 | 🟡 中 |
| `playground/**/*` | ~300 | 🟢 低 |

### 测试命令参考

```bash
# 构建应用
bun run electron:build

# 静态分析
bun run tests/e2e/hardcoded-check.ts
bun run scripts/check-hardcoded-text.ts
bun run scripts/validate-locales.ts

# E2E 测试
bun run test:e2e
bun run test:e2e:ui

# 生成进度报告
bun run scripts/i18n-progress-report.ts
```

---

**报告生成者**: team-lead-tester
**报告状态**: 综合分析报告（测试进行中）
**下次更新**: 待团队成员完成各自任务后生成最终报告