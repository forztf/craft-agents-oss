const fs = require('fs');
const path = require('path');

function getFiles(dir, baseDir = dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getFiles(fullPath, baseDir));
    } else if (entry.name.endsWith('.json')) {
      // Get relative path from base dir
      files.push(path.relative(baseDir, fullPath));
    }
  }
  return files;
}

const enDir = path.resolve('./i18n/locales/en');
const zhDir = path.resolve('./i18n/locales/zh-CN');

const enFiles = getFiles(enDir, enDir);
const zhFiles = getFiles(zhDir, zhDir);

console.log('EN files:', enFiles.length);
console.log('ZH files:', zhFiles.length);

const enSet = new Set(enFiles);
const zhSet = new Set(zhFiles);

const onlyInEn = enFiles.filter(f => !zhSet.has(f));
const onlyInZh = zhFiles.filter(f => !enSet.has(f));

if (onlyInEn.length) {
  console.log('\nOnly in EN:');
  onlyInEn.forEach(f => console.log('  -', f));
}

if (onlyInZh.length) {
  console.log('\nOnly in ZH:');
  onlyInZh.forEach(f => console.log('  -', f));
}

// Check key consistency
console.log('\n\nChecking key consistency in common files...\n');
const commonFiles = enFiles.filter(f => zhSet.has(f));

let issues = [];

commonFiles.forEach(file => {
  const enPath = path.join(enDir, file);
  const zhPath = path.join(zhDir, file);
  const enContent = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  const zhContent = JSON.parse(fs.readFileSync(zhPath, 'utf8'));

  const enKeys = Object.keys(enContent).sort();
  const zhKeys = Object.keys(zhContent).sort();

  const onlyInEnKeys = enKeys.filter(k => !zhKeys.includes(k));
  const onlyInZhKeys = zhKeys.filter(k => !enKeys.includes(k));
  const emptyKeys = Object.keys(zhContent).filter(k => !zhContent[k] || zhContent[k].trim() === '');

  if (onlyInEnKeys.length || onlyInZhKeys.length || emptyKeys.length) {
    issues.push({ file, onlyInEnKeys, onlyInZhKeys, emptyKeys });
  }
});

if (issues.length) {
  console.log(`Found ${issues.length} files with key consistency issues:\n`);
  issues.forEach(issue => {
    console.log(`File: ${issue.file}`);
    if (issue.onlyInEnKeys.length) {
      console.log('  Keys only in EN:', issue.onlyInEnKeys.join(', '));
    }
    if (issue.onlyInZhKeys.length) {
      console.log('  Keys only in ZH:', issue.onlyInZhKeys.join(', '));
    }
    if (issue.emptyKeys.length) {
      console.log('  Empty keys in ZH:', issue.emptyKeys.join(', '));
    }
    console.log('');
  });
} else {
  console.log('All keys are consistent across EN and ZH files!');
}
