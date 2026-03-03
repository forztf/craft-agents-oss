# 添加新功能指南

本文档教你如何从零开始添加一个新功能。

## 📋 目录

- [功能开发流程](#功能开发流程)
- [功能类型与模板](#功能类型与模板)
- [实战案例：添加主题切换功能](#实战案例添加主题切换功能)
- [最佳实践](#最佳实践)

---

## 功能开发流程

### 整体流程图

```mermaid
flowchart TD
    A[需求分析] --> B[设计方案]
    B --> C[创建类型定义]
    C --> D[实现后端逻辑]
    D --> E[实现前端 UI]
    E --> F[添加 IPC 通信]
    F --> G[集成测试]
    G --> H{测试通过?}
    H -->|否| I[修复问题]
    I --> G
    H -->|是| J[代码审查]
    J --> K[提交代码]
    
    style A fill:#e3f2fd
    style B fill:#e3f2fd
    style C fill:#fff3e0
    style D fill:#fff3e0
    style E fill:#e8f5e9
    style F fill:#f3e5f5
    style G fill:#fce4ec
    style K fill:#c8e6c9
```

### 各阶段详细说明

#### 1. 需求分析

明确功能的目标：
- 功能解决什么问题？
- 用户如何使用这个功能？
- 需要哪些数据？

#### 2. 设计方案

设计数据流和组件结构：

```mermaid
graph LR
    subgraph 数据层
        A[类型定义]
        B[状态管理]
        C[持久化存储]
    end
    
    subgraph 业务层
        D[主进程逻辑]
        E[共享模块]
    end
    
    subgraph 展示层
        F[UI 组件]
        G[Hooks]
    end
    
    A --> B
    B --> C
    D --> E
    F --> G
    G --> B
    E --> C
```

#### 3. 实现步骤

```mermaid
sequenceDiagram
    participant Dev as 开发者
    participant Type as 类型定义
    participant Main as 主进程
    participant IPC as IPC 层
    participant UI as UI 层

    Dev->>Type: 1. 定义接口和类型
    Dev->>Main: 2. 实现主进程逻辑
    Dev->>IPC: 3. 添加 IPC 通道
    Dev->>UI: 4. 创建 UI 组件
    Dev->>UI: 5. 连接状态和事件
    Dev->>Dev: 6. 测试完整流程
```

---

## 功能类型与模板

### 类型一：纯 UI 功能

**特点**: 不涉及主进程，只在渲染进程内

**文件位置**: `apps/electron/src/renderer/`

**模板：**

```tsx
// 1. 创建组件: components/MyFeature.tsx
import { useState } from 'react'

export function MyFeature() {
  const [value, setValue] = useState('')
  
  return (
    <div className="p-4">
      <input 
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  )
}

// 2. 在页面中使用
import { MyFeature } from '@/components/MyFeature'

// 在 JSX 中
<MyFeature />
```

### 类型二：需要持久化的功能

**特点**: 需要保存数据到磁盘

**涉及文件：**
1. 类型定义: `packages/core/src/` 或 `apps/electron/src/shared/types.ts`
2. 配置管理: `packages/shared/src/config/`
3. 主进程处理: `apps/electron/src/main/`

**模板：**

```typescript
// 1. 类型定义 (shared/types.ts)
export interface MyFeatureConfig {
  enabled: boolean
  value: string
}

// 2. 配置管理 (packages/shared/src/config/my-feature.ts)
export async function loadMyFeatureConfig(
  workspaceId: string
): Promise<MyFeatureConfig> {
  const configPath = path.join(
    getWorkspacePath(workspaceId),
    'my-feature.json'
  )
  // 读取并解析配置...
}

// 3. 主进程 IPC 处理 (main/ipc.ts)
ipcMain.handle('get-my-feature-config', async (_, workspaceId) => {
  return loadMyFeatureConfig(workspaceId)
})

// 4. 预加载脚本暴露 API (preload/index.ts)
const api = {
  // ...
  getMyFeatureConfig: (workspaceId: string) => 
    ipcRenderer.invoke('get-my-feature-config', workspaceId)
}

// 5. 渲染进程使用 (hooks/useMyFeature.ts)
export function useMyFeature(workspaceId: string) {
  const [config, setConfig] = useState<MyFeatureConfig | null>(null)
  
  useEffect(() => {
    window.electronAPI.getMyFeatureConfig(workspaceId)
      .then(setConfig)
  }, [workspaceId])
  
  return { config }
}
```

### 类型三：需要 Agent 交互的功能

**特点**: 需要与 AI Agent 进行交互

**涉及文件：**
1. Agent 工具: `packages/shared/src/agent/`
2. MCP 服务器: `packages/session-mcp-server/` 或 `packages/bridge-mcp-server/`

**模板：**

```typescript
// 1. 定义工具 (packages/shared/src/agent/my-tool.ts)
export const myToolDefinition = {
  name: 'my_tool',
  description: '执行某个操作',
  input_schema: {
    type: 'object',
    properties: {
      param: { type: 'string', description: '参数说明' }
    },
    required: ['param']
  }
}

// 2. 实现工具处理函数
export async function handleMyTool(
  params: { param: string }
): Promise<string> {
  // 执行操作...
  return '结果'
}
```

---

## 实战案例：添加主题切换功能

### 需求

用户可以在应用级别切换不同的颜色主题。

### 设计

```mermaid
flowchart TD
    subgraph UI层
        A[ThemeSelector 组件]
        B[useTheme Hook]
    end
    
    subgraph IPC层
        C[getAppTheme]
        D[setAppTheme]
        E[onAppThemeChange]
    end
    
    subgraph 主进程
        F[主题配置管理]
        G[文件监听]
    end
    
    subgraph 存储
        H[theme.json]
    end
    
    A --> B
    B --> C
    B --> D
    B --> E
    C --> F
    D --> F
    E --> G
    F --> H
    G --> H
```

### 实现步骤

#### 步骤 1：定义类型

```typescript
// apps/electron/src/shared/types.ts
export interface ThemeOverrides {
  name: string
  colors: {
    primary: string
    background: string
    foreground: string
    // ...
  }
}
```

#### 步骤 2：主进程实现

```typescript
// apps/electron/src/main/theme-manager.ts
import { ipcMain } from 'electron'
import { readJSON, writeJSON } from 'fs-extra'

const THEME_PATH = path.join(app.getPath('userData'), 'theme.json')

export function initThemeHandlers() {
  // 获取主题
  ipcMain.handle('get-app-theme', async () => {
    try {
      return await readJSON(THEME_PATH)
    } catch {
      return null // 返回默认主题
    }
  })
  
  // 设置主题
  ipcMain.handle('set-app-theme', async (_, theme: ThemeOverrides) => {
    await writeJSON(THEME_PATH, theme)
    // 通知所有窗口主题已更改
    BrowserWindow.getAllWindows().forEach(win => {
      win.webContents.send('app-theme-changed', theme)
    })
  })
}
```

#### 步骤 3：预加载脚本

```typescript
// apps/electron/src/preload/index.ts
const api = {
  // ...
  getAppTheme: () => ipcRenderer.invoke('get-app-theme'),
  setAppTheme: (theme: ThemeOverrides) => 
    ipcRenderer.invoke('set-app-theme', theme),
  onAppThemeChange: (callback: (theme: ThemeOverrides) => void) => {
    const handler = (_: any, theme: ThemeOverrides) => callback(theme)
    ipcRenderer.on('app-theme-changed', handler)
    return () => ipcRenderer.removeListener('app-theme-changed', handler)
  }
}
```

#### 步骤 4：创建 Hook

```typescript
// apps/electron/src/renderer/hooks/useTheme.ts
export function useTheme({ appTheme }: { appTheme: ThemeOverrides | null }) {
  const [theme, setTheme] = useState(appTheme)
  
  // 应用主题到 CSS 变量
  useEffect(() => {
    if (theme) {
      Object.entries(theme.colors).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--${key}`, value)
      })
    }
  }, [theme])
  
  const updateTheme = useCallback(async (newTheme: ThemeOverrides) => {
    await window.electronAPI.setAppTheme(newTheme)
    setTheme(newTheme)
  }, [])
  
  return { theme, updateTheme }
}
```

#### 步骤 5：创建 UI 组件

```tsx
// apps/electron/src/renderer/components/ThemeSelector.tsx
export function ThemeSelector({ themes }: { themes: ThemeOverrides[] }) {
  const { theme, updateTheme } = useTheme()
  
  return (
    <div className="grid grid-cols-3 gap-4">
      {themes.map((t) => (
        <button
          key={t.name}
          onClick={() => updateTheme(t)}
          className={cn(
            "p-4 rounded-lg border",
            theme?.name === t.name && "border-primary"
          )}
        >
          <div 
            className="w-full h-8 rounded"
            style={{ background: t.colors.primary }}
          />
          <span>{t.name}</span>
        </button>
      ))}
    </div>
  )
}
```

---

## 最佳实践

### 1. 代码组织

```mermaid
graph TD
    A[功能模块] --> B[index.ts - 导出入口]
    A --> C[types.ts - 类型定义]
    A --> D[utils.ts - 工具函数]
    A --> E[components/ - UI 组件]
    A --> F[hooks/ - 自定义 Hooks]
```

### 2. 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件 | PascalCase | `SessionList.tsx` |
| Hook | use 前缀 | `useSession.ts` |
| 工具函数 | camelCase | `formatDate.ts` |
| 类型 | PascalCase | `SessionConfig` |
| 常量 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |

### 3. 错误处理

```typescript
// 使用 try-catch 处理异步错误
try {
  const result = await someAsyncOperation()
  return result
} catch (error) {
  console.error('操作失败:', error)
  // 返回默认值或抛出自定义错误
  throw new Error('操作失败，请重试')
}
```

### 4. 测试策略

```mermaid
flowchart LR
    A[单元测试] --> B[集成测试]
    B --> C[手动测试]
    
    A --> A1["测试工具函数<br/>测试 Hooks"]
    B --> B1["测试组件交互<br/>测试 IPC 通信"]
    C --> C1["测试用户流程<br/>测试边界情况"]
```

---

## 下一步

- 阅读 [代码结构详解](./CODE_STRUCTURE.md) 了解各模块细节
- 阅读 [调试指南](./DEBUGGING.md) 解决开发中的问题
- 查看 [项目文档](./PROJECT_DOCS.md) 了解更多项目信息
