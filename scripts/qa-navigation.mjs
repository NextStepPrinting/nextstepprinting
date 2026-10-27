import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {browser} from './browser.mjs';
const b=await browser(9340);
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const results=[];
const base=process.argv[2]||'http://127.0.0.1:4173';
await fs.mkdir('docs/reference/navigation',{recursive:true});

async function size(width){
  await b.send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<500});
  await pause(300);
}

async function state(){
  return b.evaluate(`(()=>{const nav=document.querySelector('#nsp-menu');const toggle=document.querySelector('.nsp-menu-toggle');return {width:innerWidth,hidden:nav.hidden,inert:nav.inert,toggle:getComputedStyle(toggle).display,expanded:toggle.getAttribute('aria-expanded'),background:getComputedStyle(nav).backgroundColor,overflow:document.body.style.overflow,logo:document.querySelector('.nsp-logo').getBoundingClientRect().toJSON(),nav:nav.getBoundingClientRect().toJSON(),links:[...nav.querySelectorAll('a')].map(e=>({text:e.textContent,rect:e.getBoundingClientRect().toJSON(),weight:getComputedStyle(e).fontWeight,color:getComputedStyle(e).color})),active:nav.querySelector('[aria-current]')?.textContent,copyright:document.querySelector('.eluid5c7ce351').innerText.trim()};})()`);
}

function checkRow(s){
  assert.equal(s.hidden,false);assert.equal(s.inert,false);assert.equal(s.toggle,'none');assert.equal(s.links.length,7);
  assert.ok(s.nav.left>=s.logo.right+15,'Navigation does not overlap the logo');
  assert.ok(s.nav.right<=s.width+1,'Navigation fits horizontally');
  assert.ok(s.logo.width>=200,'Logo remains readable');
  const row=s.links[0].rect.top;
  for(const link of s.links)assert.ok(Math.abs(link.rect.top-row)<1,'All seven links stay on one row');
}

try{
  await size(1440);await b.send('Page.navigate',{url:base+'/'});await pause(600);await b.evaluate('document.fonts.ready');
  for(const width of [2200,1920,1440,1280,1200,1100,1099,1024,768,390,320]){
    await size(width);await b.evaluate('scrollTo(0,0)');await pause(250);
    const initial=await state();
    assert.match(initial.copyright,/all rights reserved$/i,'Copyright has no trailing space or period');
    if(width>=1100){
      checkRow(initial);
      await b.evaluate('scrollTo(0,120)');await pause(250);checkRow(await state());
      await b.evaluate('scrollTo(0,0)');await pause(250);
    }else{
      assert.equal(initial.hidden,true);assert.notEqual(initial.toggle,'none');
      await b.evaluate(`document.querySelector('.nsp-menu-toggle').click()`);await pause(220);
      const open=await state();
      assert.equal(open.background,'rgb(255, 126, 0)');assert.equal(open.hidden,false);assert.equal(open.inert,false);assert.equal(open.overflow,'hidden');
      for(const link of open.links){assert.ok(['rgb(29, 29, 29)','rgb(17, 17, 17)'].includes(link.color));assert.equal(link.weight,'700');assert.ok(link.rect.left>=0&&link.rect.right<=width,'Overlay links fit');}
      if(width===390){const shot=await b.send('Page.captureScreenshot',{format:'png'});await fs.writeFile('docs/reference/navigation/orange-menu-390.png',Buffer.from(shot.data,'base64'));}
      await b.evaluate(`document.querySelector('#nsp-menu a:last-child').focus()`);
      await b.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
      assert.equal(await b.evaluate(`document.activeElement===document.querySelector('.nsp-menu-toggle')`),true,'Overlay keyboard focus wraps');
      await b.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await pause(220);
      assert.equal((await state()).hidden,true);assert.equal((await state()).overflow,'');
    }
    results.push({width,initial});
  }
  // Changing modes while the overlay is open must release its scroll lock.
  await b.evaluate(`document.querySelector('.nsp-menu-toggle').click()`);await pause(220);
  await size(1440);checkRow(await state());assert.equal((await state()).overflow,'');
  const desktop=await b.send('Page.captureScreenshot',{format:'png'});await fs.writeFile('docs/reference/navigation/desktop-menu-1440.png',Buffer.from(desktop.data,'base64'));
  await size(1099);assert.equal((await state()).hidden,true);
  // A viewport-mode change must not release a separate lightbox's scroll lock.
  await b.evaluate(`document.querySelector('.gridPhotoGallery__link').click()`);await pause(150);
  await size(1440);assert.equal((await state()).overflow,'hidden');
  await b.evaluate(`document.querySelector('.nsp-lightbox').close()`);await pause(50);assert.equal((await state()).overflow,'');
  // Verify the shared footer on every route, not just the home page.
  for(const {route} of JSON.parse(await fs.readFile('docs/page-inventory.json','utf8'))){
    await b.send('Page.navigate',{url:base+route});await pause(150);
    assert.match((await state()).copyright,/all rights reserved$/i,route+' copyright');
  }
  assert.equal(b.errors.length,0,JSON.stringify(b.errors));
  const filename=base.startsWith('http://127.')?'docs/evidence/navigation-results.json':'docs/reference/live-navigation-results.json';
  await fs.writeFile(filename,JSON.stringify({base,results,errors:b.errors},null,2)+'\n');
  console.log('PASS: horizontal menu fits at 1100–2200px, orange bold overlay at 320–1099px, keyboard/resize/scroll-lock behavior, and clean copyright on all 15 pages.');
}finally{await b.close();}
