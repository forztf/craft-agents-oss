/**
 * 测试需求解析逻辑
 */
import * as fs from 'fs'
import * as path from 'path'

const filePath = path.join(process.cwd(), 'docs/specs/requirements-system/modules/session-management.md')
const content = fs.readFileSync(filePath, 'utf-8')
const lines = content.split('\n')

console.log('文件行数:', lines.length)
console.log('前20行:')
for (let i = 0; i < Math.min(20, lines.length); i++) {
  const line = lines[i]
  console.log(`[${i}] "${line}"`)

  // 测试正则匹配
  const reqMatch = line.match(/^#{3}\s+(REQ-\d+\.\d+):\s+(.*)$/)
  const reqSectionMatch = line.match(/^#{2}\s+Requirements$/)
  const scenarioMatch = line.match(/^#{4}\s+Scenario:?$/)

  if (reqMatch) console.log(`  ✅ 匹配需求: ${reqMatch[1]}`)
  if (reqSectionMatch) console.log(`  ✅ 匹配章节: ${reqSectionMatch[1]}`)
  if (scenarioMatch) console.log(`  ✅ 匹配场景`)
}

console.log('\n检查Requirements章节:')
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Requirements')) {
    console.log(`[${i}] "${lines[i]}" - 匹配: ${!!lines[i].match(/^#{2}\s+Requirements$/)}`)
  }
}

console.log('\n检查REQ匹配:')
for (let i = 0; i < lines.length; i++) {
  const reqMatch = lines[i].match(/^#{3}\s+(REQ-\d+\.\d+):\s+(.*)$/)
  if (reqMatch) {
    console.log(`[${i}] "${lines[i]}" - ✅ 匹配`)
  } else if (lines[i].includes('REQ-')) {
    console.log(`[${i}] "${lines[i]}" - ❌ 未匹配REQ格式`)
  }
}
