const fs = require('fs');
const path = require('path');

const htmlPath = process.argv[2];
const outDir = process.argv[3];

const html = fs.readFileSync(htmlPath, 'utf-8');

// 匹配每个教程条目：<a class="item-top" href="dir/file.html"><h4>标题</h4><img alt="X" ... src="data:image/png;base64,..."/><strong>...</strong></a>
const re = /<a class="item-top[^"]*"\s+href="([^"]+\.html)">\s*<h4>(.*?)<\/h4>\s*<img[^>]*alt="([^"]*)"[^>]*src="data:image\/png;base64,([A-Za-z0-9+/=]+)"/g;

const icons = new Map(); // alt -> {file, title, base64}
let m;
while ((m = re.exec(html)) !== null) {
  const [, href, title, alt, b64] = m;
  const dir = href.split('/')[0];
  icons.set(dir, { file: href, title, alt, b64 });
}

fs.mkdirSync(outDir, { recursive: true });

// 写映射表 + 解码 PNG
const manifest = {};
for (const [dir, icon] of icons) {
  const fname = dir + '.png';
  fs.writeFileSync(path.join(outDir, fname), Buffer.from(icon.b64, 'base64'));
  manifest[dir] = { file: fname, title: icon.title, alt: icon.alt };
}

fs.writeFileSync(path.join(outDir, '_manifest.json'), JSON.stringify(manifest, null, 2));
console.log('icons extracted:', icons.size);
console.log('manifest keys:', Object.keys(manifest).slice(0, 10).join(', '));
