import { access, copyFile, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve } from 'node:path';

const outputDir = resolve('dist');
const requiredFiles = ['robots.txt', 'sitemap-index.xml', 'sitemap-0.xml', '404.html'];

for (const file of requiredFiles) {
  await access(resolve(outputDir, file), constants.R_OK);
}

const [robots, sitemapIndex, sitemap] = await Promise.all([
  readFile(resolve(outputDir, 'robots.txt'), 'utf8'),
  readFile(resolve(outputDir, 'sitemap-index.xml'), 'utf8'),
  readFile(resolve(outputDir, 'sitemap-0.xml'), 'utf8'),
]);

if (!robots.includes('Sitemap: https://haojichang.net/sitemap-index.xml')) {
  throw new Error('robots.txt 中缺少正确的 sitemap 地址。');
}

if (!sitemapIndex.includes('https://haojichang.net/sitemap-0.xml')) {
  throw new Error('sitemap-index.xml 未指向 haojichang.net 的子站点地图。');
}

if (!sitemap.includes('https://haojichang.net/')) {
  throw new Error('sitemap-0.xml 中缺少 haojichang.net 页面地址。');
}

// 同时生成常见的 /sitemap.xml 别名，便于站长平台与人工检查。
await copyFile(resolve(outputDir, 'sitemap-index.xml'), resolve(outputDir, 'sitemap.xml'));

console.log('SEO 文件检查通过：robots.txt、sitemap-index.xml、sitemap-0.xml、sitemap.xml、404.html');
