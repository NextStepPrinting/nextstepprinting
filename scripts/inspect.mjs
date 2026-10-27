import fs from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
function retrieve(url) {
  return execFileSync('curl.exe', ['--fail','-L','--retry','2','--max-time','45','-sS',url], {maxBuffer:64*1024*1024});
}
const origin = 'https://nextstepprinting.com';
const queue = ['/'];
const seen = new Set();
const assets = new Set();
await fs.mkdir('docs/reference', {recursive:true});
while (queue.length) {
  const route = queue.shift();
  if (seen.has(route)) continue;
  seen.add(route);
  const html = retrieve(origin + route).toString();
  await fs.writeFile(`docs/reference/${route === '/' ? 'home' : route.replaceAll('/', '_')}.html`, html);
  for (const match of html.matchAll(/(?:https?:)?\/\/nextstepprinting\.com\/[^\s"'<>]+/g)) {
    const raw = match[0].split(')')[0].split(';background')[0].replaceAll('&#038;', '&').replaceAll('&amp;', '&');
    const url = raw.startsWith('//') ? 'https:' + raw : raw;
    const u = new URL(url);
    if (u.pathname.startsWith('/wp-content/')) assets.add(url);
    else if (!u.search && /^\/(?:about|contact|get-a-quote|graphic-design|services|our-work|portfolio\/[^/]+)\/$/.test(u.pathname) && !seen.has(u.pathname)) queue.push(u.pathname);
  }
  console.log(route);
}
// Inspect styles as well, including background images and fonts.
const downloaded = new Set();
while (assets.size) {
  const url = assets.values().next().value;
  assets.delete(url);
  const u = new URL(url);
  if (downloaded.has(u.pathname)) continue;
  downloaded.add(u.pathname);
  const destination = path.join('docs/reference/assets', u.pathname);
  let buffer;
  try { buffer = await fs.readFile(destination); } catch {
    try { buffer = retrieve(url); } catch {console.log('FAILED',url); continue;}
  }
  await fs.mkdir(path.dirname(destination), {recursive:true});
  await fs.writeFile(destination, buffer);
  if (/\.css$/.test(u.pathname)) {
    for (const match of buffer.toString().matchAll(/url\(["']?([^)'"\s]+)/g)) {
      const resolved = new URL(match[1], url);
      if (resolved.origin === origin) assets.add(resolved.href);
    }
  }
}
await fs.writeFile('docs/reference/inventory.json', JSON.stringify({routes:[...seen],assets:[...downloaded]},null,2));
console.log(`${seen.size} pages; ${downloaded.size} original assets captured.`);
