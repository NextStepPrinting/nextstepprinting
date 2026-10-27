import fs from 'node:fs/promises';
import path from 'node:path';
async function files(dir){const entries=await fs.readdir(dir,{withFileTypes:true});return (await Promise.all(entries.map(e=>e.isDirectory()?files(path.join(dir,e.name)):path.join(dir,e.name)))).flat();}
const all=await files('public');const errors=[];const references=new Set();
for(const file of all.filter(f=>/\.(html|css|js)$/.test(f))){
  const text=await fs.readFile(file,'utf8');
  if(/movementgarage|Powered by|smooth_scroll\/|SmoothScroll\.min|wp-json|wp-admin|xmlrpc\.php/i.test(text))errors.push(`Forbidden provider/runtime reference: ${file}`);
  if(/re_[A-Za-z0-9]{20,}|Bearer\s+[A-Za-z0-9_]{20,}/.test(text))errors.push(`Possible secret: ${file}`);
  for(const m of text.matchAll(/(?:href|src)=["'](\/[^"'#?]*)|url\(["']?(\/[^)'"?#\s]*)/g))references.add(m[1]||m[2]);
  if(file.endsWith('.html')){
    for(const match of text.matchAll(/srcset="([^"]+)"/g))for(const source of match[1].split(','))references.add(source.trim().split(/\s/)[0]);
    if(!text.includes('<link rel="canonical"'))errors.push(`Missing canonical: ${file}`);
  }
}
for(const ref of references){if(ref.startsWith('/api/')||ref.startsWith('https:'))continue;let target=path.join('public',decodeURIComponent(ref));try{if((await fs.stat(target)).isDirectory())target=path.join(target,'index.html');await fs.access(target);}catch{errors.push(`Missing local target: ${ref}`);}}
if(errors.length){console.error([...new Set(errors)].join('\n'));process.exitCode=1;}else console.log(`Checked ${all.filter(f=>f.endsWith('.html')).length} pages and ${references.size} local route/asset references; no forbidden runtime dependencies or secret patterns.`);
