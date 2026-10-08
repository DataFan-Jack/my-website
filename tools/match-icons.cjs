const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync('F:/项目/Web/my-website/public/tutorial-data.json', 'utf-8'));
const iconsDir = 'F:/项目/Web/my-website/public/tutorials/icons';
const manifest = JSON.parse(fs.readFileSync(path.join(iconsDir, '_manifest.json'), 'utf-8'));

const have = new Set(Object.keys(manifest));
const used = new Set();

const missing = [];
for (const t of data.tutorials) {
  const key = path.basename(t.file, '.json'); // ai.json -> ai
  if (have.has(key)) {
    used.add(key);
  } else {
    missing.push(t.name + '  (file: ' + t.file + ')');
  }
}

const unused = [...have].filter(k => !used.has(k));

console.log('=== 教程总数 ===', data.tutorials.length);
console.log('=== 缺图教程 (' + missing.length + ') ===');
missing.forEach(x => console.log('  ', x));
console.log('=== 未用到的主页图标 (' + unused.length + ') ===');
unused.forEach(x => console.log('  ', x));
