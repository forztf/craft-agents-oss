# Playwright i18n 自动化测试文档

## 概述

本文档描述了 Craft Agents 项目中的 i18n 自动化测试套件。测试套件用于检测和验证国际化改造的完整性。

## 测试文件结构

```
tests/e2e/
├── i18n.spec.ts           # 旧的测试文件（保留兼容）
├── i18n-e2e.spec.ts       # 新的完整 e2e 测试套件
├── hardcoded-check.ts     # 静态代码扫描工具
├── check-i18n.ts          # i18n 检测脚本（保留兼容）
└── README.md              # 本文档

playwright.config.ts       # Playwright 配置文件
```

## 运行测试

### 1. 静态检测（推荐先执行）

```bash
# 扫描源代码中的硬编码字符串
bun run test:i18n

# 输出位置：test-results/hardcoded-check-report.json
```

### 2. Playwright E2E 测试

```bash
# 运行所有 E2E 测试
bun run test:e2e

# 使用 UI 模式运行（推荐开发时使用）
bun run test:e2e:ui

# 运行特定测试文件
bun run test:e2e --grep "i18n-e2e"
```

### 3. 快速检测

```bash
# 仅运行静态扫描
bun run tests/e2e/hardcoded-check.ts
```

## 测试覆盖范围

### 静态检测 (`hardcoded-check.ts`)

检测以下类型的硬编码文本：

| 类型 | 描述 | 示例 |
|------|------|------|
| `jsx-text` | JSX 文本节点 | `<div>Text Here</div>` |
| `placeholder` | placeholder 属性 | `<input placeholder="Enter email" />` |
| `title` | title 属性 | `<div title="Tooltip">` |
| `aria-label` | aria-label 属性 | `<button aria-label="Delete">` |
| `label-attr` | label 属性 | `<label={...}>` |
| `value-attr` | value 属性 | `<input value="Default" />` |
| `string-literal` | 对象属性字符串字面量 | `{ label: "Text" }` |

### E2E 测试 (`i18n-e2e.spec.ts`)

1. **翻译文件完整性检查**
   - 英文和中文翻译文件一一对应
   - 每个文件的 key 数量一致

2. **运行时硬编码文本检测**
   - 页面文本分析
   - 按钮、输入框、提示框文本检测

3. **语言切换功能测试**
   - 验证语言切换控件存在性
   - 测试语言切换功能

4. **翻译键命名规范检查**
   - 验证是否使用原文作为 key
   - 不推荐使用缩写格式的 key

## 测试报告

### 静态检测报告格式

```json
{
  "timestamp": "2025-01-01T00:00:00.000Z",
  "summary": {
    "totalFiles": 42,
    "totalIssues": 128,
    "bySeverity": {
      "high": 15,
      "medium": 63,
      "low": 50
    },
    "byType": {
      "placeholder": 35,
      "title": 20,
      "aria-label": 15,
      "jsx-text": 42,
      "value-attr": 10
    }
  },
  "issues": {
    "apps/electron/src/renderer/Component.tsx": [...]
  },
  "recommendations": [
    "发现 15 处高优先级硬编码文本，建议优先处理"
  ]
}
```

### E2E 测试报告格式

```json
{
  "timestamp": "2025-01-01T00:00:00.000Z",
  "summary": {
    "totalTests": 8,
    "passed": 7,
    "failed": 1,
    "skipped": 0
  },
  "findings": {
    "hardcodedText": [...],
    "missingTranslations": [...],
    "translationGaps": [...]
  },
  "languageSwitchTest": {
    "success": true
  }
}
```

## 测试输出位置

```
test-results/
├── html/                          # HTML 格式报告
│   └── index.html
├── results.json                   # Playwright 测试结果
├── i18n-e2e-report.json          # E2E 测试报告
└── hardcoded-check-report.json   # 静态检测报告
```

## 严重程度定义

| 等级 | 描述 | 示例 |
|------|------|------|
| **High** | 常见 UI 文本，影响用户体验 | "Cancel", "Save", "Enter your email" |
| **Medium** | 较长文本，以大写字母开头 | "Please try again later" |
| **Low** | 短文本或技术相关 | "ID", "URL" |

## i18n 改造规范

### 翻译 Key 命名规范

✅ 正确示例：
```tsx
const { t } = useTranslation('common')

// 直接使用原文作为 key
<button>{t('Delete this item')}</button>
<input placeholder={t('Enter your email')} />
```

❌ 错误示例：
```tsx
const { t } = useTranslation('common')

// 不要使用缩写格式
<button>{t('delete_item')}</button>  // ❌
<input placeholder={t('email_hint')} />  // ❌
```

### 组件使用翻译

```tsx
import { useTranslation } from '@/contexts/I18nContext'

function MyComponent() {
  const { t } = useTranslation('components/MyComponent')

  return (
    <div>
      <h1>{t('Page Title')}</h1>
      <input placeholder={t('Enter your message')} />
      <button>{t('Submit')}</button>
    </div>
  )
}
```

## 忽略规则

以下情况不需要翻译：

1. CSS 类名：`className="container"`
2. 技术术语：`"API"`, `"HTTP"`, `"JSON"`
3. 文件路径：`/path/to/file`
4. URL：`https://example.com`
5. 纯数字：`"42"`
6. 短文本（2 字符以下）：`"a"`, `"b"`, `"1"`, `"2"`
7. React 专有属性：`className`, `htmlFor`, `tabIndex` 等

## CI/CD 集成

测试会在 CI 环境中自动运行，并在以下情况下失败：

1. 高优先级硬编码文本 > 50 处
2. 翻译文件缺失
3. 翻译键数量不一致 > 阈值

## 故障排除

### Electron 启动失败

如果 Electron 应用无法启动，请确保：

```bash
# 先构建 Electron 应用
bun run electron:build

# 然后运行测试
bun run test:e2e
```

### Playwright 未安装

```bash
# 安装 Playwright 浏览器
bun run test:setup
```

## 贡献指南

当发现新的需要测试的场景时：

1. 将测试用例添加到 `i18n-e2e.spec.ts`
2. 更新硬编码模式到 `hardcoded-check.ts`
3. 更新本文档

## 版本历史

- **v1.0** (2025-01-01) - 初始版本
  - 基础静态检测
  - E2E 测试套件
  - 报告生成