import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {browser} from './browser.mjs';
const b=await browser(9340);
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const results=[];
const hoverResults=[];
const base=process.argv[2]||'http://127.0.0.1:4173';
await fs.mkdir('docs/reference/navigation',{recursive:true});

async function size(width){
  await b.send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<500});
  await pause(300);
}

async function state(){
  return b.evaluate(`(()=>{const nav=document.querySelector('#nsp-menu');const toggle=document.querySelector('.nsp-menu-toggle');return {width:innerWidth,hidden:nav.hidden,inert:nav.inert,toggle:getComputedStyle(toggle).display,expanded:toggle.getAttribute('aria-expanded'),background:getComputedStyle(nav).backgroundColor,overflow:document.body.style.overflow,logo:document.querySelector('.nsp-logo').getBoundingClientRect().toJSON(),nav:nav.getBoundingClientRect().toJSON(),links:[...nav.querySelectorAll('a')].map(e=>({text:e.textContent,rect:e.getBoundingClientRect().toJSON(),weight:getComputedStyle(e).fontWeight,color:getComputedStyle(e).color})),active:nav.querySelector('[aria-current]')?.textContent,copyright:document.querySelector('.nsp-footer-copyright').innerText.trim()};})()`);
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
  await b.send('DOM.enable');await b.send('CSS.enable');
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
      for(const link of open.links){assert.equal(link.color,'rgb(255, 255, 255)');assert.equal(link.weight,'700');assert.ok(link.rect.left>=0&&link.rect.right<=width,'Overlay links fit');}
      if(width===1099||width===390){
        const {root}=await b.send('DOM.getDocument');
        const {nodeId}=await b.send('DOM.querySelector',{nodeId:root.nodeId,selector:'#nsp-menu a[href="/about/"]'});
        const read=`(()=>{const e=document.querySelector('#nsp-menu a[href="/about/"]');const s=getComputedStyle(e,'::after');return {scale:new DOMMatrixReadOnly(s.transform).a,width:parseFloat(s.width),origin:parseFloat(s.transformOrigin),background:getComputedStyle(e).backgroundColor};})()`;
        const before=await b.evaluate(read);
        await b.send('CSS.forcePseudoState',{nodeId,forcedPseudoClasses:['hover']});await pause(60);
        const during=await b.evaluate(read);await pause(280);const after=await b.evaluate(read);
        assert.equal(before.scale,0);assert.ok(during.scale>0&&during.scale<1,'Underline animates');assert.equal(after.scale,1);
        assert.ok(Math.abs(after.origin-after.width/2)<1,'Underline expands from its center');
        assert.equal(after.background,'rgba(0, 0, 0, 0)','No hover highlight');
        hoverResults.push({width,before,during,after});
        await b.send('CSS.forcePseudoState',{nodeId,forcedPseudoClasses:[]});
      }
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
  await b.send('Page.navigate',{url:base+'/contact/'});await pause(500);
  const contact=[];
  for(const width of [1440,768,390]){
    await size(width);
    const email=await b.evaluate(`(()=>{const a=document.querySelector('.nsp-contact-main a[href^="mailto:"]');return {color:getComputedStyle(a).color,href:a.getAttribute('href')};})()`);
    assert.equal(email.color,'rgb(54, 56, 59)');assert.equal(email.href,'mailto:info@nextstepprinting.com');
    contact.push({width,...email});

  }
  assert.equal(b.errors.length,0,JSON.stringify(b.errors));
  const filename=base.startsWith('http://127.')?'docs/evidence/navigation-results.json':'docs/reference/live-navigation-results.json';
  await fs.writeFile(filename,JSON.stringify({base,results,hoverResults,contact,errors:b.errors},null,2)+'\n');
  console.log('PASS: horizontal/compact navigation, white bold overlay text, center-out hover underline without highlighting, keyboard/resize/scroll locks, contact-card email, and all footer endings.');
}finally{await b.close();}
