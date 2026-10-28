import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {browser} from './browser.mjs';
const b=await browser(9342);
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const results=[];
await fs.mkdir('docs/reference/contact-footer',{recursive:true});
const pages=JSON.parse(await fs.readFile('docs/page-inventory.json','utf8'));
const baseline=JSON.parse(await fs.readFile('docs/evidence/contact-footer-main-baseline.json','utf8'));
for(const {route} of pages){
 if(route==='/contact/')continue;
 const html=await fs.readFile('public'+route+'index.html','utf8');
 assert.equal(createHash('sha256').update(html.slice(0,html.indexOf('<div class="znpb-footer-smart-area">'))).digest('hex'),baseline[route],route+' main/header/meta byte-for-byte preserved');
}
try{
 for(const {route} of pages){
  for(const width of [1440,768,390,320]){
   await b.send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<500});
   await b.send('Page.navigate',{url:'http://127.0.0.1:4173'+route});await pause(350);
   await b.evaluate(`Promise.all([document.fonts.ready,...[...document.images].map(i=>{i.loading='eager';return i.decode().catch(()=>{});})])`);await pause(150);
   const state=await b.evaluate(`(()=>{const f=document.querySelector('.nsp-footer');return {overflow:document.documentElement.scrollWidth>innerWidth,footerOverflow:f.scrollWidth>f.clientWidth,footerCount:document.querySelectorAll('footer.nsp-footer').length,footerLinks:[...f.querySelectorAll('a')].map(a=>({href:a.getAttribute('href'),width:a.getBoundingClientRect().width,scrollWidth:a.scrollWidth,clientWidth:a.clientWidth})),broken:[...document.images].filter(i=>i.getAttribute('src')&&(!i.complete||!i.naturalWidth)).map(i=>i.src),mainEmails:document.querySelectorAll('.nsp-contact-main a[href^="mailto:"]').length,headerColor:getComputedStyle(document.querySelector('.nsp-header')).backgroundColor,cards:[...document.querySelectorAll('.nsp-contact-card')].map(e=>e.getBoundingClientRect().toJSON()),fields:[...document.querySelectorAll('.nsp-contact-form input:not([type="hidden"]):not([name="website"]),.nsp-contact-form textarea')].map(e=>({name:e.name,required:e.required,label:!!document.querySelector('label[for="'+e.id+'"]')}))};})()`);
   assert.equal(state.overflow,false,route+' overflow '+width);assert.equal(state.footerOverflow,false);assert.equal(state.footerCount,1);assert.equal(state.broken.length,0);
   for(const link of state.footerLinks)assert.ok(link.scrollWidth<=link.clientWidth+1,'Footer link does not overflow: '+link.href+' '+width);
   assert.ok(state.footerLinks.some(l=>l.href==='tel:+16576733146'));assert.ok(state.footerLinks.some(l=>l.href==='mailto:info@nextstepprinting.com'));
   assert.ok(state.footerLinks.some(l=>l.href.includes('google.com/maps/search/')));
   if(route==='/contact/'){
    assert.equal(state.mainEmails,1);assert.equal(state.headerColor,'rgb(29, 29, 29)');assert.equal(state.cards.length,3);
    if(width>=768){assert.equal(state.cards[0].top,state.cards[1].top);assert.ok(Math.abs(state.cards[0].width-state.cards[2].width)<1);}
    else assert.ok(state.cards[1].top>=state.cards[0].bottom,'Mobile cards stack');
    assert.deepEqual(state.fields.map(f=>[f.name,f.required]),[['name',true],['email',true],['phone',false],['subject',true],['message',true]]);assert.ok(state.fields.every(f=>f.label));
    const screenshot=await b.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});await fs.writeFile(`docs/reference/contact-footer/contact-${width}.png`,Buffer.from(screenshot.data,'base64'));
    await b.evaluate('scrollTo(0,500)');await pause(200);
    assert.equal(await b.evaluate(`document.querySelector('.nsp-header').getBoundingClientRect().top`),0,'Contact navigation stays visible on scroll');
    await b.evaluate('scrollTo(0,0)');await pause(100);
    if(width===390){await b.evaluate(`document.querySelector('.nsp-menu-toggle').click()`);assert.equal(await b.evaluate(`document.querySelector('#nsp-menu').hidden`),false);await b.evaluate(`document.querySelector('.nsp-menu-toggle').click()`);await pause(200);}
   }
   results.push({route,width,...state});
  }
  console.log('Checked',route);
 }
 // Fully isolated browser delivery states for the new form.
 let scenario='failure',lastPayload;
 b.on('Fetch.requestPaused',async e=>{
  let body,type='application/json',status=200;
  if(e.request.url.includes('challenges.cloudflare.com')){type='text/javascript';body=`window.turnstile={render(slot,options){window.testCaptchaAction=options.action;return 1},getResponse(){return 'isolated-token'},reset(){}};window.nspCaptchaReady();`;}
  else if(e.request.url.endsWith('/api/form-config'))body=JSON.stringify({siteKey:'isolated-public-key'});
  else if(e.request.url.endsWith('/api/contact')){lastPayload=JSON.parse(e.request.postData);await pause(160);status=scenario==='failure'?503:200;body=JSON.stringify({ok:scenario==='success',message:'Mock delivery failed. Your entries are preserved.'});}
  else{await b.send('Fetch.continueRequest',{requestId:e.requestId});return;}
  await b.send('Fetch.fulfillRequest',{requestId:e.requestId,responseCode:status,responseHeaders:[{name:'Content-Type',value:type}],body:Buffer.from(body).toString('base64')});
 });
 await b.send('Fetch.enable',{patterns:[{urlPattern:'*/api/*'},{urlPattern:'https://challenges.cloudflare.com/*'}]});
 await b.send('Page.navigate',{url:'http://127.0.0.1:4173/contact/'});await pause(650);
 assert.equal(await b.evaluate('window.testCaptchaAction'),'contact');
 assert.equal(await b.evaluate(`document.querySelector('form').checkValidity()`),false);
 await b.evaluate(`(()=>{const f=document.querySelector('form');for(const[k,v]of Object.entries({name:'Mock Customer',email:'mock@example.test',subject:'Printing question',message:'Please help with a project.'}))f.elements[k].value=v;f.requestSubmit();})()`);
 await pause(50);assert.equal(await b.evaluate(`document.querySelector('form button').disabled`),true);
 await pause(350);assert.equal(await b.evaluate(`document.querySelector('form').elements.message.value`),'Please help with a project.');assert.equal(lastPayload.phone,'');
 scenario='success';await b.evaluate(`document.querySelector('form').requestSubmit()`);await pause(350);
 assert.equal(await b.evaluate(`document.querySelector('form').elements.message.value`),'');assert.match(await b.evaluate(`document.querySelector('[data-form-status]').textContent`),/has been sent/);
 assert.equal(b.errors.length,0,JSON.stringify(b.errors));
 await fs.writeFile('docs/evidence/contact-footer-results.json',JSON.stringify({results,errors:b.errors,otherMainContent:'14 non-contact pages byte-for-byte unchanged before footer',form:'Mocked optional-phone/loading/failure preservation/success reset'},null,2)+'\n');
 console.log('PASS: 60 page/viewport checks; footer links/wrapping; contact cards/header/mobile menu/labels; untouched other mains; isolated contact form states.');
}finally{await b.close();}
