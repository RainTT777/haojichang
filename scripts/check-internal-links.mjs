import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const htmlFiles = [];
const walk = (dir) => fs.readdirSync(dir,{withFileTypes:true}).forEach((entry)=>{const full=path.join(dir,entry.name);entry.isDirectory()?walk(full):entry.name.endsWith('.html')&&htmlFiles.push(full)});
walk(dist);

const broken = [];
const mojibake = [];
const badPatterns = ['锟斤拷','濂芥満','绋冲畾','璇勬祴','銆両','鈥?','�'];

for (const file of htmlFiles) {
  const html = fs.readFileSync(file,'utf8');
  const visibleText = html.replace(/<style[\s\S]*?<\/style>/gi,'').replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<[^>]+>/g,' ');
  if (badPatterns.some((pattern)=>visibleText.includes(pattern))) mojibake.push(path.relative(dist,file));
  for (const match of html.matchAll(/(?:href|action)="\/(?!\/)([^"#?]*)/g)) {
    const route = decodeURIComponent(match[1]).replace(/^\/+|\/+$/g,'');
    const target = route ? path.join(dist,route,'index.html') : path.join(dist,'index.html');
    if (!fs.existsSync(target) && !match[1].includes('.')) broken.push({ page:path.relative(dist,file), href:`/${match[1]}` });
  }
}

console.log(JSON.stringify({ pages:htmlFiles.length, brokenLinks:broken.length, mojibakePages:mojibake.length, broken, mojibake },null,2));
if (broken.length || mojibake.length) process.exitCode=1;
