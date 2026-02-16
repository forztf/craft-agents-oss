import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const filePath = join(process.cwd(), 'apps/electron/src/renderer/components/app-shell/AppShell.tsx')
let content = readFileSync(filePath, 'utf-8')

// Replace standard calls
// Note: We use regex with global flag to replace all occurrences
content = content.replace(/getEditConfig\(([^,]+),\s*activeWorkspace\.rootPath\)/g, 'getEditConfig($1, activeWorkspace.rootPath, tEdit)')

// Replace multiline call for add-source
// This is tricky because of the indentation and newlines.
// Original:
// {...getEditConfig(
//   filter.type === 'api' ? 'add-source-api' :
//   filter.type === 'mcp' ? 'add-source-mcp' :
//   filter.type === 'local' ? 'add-source-local' :
//   'add-source',
//   activeWorkspace.rootPath
// )}

// We can target the closing part:
content = content.replace(/,\s*activeWorkspace\.rootPath\s*\)\s*}/g, ', activeWorkspace.rootPath, tEdit)}')

writeFileSync(filePath, content)
console.log('AppShell.tsx updated')
