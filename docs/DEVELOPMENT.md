# 开发环境搭建指南

本文档帮助你快速搭建 Craft Agents 的开发环境。

## 📋 目录

- [环境要求](#环境要求)
- [安装步骤](#安装步骤)
- [运行项目](#运行项目)
- [调试技巧](#调试技巧)
- [常见问题](#常见问题)

---

## 环境要求

### 必需软件

| 软件 | 最低版本 | 推荐版本 | 说明 |
|------|----------|----------|------|
| **Bun** | 1.0+ | 最新版 | JavaScript 运行时和包管理器 |
| **Node.js** | 18+ | 20+ | 可选，某些工具可能需要 |
| **Git** | 2.0+ | 最新版 | 版本控制 |

### 操作系统支持

- **macOS**: 10.15 (Catalina) 或更高
- **Windows**: Windows 10 或更高
- **Linux**: Ubuntu 20.04+ 或其他主流发行版

### API 密钥

你需要以下任一 API 密钥：

- **Anthropic API Key**: 用于 Claude AI
- **OpenAI 账户**: 用于 Codex (OAuth 登录)

---

## 安装步骤

### 1. 安装 Bun

**macOS / Linux:**
```bash
curl -fsSL https://bun.sh/install | bash
```

**Windows (PowerShell):**
```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

验证安装：
```bash
bun --version
```

### 2. 克隆项目

```bash
git clone https://github.com/forztf/craft-agents-oss.git
cd craft-agents-oss
```

### 3. 安装依赖

```bash
bun install
```

这会安装所有依赖，包括：
- Electron
- React
- Claude Agent SDK
- 其他共享包

### 4. 配置环境变量 (可选)

如果需要 OAuth 集成 (Slack, Microsoft)，创建 `.env` 文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件：
```env
MICROSOFT_OAUTH_CLIENT_ID=your-client-id
SLACK_OAUTH_CLIENT_ID=your-slack-client-id
SLACK_OAUTH_CLIENT_SECRET=your-slack-secret
```

---

## 运行项目

### 开发模式 (热重载)

```bash
bun run electron:dev
```

这会：
1. 启动 Vite 开发服务器 (渲染进程)
2. 启动 Electron 主进程
3. 启用热重载 (修改代码自动刷新)

### 生产构建

```bash
# 构建并运行
bun run electron:start

# 仅构建
bun run build
```

### 类型检查

```bash
bun run typecheck:all
```

---

## 调试技巧

### 1. 查看日志

**开发模式日志位置:**

| 系统 | 日志路径 |
|------|----------|
| macOS | `~/Library/Logs/Craft Agents/` |
| Windows | `%USERPROFILE%\AppData\Roaming\Craft Agents\logs\` |
| Linux | `~/.config/craft-agents/logs/` |

**查看实时日志 (macOS):**
```bash
tail -f ~/Library/Logs/Craft\ Agents/main.log
```

### 2. 打开开发者工具

在应用中按 `Cmd+Option+I` (macOS) 或 `Ctrl+Shift+I` (Windows/Linux) 打开 Chrome DevTools。

### 3. 主进程调试

在 VS Code 中添加 launch.json 配置：

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
      "outputCapture": "std"
    }
  ]
}
```

### 4. 添加调试日志

在代码中添加：
```typescript
console.log('[Debug] 变量值:', someVariable)
```

开发模式下，日志会输出到终端和 DevTools 控制台。

---

## 项目脚本说明

| 脚本 | 说明 |
|------|------|
| `bun run electron:dev` | 开发模式 (热重载) |
| `bun run electron:start` | 构建并运行 |
| `bun run build` | 构建生产版本 |
| `bun run typecheck:all` | 类型检查所有包 |
| `bun run lint` | 代码检查 |
| `bun run test` | 运行测试 |

---

## 常见问题

### Q: `bun install` 失败？

**A:** 尝试以下步骤：
1. 清除缓存: `bun pm cache rm`
2. 删除 `node_modules` 和 `bun.lock`
3. 重新运行 `bun install`

### Q: Electron 窗口空白？

**A:** 检查以下几点：
1. 确认 Vite 开发服务器已启动
2. 检查终端是否有错误信息
3. 打开 DevTools 查看控制台错误

### Q: API 调用失败？

**A:** 确认：
1. API Key 已正确配置
2. 网络连接正常
3. 检查日志中的详细错误信息

### Q: Windows 上 PowerShell 命令失败？

**A:** 确保：
1. 使用 PowerShell 7+ 或 Windows Terminal
2. 执行策略允许运行脚本:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

---

## 下一步

- 阅读 [项目架构概览](./ARCHITECTURE.md) 了解项目结构
- 阅读 [修改功能指南](./MODIFYING_FEATURES.md) 学习如何修改代码
- 阅读 [添加新功能指南](./ADDING_FEATURES.md) 学习如何开发新功能
