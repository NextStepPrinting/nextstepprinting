import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {browser} from './browser.mjs';
const b=await browser(9361),pause=ms=>new Promise(r=>setTimeout(r,ms));
const evidence=JSON.parse(await fs.readFile('docs/evidence/redesign-inventory.json','utf8'));
const results=[];
const shots=['/','/about/','/services/','/our-work/','/graphic-design/','/contact/','/get-a-quote/','/portfolio/moab-tables/'];
try{
 for(const {route,title,canonical,photos,photoUrls} of evidence.pages){
  for(const width of [1440,1024,768,390,320]){
   await b.send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<500});
   await b.send('Page.navigate',{url:'http://127.0.0.1:4173'+route});await pause(300);
   await b.evaluate(`Promise.race([Promise.all([document.fonts.ready,...[...document.images].map(i=>{i.loading='eager';return i.decode().catch(()=>{});})]),new Promise(r=>setTimeout(r,5000))])`);await pause(50);
   const m=await b.evaluate(`(()=>{const h=document.querySelector('.nsp-header'),main=document.querySelector('main'),menu=document.querySelector('#nsp-menu');return {title:document.title,overflow:document.documentElement.scrollWidth>innerWidth,h1:document.querySelectorAll('h1').length,headerHeight:h.getBoundingClientRect().height,mainTop:main.getBoundingClientRect().top,broken:[...document.images].filter(i=>i.hasAttribute('src')&&!i.naturalWidth).map(i=>i.getAttribute('src')),invisibleText:[...document.querySelectorAll('h1,h2,h3')].filter(e=>e.scrollWidth>e.clientWidth+2).map(e=>e.textContent),menuHidden:menu.hidden,navOverflow:!menu.hidden&&menu.getBoundingClientRect().right>innerWidth,styles:[...document.styleSheets].map(s=>s.href),gallery:[...document.querySelectorAll('.project-gallery a')].map(a=>a.getAttribute('href')),forms:[...document.forms].map(f=>({action:f.getAttribute('action'),fields:[...f.elements].filter(e=>e.name).map(e=>({name:e.name,type:e.type,required:e.required,max:e.maxLength})),unlabeled:[...f.elements].filter(e=>e.name&&e.type!=='hidden'&&e.tagName!=='BUTTON'&&!e.labels?.length).map(e=>e.name)}))}})()`);
   assert.equal(m.title,title.replaceAll('&amp;','&'));assert.equal(await b.evaluate(`document.querySelector('link[rel=canonical]').getAttribute('href')`),canonical.match(/href="([^"]+)"/)[1]);assert.equal(m.overflow,false,route+' '+width+' overflow');assert.equal(m.h1,1,route+' one H1');assert.deepEqual(m.broken,[],route+' images');assert.deepEqual(m.invisibleText,[],route+' clipped headings '+width);
   assert.equal(m.headerHeight,width>=1100?85:width>=768?77:71);assert.equal(m.mainTop,m.headerHeight);assert.equal(m.menuHidden,width<1100);assert.equal(m.navOverflow,false);
   assert.equal(m.styles.length,2);assert.ok(m.styles.every(s=>/fonts.css|redesign.css/.test(s)));
   if(photos){assert.equal(m.gallery.length,photos);assert.deepEqual(m.gallery,photoUrls);}
   for(const f of m.forms)assert.deepEqual(f.unlabeled,[]);
   results.push({route,width,...m});
   await b.evaluate('scrollTo(0,180)');await pause(40);assert.equal(await b.evaluate(`document.querySelector('.nsp-header').getBoundingClientRect().top`),0,route+' sticky header');
   if(shots.includes(route)&&[1440,390].includes(width)){await b.evaluate('scrollTo(0,0)');const shot=await b.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});await fs.writeFile('docs/reference/modern-redesign/'+(route==='/'?'home':route.replaceAll('/','_'))+'-'+width+'.png',Buffer.from(shot.data,'base64'));}
  }
  console.log('Checked '+route);
 }
 await b.send('Emulation.setDeviceMetricsOverride',{width:390,height:900,deviceScaleFactor:1,mobile:true});await b.send('Page.navigate',{url:'http://127.0.0.1:4173/'});await pause(350);
 await b.evaluate(`document.querySelector('.nsp-menu-toggle').click()`);await pause(230);assert.equal(await b.evaluate(`document.querySelector('#nsp-menu').hidden`),false);
 const open=await b.evaluate(`({top:document.querySelector('#nsp-menu').getBoundingClientRect().top,overflow:document.body.style.overflow,focus:document.activeElement.tagName})`);assert.equal(open.top,0);assert.equal(open.overflow,'hidden');assert.equal(open.focus,'A');
 await b.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await pause(230);assert.equal(await b.evaluate(`document.querySelector('#nsp-menu').hidden`),true);assert.equal(await b.evaluate(`document.body.style.overflow`),'');
 await b.send('Page.navigate',{url:'http://127.0.0.1:4173/our-work/'});await pause(350);await b.evaluate(`document.querySelector('[data-option-value="name"]').click()`);await pause(450);
 const names=await b.evaluate(`[...document.querySelectorAll('.kl-ptfsortable-items h3')].map(e=>e.textContent)`);assert.deepEqual(names,[...names].sort((a,c)=>a.localeCompare(c)));
 await b.evaluate(`document.querySelector('a[data-lightbox]').click()`);await pause(100);assert.equal(await b.evaluate(`document.querySelector('dialog').open`),true);await b.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await pause(80);assert.equal(await b.evaluate(`document.querySelector('dialog').open`),false);
 assert.equal(b.errors.length,0,JSON.stringify(b.errors));
 await fs.writeFile('docs/reference/modern-redesign/layout-results.json',JSON.stringify({results,errors:b.errors},null,2));
 console.log('PASS: 75 page/viewport checks; titles and all 86 gallery images; single H1; local styles only; mobile menu, sorting, lightbox; no overflow, clipped headings, broken images, or exceptions.');
}finally{await b.close();}
