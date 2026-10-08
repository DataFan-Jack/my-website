const fs = require('fs');
const path = require('path');

const dataPath = 'F:/项目/Web/my-website/public/tutorial-data.json';
const iconsDir = 'F:/项目/Web/my-website/public/tutorials/icons';
const manifest = JSON.parse(fs.readFileSync(path.join(iconsDir, '_manifest.json'), 'utf-8'));

// 缺图的4个教程 -> 就近复用已有图标
const fallback = {
  'bootstrap.json': 'bootstrap4',
  'cprogramming.json': 'c',
  'python-qt.json': 'python3',
  'quiz.json': 'c',
};

const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

for (const t of data.tutorials) {
  let key = path.basename(t.file, '.json');
  if (!manifest[key] && fallback[t.file]) key = fallback[t.file];
  t.image = manifest[key] ? '/tutorials/icons/' + manifest[key].file : null;
}

fs.writeFileSync(dataPath, JSON.stringify(data, null, 1));
console.log('updated', data.tutorials.length, 'tutorials');
console.log('null images:', data.tutorials.filter(t => !t.image).length);
