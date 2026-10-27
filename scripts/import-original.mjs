// One-time migration aid. Normal edits belong in public/; this is NOT a build step.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {browser} from './browser.mjs';
const inventory=JSON.parse(await fs.readFile('docs/reference/inventory.json','utf8'));
const map={};
for(const original of inventory.assets) {
  const ext=path.extname(original).toLowerCase();
  if(!/\.(css|png|jpe?g|gif|svg|webp|woff2?|ttf|eot|mp4|pdf)$/.test(ext)) continue;
  const key=createHash('sha1').update(original).digest('hex').slice(0,8);
  map[original]=original.startsWith('/wp-content/uploads/') && !original.endsWith('.css')
    ? original.replace('/wp-content/uploads/','/assets/images/')
    : `/assets/${ext==='.css'?'styles':'fonts'}/${key}-${path.basename(original)}`;
}
function rewrite(text, base='https://nextstepprinting.com/') {
  return text.replace(/url\(["']?([^)'"\s]+)["']?\)/g,(whole,url)=>{
    if(url.startsWith('data:'))return whole;
    const u=new URL(url,base);
    return map[u.pathname]?`url('${map[u.pathname]}')`:whole;
  }).replace(/(?:https?:)?\/\/nextstepprinting\.com\/[^\s"'<>),]*/g,url=>{
    const u=new URL(url.startsWith('//')?'https:'+url:url);
    return map[u.pathname]||u.pathname+u.search+u.hash;
  });
}
for(const [original,destination] of Object.entries(map)) {
  const source='docs/reference/assets'+original;
  const target='public'+destination;
  await fs.mkdir(path.dirname(target),{recursive:true});
  try {
    if(original.endsWith('.css')) {
      const css=await fs.readFile(source,'utf8');
      await fs.writeFile(target,rewrite(css,'https://nextstepprinting.com'+original));
    }else await fs.copyFile(source,target);
  }catch(e){console.log('Missing original',original);delete map[original];}
}
// The same Montserrat family/weights requested by the live site, hosted locally.
const fontCSS=execFileSync('curl.exe',['-fsSL','--max-time','45','https://fonts.googleapis.com/css?family=Montserrat:100,200,300,400,700'],{encoding:'utf8'});
let localFonts=fontCSS;
for(const url of new Set([...fontCSS.matchAll(/https:\/\/fonts\.gstatic\.com\/[^)\s]+/g)].map(m=>m[0]))) {
  const filename=path.basename(new URL(url).pathname);
  await fs.mkdir('public/assets/fonts',{recursive:true});
  await fs.writeFile('public/assets/fonts/'+filename,execFileSync('curl.exe',['-fsSL','--max-time','45',url]));
  localFonts=localFonts.replaceAll(url,'/assets/fonts/'+filename);
}
await fs.writeFile('public/assets/styles/fonts.css',localFonts);
const b=await browser(9334);
const report=[];
for(const route of inventory.routes) {
  const raw=await fs.readFile(`docs/reference/${route==='/'?'home':route.replaceAll('/','_')}.html`,'utf8');
  const result=await b.evaluate(`(()=>{
    const d=new DOMParser().parseFromString(${JSON.stringify(raw)},'text/html');
    const styles=[...d.querySelectorAll('link[rel="stylesheet"]')].map(e=>e.getAttribute('href')).filter(e=>!e.includes('googleapis'));
    const header=d.querySelector('header');
    const menu=[...header.querySelectorAll('.main-menu-link')].map(e=>({href:e.getAttribute('href'),text:e.textContent.trim()}));
    const logo=header.querySelector('.site-logo-img');
    const nav=d.createElement('header');nav.className='nsp-header';
    nav.innerHTML='<div class="nsp-header-inner"><a class="nsp-logo" href="/"><img src="'+logo.getAttribute('src')+'" alt="Next Step Printing"></a><button class="nsp-menu-toggle" type="button" aria-expanded="false" aria-controls="nsp-menu" aria-label="Open menu"><span></span><span></span><span></span></button></div><nav id="nsp-menu" aria-label="Main navigation" hidden>'+menu.map(e=>'<a href="'+e.href+'"'+(new URL(e.href).pathname===${JSON.stringify(route)}?' aria-current="page"':'')+'>'+e.text+'</a>').join('')+'</nav>';
    header.replaceWith(nav);
    for(const e of d.querySelectorAll('script,iframe[src*="facebook"],#page-loading,#zn-nav-overlay,.login_register_stuff,#fb-root,#wpadminbar'))e.remove();
    for(const e of d.querySelectorAll('a[href*="movementgarage"]')) {
      let span=e.parentElement;
      if(span.textContent.includes('Powered by'))span.remove();else e.remove();
    }
    for(const e of d.querySelectorAll('.__cf_email__')) {
      const h=e.dataset.cfemail;if(!h)continue;
      const k=parseInt(h.slice(0,2),16);let s='';for(let i=2;i<h.length;i+=2)s+=String.fromCharCode(parseInt(h.slice(i,i+2),16)^k);
      e.textContent=s;const a=e.closest('a');if(a)a.setAttribute('href','mailto:'+s);e.removeAttribute('data-cfemail');e.classList.remove('__cf_email__');
    }
    for(const a of d.querySelectorAll('a[href*="/cdn-cgi/l/email-protection#"]')) {
      const h=a.getAttribute('href').split('#')[1];const k=parseInt(h.slice(0,2),16);let s='';
      for(let i=2;i<h.length;i+=2)s+=String.fromCharCode(parseInt(h.slice(i,i+2),16)^k);
      a.setAttribute('href','mailto:'+s);
    }
    const main=d.querySelector('.zn_pb_wrapper')||d.querySelector('#content');if(main){main.setAttribute('role','main');if(main.id!=='content')main.id='main-content';else d.querySelector('.skip-link')?.setAttribute('href','#content');}
    for(const e of d.querySelectorAll('*')) {
      for(const a of [...e.attributes])if(a.name.startsWith('on')||a.name.startsWith('data-rellax')||a.name==='data-znanim')e.removeAttribute(a.name);
      if(e.getAttribute('data-target')==='smoothscroll')e.removeAttribute('data-target');
      e.classList.remove('zn_parallax','js-znParallax','js-doObjParallax','zn-objParallax','zn-objParallax--ease-linear');
    }
    for(const e of d.querySelectorAll('a[href="#"]'))if(e.id==='totop')e.href='#top';
    for(const e of d.querySelectorAll('.zn-bgSource-imageParallax'))e.classList.remove('zn-bgSource-imageParallax');
    const form=d.querySelector('form');
    if(form){
      form.action='/api/quote';form.dataset.quoteForm='';
      const names=['name','email','phone','city','projectType','details'];
      [...form.querySelectorAll('input:not([type="hidden"]),textarea')].forEach((e,i)=>{e.name=names[i];e.required=true;e.maxLength=i===5?6000:i===0?100: i===1?254: i===2?50:150;e.setAttribute('placeholder',' ');if(i===1)e.type='email';if(i===2)e.type='tel';if(i===0)e.autocomplete='name';if(i===1)e.autocomplete='email';if(i===2)e.autocomplete='tel';if(i===3)e.autocomplete='address-level2';});
      form.querySelector('.zn_cf_hidden')?.remove();
      const spam=d.createElement('div');spam.className='nsp-honeypot';spam.setAttribute('aria-hidden','true');spam.innerHTML='<label>Leave this blank<input name="website" tabindex="-1" autocomplete="off"></label>';
      form.append(spam);
      const id=d.createElement('input');id.type='hidden';id.name='submissionId';form.append(id);
      const status=form.querySelector('.zn_contact_ajax_response');status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.dataset.formStatus='';
      const nojs=d.createElement('noscript');nojs.innerHTML='<p>JavaScript is required to submit this form. You can also email <a href="mailto:info@nextstepprinting.com">info@nextstepprinting.com</a>.</p>';form.append(nojs);
    }
    const skip=d.createElement('a');skip.href=main?.id==="content"?'#content':'#main-content';skip.className='skip-link';skip.textContent='Skip to content';d.body.prepend(skip);
    d.body.id='top';
    const walker=d.createTreeWalker(d.body,NodeFilter.SHOW_COMMENT);const comments=[];while(walker.nextNode())comments.push(walker.currentNode);comments.forEach(e=>e.remove());
    return {title:d.title,styles,body:d.body.innerHTML,bodyClass:d.body.className,metadata:[...d.querySelectorAll('meta[name="description"],meta[property^="og:"],meta[name^="twitter:"]')].map(e=>e.outerHTML),forms:form?1:0};
  })()`);
  const styles=result.styles.map(s=>{const u=new URL(s,'https://nextstepprinting.com');return map[u.pathname];}).filter(Boolean);
  const html=`<!doctype html>\n<html lang="en-US">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>${result.title.replaceAll('&','&amp;')}</title>\n<link rel="canonical" href="https://nextstepprinting.com${route}">\n${result.metadata.join('\n')}\n<link rel="icon" href="/assets/images/2022/04/cropped-NSP_Identity_3-32x32.png">\n<link rel="stylesheet" href="/assets/styles/fonts.css">\n${styles.map(s=>'<link rel="stylesheet" href="'+s+'">').join('\n')}\n<link rel="stylesheet" href="/assets/styles/site.css">\n<script src="/assets/site.js" defer></script>\n</head>\n<body id="top" class="${result.bodyClass}">\n${rewrite(result.body)}\n</body>\n</html>\n`;
  const destination=path.join('public',route,'index.html');
  await fs.mkdir(path.dirname(destination),{recursive:true});
  await fs.writeFile(destination,html.replace(/>\s*</g,'>\n<'));
  report.push({route,title:result.title,styles,forms:result.forms});
  console.log('Imported',route);
}
await b.close();
await fs.writeFile('docs/page-inventory.json',JSON.stringify(report,null,2)+'\n');
await fs.writeFile('docs/asset-inventory.json',JSON.stringify(map,null,2)+'\n');
