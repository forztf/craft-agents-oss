# Playwright E2E i18n 测试套件

## 概述

这个测试套件用于检测 i18n 改造过程中的遗漏翻译。通过自动化测试确保所有用户可见文本都已正确国际化。

## 功能特性

### 1. E2E UI 测试 (`i18n-e2e.spec.ts`)

- **Electron 应用自动化启动**：自动启动并初始化 Electron 应用
- **多页面检测**：覆盖 Chat、Settings、Sidebar、Workspace、Onboarding 等主要页面
- **硬编码文本检测**：识别未使用 `t()` 函数的硬编码字符串
- **HTML 属性检测**：检查 `<title>`, `placeholder>`, `aria-label>`, `alt>` 等属性
- **语言切换测试**：验证语言切换功能是否正常工作
- **详细测试报告**：生成 JSON 格式的详细报告

### 2. 静态代码分析 (`static-analyzer.ts`)

- **源代码扫描**：扫描所有 `.tsx` 和 `.ts` 文件
- **模式匹配**：使用正则表达式检测硬编码文本
- **上下文分析**：检查文本是否已通过 `t()` 函数翻译
- **智能过滤**：自动忽略技术术语、常量、变量名等
- **批量报告**：生成按文件分组的问题报告

### 3. 测试报告器 (`I18nTestReporter`)

- **实时进度输出**：显示每个测试的执行状态
- **问题分类**：按类型（hardcoded, missing-key, format-error）和严重级别分组
- **JSON 导出**：生成机器可读的 JSON 报告
- **控制台美化**：使用图标和格式化输出增强可读性

## 安装依赖

```bash
bun install
```

## 使用方法

### 运行 E2E 测试

```bash
# 运行完整的 E2E i18n 测试（需要先编译应用）
bun run test:e2e

# 使用 Playwright UI 运行（可视化调试）
bun run test:e2e:ui

# 运行特定测试文件
playwright test tests/e2e/i18n/i18n-e2e.spec.ts --project=electron
```

### 运行静态代码分析

```bash
# 直接运行静态分析脚本
bun run tests/e2e/i18n/static-analyzer.ts

# 或使用 npm script
bun run test:i18n
```

### 查看测试报告

测试结果保存在 `test-results/` 目录下：

- `i18n-e2e-report.json` - E2E 测试详细报告
- `hardcoded-strings-analysis.json` - 静态代码分析报告
- `html/index.html` - Playwright HTML 报告（可视化）

## 测试覆盖范围

### 页面检测

| 页面 | 检测内容 | 选择器 |
|------|----------|--------|
| Chat | 聊天消息、输入框、按钮 | `[class*="chat"]`, `textarea` |
| Settings | 设置项、标签、描述 | `[class*="settings"]`, `h1, h2, h3` |
| Sidebar | 侧边栏菜单、会话列表 | `[class*="sidebar"]` |
| Workspace | 工作区选择器、配置项 | `[class*="workspace"]` |
| Onboarding | 欢迎向导步骤、提示文本 | `[class*="onboarding"]` |

### 元素类型检测

- **按钮文本**：`<button>`
- **输入框**：`<input placeholder="...">`
- **文本域**：`<textarea placeholder="...">`
- **标签**：`<label>`, `<h1`-`h6`>`
- **属性文本**：`title`, `aria-label`, `alt`

## 测试配置

### Playwright 配置 (`playwright.config.ts`)

```typescript
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'test-results/html' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list']
  ],
  projects: [
    {
      name: 'electron',
      use: {},
    },
  ],
})
```

### 自定义配置

可以通过修改以下配置来调整测试行为：

```typescript
// 在 i18n-e2e.spec.ts 中
const mainWindowSelectors = {
  settingsButton: '[data-testid="settings-menu-entry"],...',
  workspaceButton: '[data-testid="workspace-switcher"],...',
  sidebar: '[class*="sidebar"],...',
  chatArea: '[class*="chat"],...',
  inputArea: 'textarea, input[type="text"]',
  mainContent: 'main, [role="main"]',
}
```

## 测试报告格式

### JSON 报告示例

```json
{
  "timestamp": "2025-02-11T12:00:00.000Z",
  "summary": {
    "total": 42,
    "errors": 5,
    "warnings": 35,
    "infos": 2,
    "duration": 15000
  },
  "issues": [
    {
      "type": "hardcoded",
      "page": "Chat",
      "selector": ".chat-input",
      "text": "Type your message...",
      "severity": "warning"
    },
    {
      "type": "missing-key",
      "page": "Translation Files",
      "selector": "i18n/locales/zh-CN/components/app-shell/Panel.json",
      "text": "Missing Chinese translation file",
      "severity": "error"
    }
  ]
}
```

## 问题类型

### 1. Hardcoded (硬编码)

检测到未翻译的用户可见文本。

**示例：**
```
❌ [hardcoded] Type your message...
   选择器: textarea[placeholder]
   文件: apps/electron/src/renderer/components/app-shell/InputContainer.tsx:45
```

**修复方法：**
```tsx
// before
<input placeholder="Type your message..." />

// after
const { t } = useTranslation('app-shell/InputContainer')
<input placeholder={t('Type your message...')} />
```

### 2. Missing Key (缺失翻译 key)

翻译 key 在一种语言中存在，但在另一种语言中缺失。

**示例：**
```
❌ [missing-key] Settings
   文件: i18n/locales/zh-CN/pages/settings/SettingsPage.json
```

**修复方法：**
在缺失的翻译文件中添加对应的 key。

### 3. Format Error (格式错误)

翻译 key 或内容格式不符合规范。

**示例：**
```
⚠️  [format-error] 建议使用原文作为 key: t('saveBtn') → t('Save')
```

## CI/CD 集成

可以将测试集成到 CI/CD 流程中：

```yaml
# .github/workflows/i18n-test.yml
name: i18n Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run electron:build
      - run: bun run test:i18n
      - uses: actions/upload-artifact@v3
        with:
          name: i18n-report
          path: test-results/i18n-e2e-report.json
```

## 故障排除

### Electron 应用启动失败

**问题：** "⚠️ Electron 主进程未编译"

**解决：**
```bash
bun run electron:build
```

### 权限错误

**问题：** 无法访问测试结果目录

**解决：**
```bash
mkdir -p test-results
```

### 测试超时

**问题：** 测试在等待某个元素时超时

**解决：** 增加超时时间或调整选择器

## 贡献指南

### 添加新的页面检测

1. 在 `mainWindowSelectors` 中添加页面选择器
2. 创建新的测试用例
3. 更新文档

### 添加新的检测模式

1. 修改 `isLikelyHardcodedText()` 函数
2. 添加新的正则表达式模式
3. 更新 `static-analyzer.ts`

### 调整报告格式

1. 修改 `I18nTestReporter` 类
2. 更新 `printReport()` 和 `saveReport()` 方法

## 相关文档

- [Playwright 官方文档](https://playwright.dev)
- [Electron 文档](https://www.electronjs.org/docs)
- [项目 i18n 设计文档](../../docs/i18n.md)

## 许可证

本项目遵循项目的开源许可证。