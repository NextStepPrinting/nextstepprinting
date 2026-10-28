import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {browser} from './browser.mjs';

const b=await browser(9338);
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const results=[];
await fs.mkdir('docs/reference/lightbox',{recursive:true});

async function clickAt(x,y){
  await b.send('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',clickCount:1});
  await b.send('Input.dispatchMouseEvent',{type:'mouseReleased',x,y,button:'left',clickCount:1});
}

async function imageReady(){
  await b.evaluate(`document.querySelector('.nsp-lightbox img').decode()`);
  await pause(190);
}

async function geometry(){
  return b.evaluate(`(()=>{const d=document.querySelector('.nsp-lightbox');const rect=s=>d.querySelector(s).getBoundingClientRect().toJSON();return {width:innerWidth,height:innerHeight,dialogBackground:getComputedStyle(d).backgroundColor,border:getComputedStyle(d).borderWidth,image:rect('img'),previous:rect('[data-prev]'),next:rect('[data-next]'),close:rect('.nsp-close'),radius:getComputedStyle(d.querySelector('[data-next]')).borderRadius,text:d.innerText,labels:[...d.querySelectorAll('button')].map(e=>e.getAttribute('aria-label'))};})()`);
}

function checkGeometry(g){
  assert.equal(g.dialogBackground,'rgba(0, 0, 0, 0)');
  assert.equal(g.border,'0px');
  assert.equal(g.radius,'50%');
  assert.ok(g.previous.right<=g.image.left-7,'Previous sits to the left of the image');
  assert.ok(g.next.left>=g.image.right+7,'Next sits to the right of the image');
  assert.ok(g.previous.left>=0&&g.next.right<=g.width,'Arrows fit the viewport');
  assert.ok(g.image.top>=60&&g.image.bottom<=g.height-50,'Image fits vertically');
  assert.ok(Math.abs((g.previous.top+22)-(g.image.top+g.image.height/2))<1,'Arrows are vertically centered');
  assert.equal(g.previous.width,44);assert.equal(g.previous.height,44);
  assert.equal(g.close.top,16);assert.equal(g.width-g.close.right,16);
  assert.deepEqual(g.labels,['Close image','Previous image','Next image']);
  assert.doesNotMatch(g.text,/Close|Previous|Next/,'Only icons and the quiet counter are visible');
}

try{
  for(const width of [1440,768,390,320]){
    await b.send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<500});
    await b.send('Page.navigate',{url:'http://127.0.0.1:4173/portfolio/moab-tables/'});
    await pause(450);await b.evaluate('document.fonts.ready');
    await b.evaluate(`(()=>{const a=document.querySelector('.mfp-gallery a[data-lightbox]');window.testImageLink=a;a.click();})()`);
    await imageReady();let g=await geometry();checkGeometry(g);
    const first=await b.evaluate(`document.querySelector('.nsp-lightbox img').src`);
    await clickAt(g.next.left+22,g.next.top+22);await imageReady();
    assert.notEqual(await b.evaluate(`document.querySelector('.nsp-lightbox img').src`),first);
    g=await geometry();checkGeometry(g);results.push({width,geometry:g});
    const initialArrows={previous:g.previous,next:g.next};
    const shot=await b.send('Page.captureScreenshot',{format:'png'});
    await fs.writeFile(`docs/reference/lightbox/portrait-${width}.png`,Buffer.from(shot.data,'base64'));
    await b.send('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowLeft',code:'ArrowLeft',windowsVirtualKeyCode:37});await imageReady();
    assert.equal(await b.evaluate(`document.querySelector('.nsp-lightbox img').src`),first);
    await b.evaluate(`document.querySelector('.nsp-lightbox [data-prev]').click()`);await imageReady();
    const [current,total]=(await b.evaluate(`document.querySelector('.nsp-lightbox-count').textContent`)).split(' / ');
    assert.equal(current,total,'Previous wraps to last image');
    await b.send('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39});await imageReady();
    assert.equal(await b.evaluate(`document.querySelector('.nsp-lightbox img').src`),first);
    g=await geometry();checkGeometry(g);
    assert.deepEqual(g.previous,initialArrows.previous,'Previous target stays fixed between photos');
    assert.deepEqual(g.next,initialArrows.next,'Next target stays fixed between photos');
    await clickAt(g.close.left+22,g.close.top+22);await pause(80);
    assert.equal(await b.evaluate(`document.querySelector('.nsp-lightbox').open`),false);
    assert.equal(await b.evaluate(`document.activeElement===window.testImageLink`),true,'Focus returns to clicked image');
    assert.equal(await b.evaluate(`document.body.style.overflow`),'');
    await b.evaluate(`window.testImageLink.click()`);await imageReady();
    await b.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await pause(80);
    assert.equal(await b.evaluate(`document.querySelector('.nsp-lightbox').open`),false);
    await b.evaluate(`window.testImageLink.click()`);await imageReady();
    await clickAt(2,2);await pause(80);
    assert.equal(await b.evaluate(`document.querySelector('.nsp-lightbox').open`),false,'Backdrop click closes');
  }
  await b.send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
  await b.send('Page.navigate',{url:'http://127.0.0.1:4173/our-work/'});await pause(450);
  await b.evaluate(`document.querySelector('.portfolio-item-link').click()`);await imageReady();
  const landscape=await geometry();checkGeometry(landscape);results.push({landscape});
  const shot=await b.send('Page.captureScreenshot',{format:'png'});
  await fs.writeFile('docs/reference/lightbox/landscape-1440.png',Buffer.from(shot.data,'base64'));
  assert.equal(b.errors.length,0,JSON.stringify(b.errors));
  await fs.writeFile('docs/evidence/lightbox-results.json',JSON.stringify({results,errors:b.errors},null,2)+'\n');
  console.log('PASS: borderless lightbox; adjacent circular arrows; top-right X; portrait/landscape at 1440/768/390/320; click/keyboard navigation, wrapping, close/Escape/backdrop, focus return, and scroll restoration.');
}finally{await b.close();}
