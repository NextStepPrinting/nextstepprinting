import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {browser} from './browser.mjs';

const b=await browser(9337);
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const results=[];
await fs.mkdir('docs/reference/motion',{recursive:true});

async function navigate(route,width=1440){
  await b.send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<500});
  await b.send('Page.navigate',{url:'http://127.0.0.1:4173'+route});
  await pause(400);
  await b.evaluate(`Promise.all([document.fonts.ready,...[...document.images].map(i=>{i.loading='eager';return i.decode().catch(()=>{});})])`);
  await pause(450);
}

async function hover(selector,pseudo='',target=selector){
  const {root}=await b.send('DOM.getDocument');
  const {nodeId}=await b.send('DOM.querySelector',{nodeId:root.nodeId,selector});
  assert.ok(nodeId,selector);
  const read=`(()=>{const s=getComputedStyle(document.querySelector(${JSON.stringify(target)}),${JSON.stringify(pseudo)});return {opacity:Number(s.opacity),width:parseFloat(s.width),duration:s.transitionDuration,color:s.color,background:s.backgroundColor,border:s.borderColor};})()`;
  const before=await b.evaluate(read);
  await b.send('CSS.forcePseudoState',{nodeId,forcedPseudoClasses:['hover']});
  await pause(50);const during=await b.evaluate(read);
  await pause(450);const after=await b.evaluate(read);
  await b.send('CSS.forcePseudoState',{nodeId,forcedPseudoClasses:[]});
  assert.ok(before.duration.split(',').some(d=>parseFloat(d)>0),selector+' has a transition');
  return {selector,pseudo,before,during,after};
}

async function grid(){
  return b.evaluate(`(()=>{const l=document.querySelector('.kl-ptfsortable-items');const r=l.getBoundingClientRect();return {width:innerWidth,columns:Number(getComputedStyle(l).getPropertyValue('--gallery-columns')),height:l.clientHeight,items:[...l.children].map(e=>{const t=e.getBoundingClientRect();return {title:e.querySelector('.name').textContent,x:t.left-r.left,y:t.top-r.top,width:t.width,height:t.height,transition:getComputedStyle(e).transitionDuration};})};})()`);
}

function checkGrid(state){
  const heights=Array(state.columns).fill(0);
  const columnWidth=(state.items[0]?.width)||0;
  for(const item of state.items){
    const column=heights.indexOf(Math.min(...heights));
    assert.ok(Math.abs(item.x-column*columnWidth)<1,'Card fills shortest column: '+item.title);
    assert.ok(Math.abs(item.y-heights[column])<1,'No unexpected masonry gap: '+item.title);
    heights[column]+=item.height+20;
  }
  assert.ok(Math.abs(state.height-Math.max(...heights))<1,'Gallery contains every card: '+JSON.stringify({width:state.width,actual:state.height,expected:Math.max(...heights)}));
}

