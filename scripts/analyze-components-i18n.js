const fs = require('fs');
const path = require('path');

// 收集所有组件文件
function getAllComponentFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getAllComponentFiles(filePath, fileList);
    } else if (file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

// 分析单个组件
function analyzeComponent(filePath) {
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch (err) {
    return {
      file: filePath,
      error: `无法读取文件: ${err.message}`,
    };
  }

  const result = {
    file: filePath,
    componentName: path.basename(filePath, '.tsx'),
    relativePath: path.relative('C:\\code\\AI\\craft-agents-i18n\\apps\\electron\\src\\renderer\\components', filePath),
    hasI18nImport: false,
    usesI18nHooks: false,
    i18nImports: [],
    hardcodedStrings: [],
    hardcodedCount: 0,
    estimatedEffort: 0,
    status: 'pending',
    notes: [],
  };

  // 检查 i18n 导入
  const i18nImportPatterns = [
    /import\s+{[^}]*useTranslations[^}]*}\s+from\s+['"]@\/i18n['"]/,
    /import\s+{[^}]*t['"]?[^}]*}\s+from\s+['"]@\/i18n['"]/,
    /import\s+{[^}]*trans[^}]*}\s+from\s+['"]@\/i18n['"]/,
    /import\s+\*\s+as\s+i18n\s+from\s+['"]@\/i18n['"]/,
  ];

  i18nImportPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      result.hasI18nImport = true;
      const match = content.match(pattern);
      if (match) {
        result.i18nImports.push(match[0]);
      }
    }
  });

  // 检查使用 i18n hooks
  const i18nUsagePatterns = [
    /useTranslations\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
    /useTranslation\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
    /\bt\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
    /trans\s*\{/g,
    /<Trans\s+/g,
  ];

  i18nUsagePatterns.forEach(pattern => {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      result.usesI18nHooks = true;
      break;
    }
  });

  // 查找硬编码字符串（排除某些模式）
  const hardcodePatterns = [
    // 在标签内容中的字符串
    />([^<{>\s][^<>\n]{2,})</g,
    // 在属性中的字符串（如 title, placeholder, aria-label）
    /(title|placeholder|aria-label|aria-description|alt|label)=["']([^"']{2,})["']/g,
    // Button 文本
    /<Button[^>]*>([^<>\n]+)<\/Button>/g,
    // 在 JSX 表达式中直接使用的字符串
    /{["']([^"']{3,})["']}/g,
  ];

  // 排除的模式（这些不需要国际化）
  const excludePatterns = [
    /^[A-Z_][A-Z0-9_]*$/, // 常量如 ACTIVE
    /^[a-z-]+$/, // CSS 类名
    /^[a-z][a-z0-9]*$/, // HTML 标签名
    /^[#./][a-zA-Z0-9-_./]+$/, // 图标、路径
    /^\s*$/, // 空字符串
    /^[{}<>]+$/, // 仅包含符号
    /\{\|/, // 嵌套表达式标记
    /\/\*/, // 注释开始
    /\*\//, // 注释结束
    /className=|class=/, // className 属性
    /css=|style=/, // css 样式
    /key=/, // key 属性
    /id=/, // id 属性
    /type=/, // type 属性
    /value=/, // value 属性（排除）
    /onClick|onMouse|onChange|onFocus|onBlur/, // 事件处理器
    /ref=/, // ref
    /data-/, // data 属性
    /theme-/, // theme 属性
    /variant/, // variant
    /size/, // size
    /Icon/, // 图标组件
    /\/>/, // 自闭合标签
    /[{}]/, // 大括号内的表达式
    /width=|height=|size=/, // 尺寸属性
    /x=|y=|cx=|cy=|r=/, // SVG 属性
    /d=/, // SVG path d
    /viewBox/, // SVG viewBox
    /fill=/, // SVG fill
    /stroke=/, // SVG stroke
  ];

  const foundStrings = new Set();
  const stringsWithContext = [];

  hardcodePatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const fullText = match[0];
      let text = match[2] || match[1];

      // 提取文本内容
      if (match[1] && !match[2]) {
        // 对于 >text< 模式
        const innerMatch = fullText.match(/>([^<{>\n][^<>\n]+)</);
        if (innerMatch) {
          text = innerMatch[1];
        }
      }

      // 清理文本
      text = text.trim();

      // 跳过短字符串和纯符号
      if (text.length < 2 || /^[{}<>\s]+$/.test(text)) continue;

      // 检查是否应该排除
      let shouldExclude = false;
      excludePatterns.forEach(excludePattern => {
        if (excludePattern.test(text) || excludePattern.test(fullText)) {
          shouldExclude = true;
        }
      });

      // 特殊检查：看起来像 CSS、常量或技术术语的字符串
      if (/^[a-z-]+$/.test(text) && text.length < 10) shouldExclude = true;
      if (/^[A-Z_][A-Z0-9_]*$/.test(text)) shouldExclude = true;
      if (/^#[0-9a-fA-F]{3,6}$/.test(text)) shouldExclude = true; // 颜色值
      if (/^\d+(px|rem|em|vh|vw|%)?$/.test(text)) shouldExclude = true; // 尺寸值
      if (/^[a-z]+(?:-[a-z]+)*$/.test(text) && text.length < 15) shouldExclude = true; // CSS 类风格

      // 过滤掉已经使用 i18n 的调用
      if (/useTranslations|useTranslation|trans\{/.test(text)) shouldExclude = true;

      if (!shouldExclude && text.length >= 2) {
        // 避免重复
        const key = text.substring(0, 50);
        if (!foundStrings.has(key)) {
          foundStrings.add(key);
          stringsWithContext.push({
            text: text.substring(0, 100),
            context: fullText.substring(0, 80),
          });
        }
      }
    }
  });

  result.hardcodedStrings = stringsWithContext.slice(0, 20); // 只保留前20个作为示例
  result.hardcodedCount = foundStrings.size;

  // 判断状态
  if (result.usesI18nHooks && result.hardcodedCount === 0) {
    result.status = 'completed';
  } else if (result.usesI18nHooks && result.hardcodedCount > 0) {
    result.status = 'partial';
    result.notes.push('已使用 i18n 但仍有硬编码字符串');
  } else if (result.hasI18nImport && !result.usesI18nHooks) {
    result.status = 'imported_but_unused';
    result.notes.push('已导入 i18n 但未使用');
  } else {
    result.status = 'not_started';
    result.notes.push('未进行国际化改造');
  }

  // 估算工作量
  if (result.hardcodedCount > 0) {
    result.estimatedEffort = Math.ceil(result.hardcodedCount * 0.5); // 每个字符串约30分钟
  } else if (result.status === 'completed') {
    result.estimatedEffort = 0;
  } else {
    result.estimatedEffort = 0.5; // 至少需要30分钟
  }

  return result;
}

// 主函数
function main() {
  const componentsDir = 'C:\\code\\AI\\craft-agents-i18n\\apps\\electron\\src\\renderer\\components';

  console.log('开始扫描组件文件...');
  const componentFiles = getAllComponentFiles(componentsDir);
  console.log(`找到 ${componentFiles.length} 个组件文件`);

  console.log('分析组件国际化状态...');
  const analysisResults = [];

  componentFiles.forEach((filePath, index) => {
    console.log(`分析进度: ${index + 1}/${componentFiles.length} - ${path.basename(filePath)}`);
    const result = analyzeComponent(filePath);
    analysisResults.push(result);
  });

  // 统计
  const stats = {
    total: analysisResults.length,
    completed: analysisResults.filter(r => r.status === 'completed').length,
    partial: analysisResults.filter(r => r.status === 'partial').length,
    imported_but_unused: analysisResults.filter(r => r.status === 'imported_but_unused').length,
    not_started: analysisResults.filter(r => r.status === 'not_started').length,
    totalHardcodedStrings: analysisResults.reduce((sum, r) => sum + r.hardcodedCount, 0),
    totalEstimatedEffort: analysisResults.reduce((sum, r) => sum + r.estimatedEffort, 0),
  };

  // 按优先级排序
  const priorityOrder = ['partial', 'not_started', 'imported_but_unused', 'completed'];
  analysisResults.sort((a, b) => {
    const priorityA = priorityOrder.indexOf(a.status);
    const priorityB = priorityOrder.indexOf(b.status);
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    // 相同状态按硬编码字符串数量排序
    return b.hardcodedCount - a.hardcodedCount;
  });

  const report = {
    generatedAt: new Date().toISOString(),
    summary: stats,
    components: analysisResults,
  };

  // 输出结果
  const outputPath = 'C:\\code\\AI\\craft-agents-i18n\\test-results\\i18n-component-analysis.json';
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`\n分析完成！结果已保存到: ${outputPath}`);

  // 打印摘要
  console.log('\n=== 国际化改造摘要 ===');
  console.log(`总组件数: ${stats.total}`);
  console.log(`已完成: ${stats.completed}`);
  console.log(`部分完成: ${stats.partial}`);
  console.log(`已导入但未使用: ${stats.imported_but_unused}`);
  console.log(`未开始: ${stats.not_started}`);
  console.log(`总硬编码字符串数: ${stats.totalHardcodedStrings}`);
  console.log(`预估总工作量: ${stats.totalEstimatedEffort} 小时`);
}

main();