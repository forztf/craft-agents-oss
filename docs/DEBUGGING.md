# 常见问题与调试指南

本文档帮助你解决开发过程中遇到的常见问题。

## 📋 目录

- [调试工具](#调试工具)
- [日志系统](#日志系统)
- [常见问题解答](#常见问题解答)
- [调试流程](#调试流程)

---

## 调试工具

### Chrome DevTools

在应用中按 `Cmd+Option+I` (macOS) 或 `Ctrl+Shift+I` (Windows/Linux) 打开开发者工具。

**常用功能：**
- **Console**: 查看日志和错误
- **Network**: 查看网络请求
- **React DevTools**: 检查组件树和状态
- **Elements**: 检查 DOM 和样式

### VS Code 调试配置

创建 `.vscode/launch.json`：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Electron Main",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}",
      "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/electron",
      "args": ["."],
      "outputCapture": "std",
      "sourceMaps": true
    },
    {
      "name": "Debug Renderer",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/apps/electron/src/renderer"
    }
  ]
}
```

### 调试流程图

```mermaid
flowchart TD
    A[发现问题] --> B{问题类型?}
    B -->|UI 问题| C[打开 DevTools]
    B -->|逻辑问题| D[添加日志]
    B -->|IPC 问题| E[检查主进程日志]
    B -->|Agent 问题| F[检查 Agent 日志]
    
    C --> C1[检查 Console 错误]
    C1 --> C2[检查 Elements]
    C2 --> C3[检查 React 组件]
    
    D --> D1[console.log]
    D1 --> D2[debugger 语句]
    
    E --> E1[查看主进程终端输出]
    E1 --> E2[检查 IPC 处理器]
    
    F --> F1[查看日志文件]
    F1 --> F2[检查 Agent 状态]
    
    C3 --> G[定位问题]
    D2 --> G
    E2 --> G
    F2 --> G
    
    G --> H[修复问题]
    H --> I[验证修复]
    I --> J{问题解决?}
    J -->|否| A
    J -->|是| K[完成]
```

---

## 日志系统

### 日志位置

| 系统 | 日志路径 |
|------|----------|
| **macOS** | `~/Library/Logs/Craft Agents/` |
| **Windows** | `%USERPROFILE%\AppData\Roaming\Craft Agents\logs\` |
| **Linux** | `~/.config/craft-agents/logs/` |

### 日志文件说明

| 文件 | 内容 |
|------|------|
| `main.log` | 主进程日志 |
| `renderer.log` | 渲染进程日志 |
| `agent.log` | Agent 交互日志 |

### 查看实时日志

**macOS:**
```bash
tail -f ~/Library/Logs/Craft\ Agents/main.log
```

**Windows (PowerShell):**
```powershell
Get-Content "$env:APPDATA\Craft Agents\logs\main.log" -Wait
```

**Linux:**
```bash
tail -f ~/.config/craft-agents/logs/main.log
```

### 添加自定义日志

```typescript
// 在主进程中
import { logger } from './logger'

logger.info('操作成功', { sessionId, result })
logger.error('操作失败', { error: error.message })
logger.debug('调试信息', { data })

// 在渲染进程中
console.log('[Debug] 信息:', data)
```

---

## 常见问题解答

### 安装和启动问题

#### Q: `bun install` 失败

**解决方案：**
```bash
# 清除缓存
bun pm cache rm

# 删除依赖
rm -rf node_modules bun.lock

# 重新安装
bun install
```

#### Q: Electron 窗口空白

**排查步骤：**

```mermaid
flowchart TD
    A[窗口空白] --> B{DevTools 有错误?}
    B -->|是| C[根据错误修复]
    B -->|否| D{Vite 服务器运行?}
    D -->|否| E[检查端口占用]
    D -->|是| F[检查主进程日志]
    E --> G[重启开发服务器]
    F --> H[检查 IPC 通信]
```

**解决方案：**
1. 打开 DevTools 检查控制台错误
2. 确认 Vite 开发服务器已启动 (端口 5173)
3. 检查终端是否有错误输出

#### Q: Windows 上 PowerShell 脚本无法执行

**解决方案：**
```powershell
# 修改执行策略
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 运行时问题

#### Q: API 调用返回错误

**排查流程：**

```mermaid
sequenceDiagram
    participant User as 用户
    participant App as 应用
    participant Agent as Agent
    participant API as API 服务

    User->>App: 发送消息
    App->>Agent: 调用 Agent
    Agent->>API: API 请求
    
    alt API 错误
        API-->>Agent: 错误响应
        Agent-->>App: 错误事件
        App-->>User: 显示错误
    else 网络错误
        API--xAgent: 超时/断开
        Agent-->>App: 网络错误
        App-->>User: 重试提示
    end
```

**检查清单：**
- [ ] API Key 是否正确配置
- [ ] 网络连接是否正常
- [ ] API 配额是否用尽
- [ ] 查看日志中的详细错误信息

#### Q: 会话数据丢失

**可能原因：**
1. 工作区切换
2. 文件系统权限问题
3. 磁盘空间不足

**解决方案：**
```bash
# 检查数据目录
ls -la ~/.craft-agent/workspaces/

# 检查磁盘空间
df -h

# 检查文件权限
chmod -R 755 ~/.craft-agent/
```

#### Q: MCP 服务器连接失败

**排查步骤：**

```mermaid
flowchart TD
    A[MCP 连接失败] --> B{配置正确?}
    B -->|否| C[检查配置文件]
    B -->|是| D{服务器可访问?}
    D -->|否| E[检查网络/进程]
    D -->|是| F{认证正确?}
    F -->|否| G[更新凭证]
    F -->|是| H[查看详细日志]
    
    C --> I[修复配置]
    E --> J[启动服务器]
    G --> K[重新认证]
    H --> L[分析错误原因]
```

### 开发问题

#### Q: 热重载不工作

**解决方案：**
1. 检查 Vite 配置是否正确
2. 确认文件监听数量限制 (Linux)
3. 重启开发服务器

```bash
# Linux 增加文件监听数量
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

#### Q: TypeScript 类型错误

**解决方案：**
```bash
# 运行类型检查
bun run typecheck:all

# 查看具体错误
# 根据错误信息修复类型定义
```

#### Q: IPC 通信失败

**调试方法：**

```typescript
// 主进程：添加日志
ipcMain.handle('my-channel', async (event, data) => {
  console.log('[IPC] 收到请求:', data)
  try {
    const result = await doSomething(data)
    console.log('[IPC] 返回结果:', result)
    return result
  } catch (error) {
    console.error('[IPC] 处理失败:', error)
    throw error
  }
})

// 渲染进程：添加日志
const result = await window.electronAPI.myChannel(data)
console.log('[Renderer] IPC 结果:', result)
```

---

## 调试流程

### 问题定位流程

```mermaid
flowchart TD
    A[发现问题] --> B[复现问题]
    B --> C[收集信息]
    C --> D{问题类型}
    
    D -->|UI 问题| E1[检查组件]
    D -->|数据问题| E2[检查状态]
    D -->|网络问题| E3[检查请求]
    D -->|逻辑问题| E4[检查代码]
    
    E1 --> F1[检查 Props]
    F1 --> F2[检查 State]
    F2 --> F3[检查渲染]
    
    E2 --> G1[检查 Atom]
    G1 --> G2[检查更新]
    G2 --> G3[检查持久化]
    
    E3 --> H1[检查 URL]
    H1 --> H2[检查参数]
    H2 --> H3[检查响应]
    
    E4 --> I1[添加日志]
    I1 --> I2[跟踪变量]
    I2 --> I3[检查分支]
    
    F3 --> J[定位根因]
    G3 --> J
    H3 --> J
    I3 --> J
    
    J --> K[修复问题]
    K --> L[验证修复]
    L --> M{问题解决?}
    M -->|否| B
    M -->|是| N[提交修复]
```

### 调试技巧总结

| 技巧 | 适用场景 | 方法 |
|------|----------|------|
| **console.log** | 快速查看变量值 | `console.log('变量:', value)` |
| **debugger** | 逐步执行代码 | 在代码中添加 `debugger` |
| **React DevTools** | 检查组件状态 | 安装 React DevTools 扩展 |
| **Network 面板** | 检查网络请求 | DevTools → Network |
| **日志文件** | 查看历史日志 | 查看 `~/Library/Logs/Craft Agents/` |

---

## 获取帮助

如果以上方法都无法解决问题：

1. **查看项目文档**: `docs/` 目录下的其他文档
2. **搜索 Issues**: 在 GitHub Issues 中搜索类似问题
3. **提交 Issue**: 提供详细的问题描述和复现步骤

**提交 Issue 时请包含：**
- 操作系统和版本
- Node.js/Bun 版本
- 错误信息和日志
- 复现步骤
- 预期行为和实际行为

---

## 下一步

- 阅读 [项目架构概览](./ARCHITECTURE.md) 了解项目结构
- 阅读 [修改功能指南](./MODIFYING_FEATURES.md) 学习修改代码
- 阅读 [添加新功能指南](./ADDING_FEATURES.md) 学习开发新功能
