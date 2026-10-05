import { access, copyFile, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve } from 'node:path';

const outputDir = resolve('dist');
const requiredFiles = ['robots.txt', 'sitemap-index.xml', 'sitemap-0.xml', '404.html'];

for (const file of requiredFiles) {
  await access(resolve(outputDir, file), constants.R_OK);
}

const [robots, sitemapIndex, generatedSitemap] = await Promise.all([
  readFile(resolve(outputDir, 'robots.txt'), 'utf8'),
  readFile(resolve(outputDir, 'sitemap-index.xml'), 'utf8'),
  readFile(resolve(outputDir, 'sitemap-0.xml'), 'utf8'),
]);

if (!robots.includes('Sitemap: https://haojichang.net/sitemap.xml')) {
  throw new Error('robots.txt 中缺少正确的 sitemap 地址。');
}

if (!sitemapIndex.includes('https://haojichang.net/sitemap-0.xml')) {
  throw new Error('sitemap-index.xml 未指向 haojichang.net 的子站点地图。');
}

if (!generatedSitemap.includes('https://haojichang.net/')) {
  throw new Error('sitemap-0.xml 中缺少 haojichang.net 页面地址。');
}

const urlCount = (generatedSitemap.match(/<url>/g) ?? []).length;
if (urlCount < 50) {
  throw new Error(`网站地图 URL 数量异常：当前只有 ${urlCount} 条。`);
}

// 生成标准的单文件 /sitemap.xml，内容直接为完整 <urlset>，不再使用索引跳转。
await copyFile(resolve(outputDir, 'sitemap-0.xml'), resolve(outputDir, 'sitemap.xml'));

const sitemap = await readFile(resolve(outputDir, 'sitemap.xml'), 'utf8');
if (!sitemap.includes('<urlset') || sitemap.includes('<sitemapindex')) {
  throw new Error('sitemap.xml 必须是直接包含全部 URL 的标准 urlset。');
}

console.log(`SEO 文件检查通过：sitemap.xml 共收录 ${urlCount} 个 URL，并直接使用标准 urlset。`);