try{
  await b.send('DOM.enable');await b.send('CSS.enable');
  for(const preference of ['no-preference','reduce']){
    await b.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:preference}]});
    await navigate('/');
    assert.equal(await b.evaluate(`getComputedStyle(document.querySelector('.nsp-header')).backgroundColor`),'rgba(0, 0, 0, 0)');
    assert.equal(await b.evaluate(`document.querySelector('.nsp-header').offsetHeight`),185);
    await b.evaluate('scrollTo(0,120)');await pause(40);
    const intermediate=await b.evaluate(`document.querySelector('.nsp-header').getBoundingClientRect().height`);
    assert.ok(intermediate>60&&intermediate<185,'Header shrinks through intermediate sizes');
    await pause(250);
    assert.equal(await b.evaluate(`document.querySelector('.nsp-header').offsetHeight`),60);
    assert.equal(await b.evaluate(`getComputedStyle(document.querySelector('.nsp-header')).backgroundColor`),'rgb(29, 29, 29)');
    await b.evaluate('scrollTo(0,0)');await pause(300);
    assert.equal(await b.evaluate(`getComputedStyle(document.querySelector('.nsp-header')).backgroundColor`),'rgba(0, 0, 0, 0)');
    // Footer About is inactive on Home, so its bar can grow from 8px to 12px.
    const footer=await hover('.znpb-footer-smart-area .elm-cmlist li:nth-child(2) a','::before');
    assert.equal(footer.before.width,8);assert.equal(footer.after.width,12);
    assert.ok(footer.during.width>8&&footer.during.width<12,'Footer bar grows smoothly');
    const image=await hover('.gridPhotoGallery__link','','.gridPhotoGallery__link img');
    assert.ok(image.before.opacity<image.after.opacity,'Gallery image fades on hover');
    assert.ok(image.during.opacity>image.before.opacity&&image.during.opacity<image.after.opacity,'Image opacity interpolates');
    const button=await hover('.btn-lined');
    assert.notDeepEqual(button.before,button.after,'Quote button hover changes');
    const nativeScroll=await b.evaluate(`({behavior:getComputedStyle(document.documentElement).scrollBehavior,wheel:typeof window.SmoothScroll})`);
    assert.equal(nativeScroll.behavior,'auto');assert.equal(nativeScroll.wheel,'undefined');
    await b.evaluate('scrollTo(0,600)');await pause(50);
    assert.equal(await b.evaluate('scrollY'),600,'Native scrolling changes position immediately');
    results.push({preference,headerIntermediateHeight:intermediate,footer,image,button,nativeScroll});
  }
  await b.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
  await navigate('/our-work/');
  for(const [width,columns] of [[1440,4],[1100,4],[992,3],[900,3],[768,2],[600,2],[480,1],[390,1],[1440,4]]){
    await b.send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<500});
    await pause(500);const state=await grid();assert.equal(state.columns,columns);checkGrid(state);results.push({layout:state});
  }
  // Check an actual intermediate transform, not just the transition declaration.
  const before=await grid();
  await b.send('Emulation.setDeviceMetricsOverride',{width:900,height:900,deviceScaleFactor:1,mobile:false});
  await pause(80);const moving=await grid();await pause(500);const after=await grid();
  assert.notEqual(moving.items[3].x,before.items[3].x);assert.notEqual(moving.items[3].x,after.items[3].x);
  checkGrid(after);results.push({resizeInMotion:{before,moving,after}});
  for(const value of ['name','false','date','true']){
    await b.evaluate(`document.querySelector('[data-option-value="${value}"]').click()`);await pause(450);checkGrid(await grid());
  }
  for(const width of [1440,768,390]){
    await b.send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<500});await pause(500);
    await b.evaluate(`scrollTo(0,0)`);await pause(300);
    const screenshot=await b.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});
    await fs.writeFile(`docs/reference/motion/our-work-${width}.png`,Buffer.from(screenshot.data,'base64'));
  }
  await navigate('/about/',390);
  assert.equal(await b.evaluate(`Math.round(document.querySelector('.nsp-header').offsetHeight)`),91);
  assert.equal(await b.evaluate(`getComputedStyle(document.querySelector('.nsp-header')).backgroundColor`),'rgb(29, 29, 29)');
  await b.evaluate('scrollTo(0,120)');await pause(300);
  assert.equal(await b.evaluate(`document.querySelector('.nsp-header').offsetHeight`),60);
  await b.evaluate('scrollTo(0,0)');await pause(300);
  assert.equal(await b.evaluate(`Math.round(document.querySelector('.nsp-header').offsetHeight)`),91);
  assert.equal(b.errors.length,0,JSON.stringify(b.errors));
  await fs.writeFile('docs/evidence/motion-results.json',JSON.stringify({results,errors:b.errors},null,2)+'\n');
  console.log('PASS: original hover interpolation in both motion preferences; transparent/shrinking desktop header and mobile flow; gap-free masonry at nine sizes; animated resizing and sorting; immediate native scrolling.');
}finally{await b.close();}
