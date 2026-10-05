import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const rootIndex = path.join(root, 'index.html');

function listHtml(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? listHtml(full) : entry.name.endsWith('.html') ? [full] : [];
  });
}

function routeTarget(urlPath) {
  if (urlPath === '/') return path.join(dist, 'index.html');
  const clean = decodeURIComponent(urlPath.split(/[?#]/)[0]).replace(/^\/+|\/+$/g, '');
  return path.join(dist, clean, 'index.html');
}

function inlineCss(html) {
  return html.replace(/<link rel="stylesheet" href="([^"]+)">/g, (_, href) => {
    const cssFile = path.join(dist, href.replace(/^\//, ''));
    return fs.existsSync(cssFile) ? `<style data-local-preview-css>${fs.readFileSync(cssFile, 'utf8')}</style>` : '';
  });
}

function localize(html, outputFile) {
  const outputDir = path.dirname(outputFile);
  html = inlineCss(html);
  html = html.replace(/(href|action)="\/(?!\/)([^"#?]*)([?#][^"]*)?"/g, (_, attr, route, suffix = '') => {
    const target = routeTarget(`/${route}`);
    let relative = path.relative(outputDir, target).replaceAll('\\', '/');
    if (!relative.startsWith('.')) relative = `./${relative}`;
    return `${attr}="${relative}${suffix}"`;
  });
  return html.replace('</head>', '<meta name="local-preview" content="all-pages-inline-css"></head>');
}

if (!fs.existsSync(path.join(dist, 'index.html'))) throw new Error('未找到 dist，请先运行 npm.cmd run build。');

const files = listHtml(dist);
const originals = new Map(files.map((file) => [file, fs.readFileSync(file, 'utf8')]));

for (const file of files) fs.writeFileSync(file, localize(originals.get(file), file), 'utf8');

// 根目录 index.html 是最方便的双击入口，所有站内链接指向 dist 内对应页面。
fs.writeFileSync(rootIndex, localize(originals.get(path.join(dist, 'index.html')), rootIndex), 'utf8');

console.log(`已生成 ${files.length} 个全站本地预览页面，并更新：${rootIndex}`);
