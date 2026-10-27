import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {browser} from './browser.mjs';
const b=await browser(9335);const network=[];const results=[];
b.on('Network.responseReceived',e=>{if(e.response.status>=400)network.push({url:e.response.url,status:e.response.status});});
await b.send('Network.enable');
const pages=JSON.parse(await fs.readFile('docs/page-inventory.json','utf8'));
const pause=ms=>new Promise(r=>setTimeout(r,ms));
await fs.mkdir('docs/reference/local',{recursive:true});
for(const page of pages)for(const width of [1440,768,390]){
  await b.send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<500});
  await b.send('Page.navigate',{url:'http://127.0.0.1:4173'+page.route});await pause(600);
  await b.evaluate('document.fonts.ready');
  await b.evaluate(`Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode().catch(()=>{});}));`);
  const details=await b.evaluate(`({title:document.title,overflow:document.documentElement.scrollWidth>innerWidth,brokenImages:[...document.images].filter(i=>i.getAttribute('src')&&(!i.complete||i.naturalWidth===0)).map(i=>i.src),badAnchors:[...document.querySelectorAll('a[href^="#"]')].filter(a=>a.hash.length>1&&!document.getElementById(a.hash.slice(1))&&!a.hash.startsWith('#sort')).map(a=>a.hash),hasLoader:!!document.querySelector('#page-loading'),scroll:getComputedStyle(document.documentElement).scrollBehavior,header:document.querySelector('.nsp-header').getBoundingClientRect().toJSON(),logo:document.querySelector('.nsp-logo').getBoundingClientRect().toJSON()})`);
  results.push({route:page.route,width,...details});
  const shot=await b.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});await fs.writeFile(`docs/reference/local/${page.route==='/'?'home':page.route.replaceAll('/','_')}-${width}.png`,Buffer.from(shot.data,'base64'));
  console.log(page.route,width,'overflow:',details.overflow,'broken images:',details.brokenImages.length);
}
await b.evaluate(`document.querySelector('.nsp-menu-toggle').click()`);assert.equal(await b.evaluate(`document.querySelector('#nsp-menu').hidden`),false);
await b.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});assert.equal(await b.evaluate(`document.querySelector('#nsp-menu').hidden`),true);
await b.evaluate(`document.querySelector('.mfp-gallery a[href]')?.click()`);assert.equal(await b.evaluate(`!!document.querySelector('dialog[open]')`),true);
await b.evaluate(`document.querySelector('dialog').close()`);
await b.send('Page.navigate',{url:'http://127.0.0.1:4173/our-work/'});await pause(500);
await b.evaluate(`document.querySelector('[data-option-value="name"]').click()`);
const names=await b.evaluate(`[...document.querySelectorAll('.kl-ptfsortable-items > li')].map(e=>e.querySelector('h3,h4').textContent.trim())`);assert.deepEqual(names,[...names].sort((a,c)=>a.localeCompare(c)));
// Browser-only provider mocks. Requests are fulfilled inside CDP; no email leaves this process.
let scenario='failure';
b.on('Fetch.requestPaused',async e=>{
  const url=e.request.url;let body,type='application/json',status=200;
  if(url.includes('challenges.cloudflare.com')){type='text/javascript';body=`window.turnstile={render(){return 1},getResponse(){return 'isolated-token'},reset(){}};window.nspCaptchaReady();`;}
  else if(url.endsWith('/api/form-config'))body=JSON.stringify({siteKey:'isolated-public-key'});
  else if(url.endsWith('/api/quote')){await pause(100);status=scenario==='failure'?503:200;body=JSON.stringify({ok:scenario==='success',message:'Mock delivery failed; your entries are preserved.'});}
  else {await b.send('Fetch.continueRequest',{requestId:e.requestId});return;}
  await b.send('Fetch.fulfillRequest',{requestId:e.requestId,responseCode:status,responseHeaders:[{name:'Content-Type',value:type}],body:Buffer.from(body).toString('base64')});
});
await b.send('Fetch.enable',{patterns:[{urlPattern:'*/api/*'},{urlPattern:'https://challenges.cloudflare.com/*'}]});
await b.send('Page.navigate',{url:'http://127.0.0.1:4173/get-a-quote/'});await pause(700);
assert.equal(await b.evaluate(`document.querySelector('form').checkValidity()`),false);
await b.evaluate(`(()=>{const f=document.querySelector('form');const data={name:'Browser Customer',email:'browser@example.test',phone:'555-111-2222',city:'Fountain Valley',projectType:'Wrap',details:'Browser isolated test'};for(const[k,v]of Object.entries(data))f.elements[k].value=v;f.requestSubmit();})()`);
await pause(40);assert.equal(await b.evaluate(`document.querySelector('form button').disabled`),true);
await pause(400);assert.equal(await b.evaluate(`document.querySelector('form').elements.name.value`),'Browser Customer');assert.equal(await b.evaluate(`document.querySelector('[data-form-status]').dataset.error`),'true');
scenario='success';await b.evaluate(`document.querySelector('form').requestSubmit()`);await pause(400);
assert.equal(await b.evaluate(`document.querySelector('form').elements.name.value`),'');assert.match(await b.evaluate(`document.querySelector('[data-form-status]').textContent`),/has been sent/);
await b.send('Fetch.disable');
await fs.writeFile('docs/reference/local-qa.json',JSON.stringify({results,network,errors:b.errors,interactions:['menu open/Escape close','lightbox open/close','archive name sorting','form invalid/loading/failure preservation/success reset with isolated browser mocks']},null,2));
await b.close();
const failures=results.filter(r=>r.overflow||r.brokenImages.length||r.badAnchors.length||r.hasLoader||r.scroll!=='auto');
assert.equal(failures.length,0,JSON.stringify(failures));assert.equal(b.errors.length,0,JSON.stringify(b.errors));
const unexpected=network.filter(e=>!e.url.includes('/api/')&&!e.url.includes('favicon.ico'));assert.equal(unexpected.length,0,JSON.stringify(unexpected));
console.log('PASS: 45 responsive page checks, menu, lightbox, sorting, and isolated form browser states.');
