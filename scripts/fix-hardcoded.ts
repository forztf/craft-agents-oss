#!/usr/bin/env bun
/**
 * 修复剩余的硬编码文本
 */

async function processFile(filePath: string, replacements: Array<{ pattern: RegExp, replacement: string, desc: string }>) {
  const projectRoot = process.cwd()
  const path = require('path').join(projectRoot, filePath)

  try {
    const content = await Bun.file(path).text()
    let modified = content
    let applied = 0

    for (const { pattern, replacement, desc } of replacements) {
      const before = modified
      modified = modified.replace(pattern, replacement)
      if (modified !== before) {
        applied++
        console.log(`    ✓ ${desc}`)
      }
    }

    if (modified !== content) {
      await Bun.write(path, modified)
      console.log(`  📝 ${filePath}: 已修复 ${applied} 处`)
      return applied
    }
  } catch (e) {
    console.log(`  ⚠️  ${filePath}: ${(e as Error).message}`)
  }
  return 0
}

async function main() {
  console.log('🔧 开始应用硬编码文本修复...\n')

  await processFile('apps/electron/src/renderer/components/app-shell/AppShell.tsx', [
    {
      pattern: /<span className="text-xs font-medium text-muted-foreground">Filter Chats<\/span>/g,
      replacement: '<span className="text-xs font-medium text-muted-foreground">{t(\'Filter Chats\')}</span>',
      desc: 'FilterChats 标题',
    },
    {
      pattern: /<span className="text-muted-foreground">No labels configured<\/span>/g,
      replacement: '<span className="text-muted-foreground">{t(\'No labels configured\')}</span>',
      desc: '无标签配置',
    },
    {
      pattern: /<span className="flex-1">Statuses<\/span>/g,
      replacement: '<span className="flex-1">{t(\'Statuses\')}</span>',
      desc: 'Statuses 标签',
    },
    {
      pattern: /<span className="flex-1">Labels<\/span>/g,
      replacement: '<span className="flex-1">{t(\'Labels\')}</span>',
      desc: 'Labels 标签',
    },
    {
      pattern: /<span className="flex-1">Search<\/span>/g,
      replacement: '<span className="flex-1">{t(\'Search\')}</span>',
      desc: 'Search 按钮',
    },
    {
      pattern: /<div className="px-3 pt-1\.5 pb-1 text-\[11px\] font-medium text-muted-foreground\/60 uppercase tracking-wider">\s*Statuses\s*<\/div>/g,
      replacement: '<div className="px-3 pt-1.5 pb-1 text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider">\n{t(\'Statuses\')}\n</div>',
      desc: 'Statuses 区块标题',
    },
    {
      pattern: /<div className="px-3 pt-1\.5 pb-1 text-\[11px\] font-medium text-muted-foreground\/60 uppercase tracking-wider">\s*Labels\s*<\/div>/g,
      replacement: '<div className="px-3 pt-1.5 pb-1 text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider">\n{t(\'Labels\')}\n</div>',
      desc: 'Labels 区块标题',
    },
    {
      pattern: /label="Flagged"/g,
      replacement: 'label="{t(\'Flagged\')}"',
      desc: 'Flagged 标签',
    },
    {
      pattern: /No matching statuses or labels/g,
      replacement: '{t(\'No matching statuses or labels\')}',
      desc: '无匹配项',
    },
    {
      pattern: /<span className="flex-1">Clear<\/span>/g,
      replacement: '<span className="flex-1">{t(\'Clear\')}</span>',
      desc: 'Clear 按钮',
    },
  ])

  await processFile('apps/electron/src/renderer/components/app-shell/MainContentPanel.tsx', [
    {
      pattern: /<span className="text-sm text-muted-foreground">No sources configured<\/span>/g,
      replacement: '<span className="text-sm text-muted-foreground">{t(\'No sources configured\')}</span>',
      desc: '无来源配置',
    },
    {
      pattern: /<span className="text-sm text-muted-foreground">No skills configured<\/span>/g,
      replacement: '<span className="text-sm text-muted-foreground">{t(\'No skills configured\')}</span>',
      desc: '无技能配置',
    },
    {
      pattern: /<span className="text-sm text-muted-foreground">Select a conversation to get started<\/span>/g,
      replacement: '<span className="text-sm text-muted-foreground">{t(\'Select a conversation to get started\')}</span>',
      desc: '选择会话开始',
    },
  ])

  await processFile('apps/electron/src/renderer/components/app-shell/SessionList.tsx', [
    {
      pattern: /<span className="text-xs text-muted-foreground">No sessions yet<\/span>/g,
      replacement: '<span className="text-xs text-muted-foreground">{t(\'No sessions yet\')}</span>',
      desc: '无会话',
    },
  ])

  await processFile('apps/electron/src/renderer/components/info/Info_DataTable.tsx', [
    {
      pattern: /placeholder="Search tools\.\.\."/g,
      replacement: 'placeholder="{t(\'Search tools...\')}"',
      desc: '搜索工具占位符',
    },
    {
      pattern: /<span className="text-muted-foreground">No tools configured<\/span>/g,
      replacement: '<span className="text-muted-foreground">{t(\'No tools configured\')}</span>',
      desc: '无工具配置',
    },
  ])

  await processFile('apps/electron/src/renderer/components/info/LabelsDataTable.tsx', [
    {
      pattern: /placeholder="Search labels\.\.\."/g,
      replacement: 'placeholder="{t(\'Search labels...\')}"',
      desc: '搜索标签占位符',
    },
  ])

  await processFile('apps/electron/src/renderer/components/info/AutoRulesDataTable.tsx', [
    {
      pattern: /placeholder="Search rules\.\.\."/g,
      replacement: 'placeholder="{t(\'Search rules...\')}"',
      desc: '搜索规则占位符',
    },
  ])

  await processFile('apps/electron/src/renderer/components/info/Info_Page.tsx', [
    {
      pattern: /<div className="text-center text-muted-foreground">Error loading content<\/div>/g,
      replacement: '<div className="text-center text-muted-foreground">{t(\'Error loading content\')}</div>',
      desc: '加载错误信息',
    },
  ])

  await processFile('apps/electron/src/renderer/components/info/Info_StatusBadge.tsx', [
    {
      pattern: /<span>Allowed<\/span>/g,
      replacement: '<span>{t(\'Allowed\')}</span>',
      desc: '允许状态',
    },
    {
      pattern: /<span>Blocked<\/span>/g,
      replacement: '<span>{t(\'Blocked\')}</span>',
      desc: '阻止状态',
    },
  ])

  console.log('\n🎉 修复完成！')
}

main().catch(console.error)
