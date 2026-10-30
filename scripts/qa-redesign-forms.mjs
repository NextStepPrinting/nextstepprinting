import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {browser} from './browser.mjs';
const b=await browser(9362),pause=ms=>new Promise(r=>setTimeout(r,ms));
let scenario='failure',ready=true,requests=[],results=[];
b.on('Fetch.requestPaused',async e=>{
 let body,status=200,type='application/json';
 if(e.request.url.includes('challenges.cloudflare.com')){type='text/javascript';body=`window.testResets=0;window.turnstile={render(slot,options){window.testWidget=options;return 1},getResponse(){return 'isolated-captcha-token'},reset(){window.testResets++},remove(){}};window.nspCaptchaReady();`;}
 else if(e.request.url.endsWith('/api/form-config'))body=JSON.stringify({siteKey:'isolated-public-key',ready});
 else if(/\/api\/(contact|quote)$/.test(e.request.url)){requests.push({route:new URL(e.request.url).pathname,data:JSON.parse(e.request.postData)});await pause(100);status=scenario==='failure'?503:200;body=JSON.stringify({ok:scenario==='success',message:scenario==='failure'?'Mock delivery unavailable. Entries preserved.':'Mock accepted'});}
 else{await b.send('Fetch.continueRequest',{requestId:e.requestId});return;}
 await b.send('Fetch.fulfillRequest',{requestId:e.requestId,responseCode:status,responseHeaders:[{name:'Content-Type',value:type}],body:Buffer.from(body).toString('base64')});
});
try{
 await b.send('Fetch.enable',{patterns:[{urlPattern:'*/api/*'},{urlPattern:'https://challenges.cloudflare.com/*'}]});
 for(const [kind,route] of [['contact','/contact/'],['quote','/get-a-quote/']])for(const width of [1440,390]){
  ready=true;scenario='failure';requests=[];
  await b.send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<500});await b.send('Page.navigate',{url:'http://127.0.0.1:4173'+route});await pause(450);
  for(let n=0;n<30&&!await b.evaluate('!!window.testWidget');n++)await pause(100);
  assert.ok(await b.evaluate('!!window.testWidget'),JSON.stringify({kind,width,status:await b.evaluate(`document.querySelector('[data-form-status]').textContent`),errors:b.errors}));
  assert.equal(await b.evaluate('window.testWidget.action'),kind);
  const values=kind==='contact'?{name:'Isolated Test',email:'isolated@example.test',phone:'',subject:'Mock contact',message:'This is an isolated browser test.'}:{name:'Isolated Test',email:'isolated@example.test',phone:'555-0100',city:'Test City',projectType:'Vehicle wrap',details:'This is an isolated browser test.'};
  await b.evaluate(`(()=>{const f=document.forms[0];for(const [k,v]of Object.entries(${JSON.stringify(values)}))f.elements[k].value=v;})()`);
  assert.equal(await b.evaluate('document.forms[0].checkValidity()'),true);
  if(kind==='quote'){await b.evaluate(`document.forms[0].elements.phone.value=''`);assert.equal(await b.evaluate('document.forms[0].checkValidity()'),false);await b.evaluate(`document.forms[0].elements.phone.value='555-0100'`);}
  await b.evaluate('document.forms[0].requestSubmit()');await pause(40);assert.equal(await b.evaluate(`document.forms[0].querySelector('button[type=submit]').disabled`),true);await pause(250);
  assert.equal(requests.length,1);assert.equal(requests[0].route,'/api/'+kind);for(const [k,v]of Object.entries(values))assert.equal(requests[0].data[k],v);
  assert.match(await b.evaluate(`document.querySelector('[data-form-status]').textContent`),/Mock delivery unavailable/);
  for(const [k,v]of Object.entries(values))assert.equal(await b.evaluate(`document.forms[0].elements[${JSON.stringify(k)}].value`),v);
  const id=requests[0].data.submissionId;
  scenario='success';await b.evaluate('document.forms[0].requestSubmit()');await pause(350);assert.equal(requests.length,2);assert.equal(requests[1].data.submissionId,id);
  assert.match(await b.evaluate(`document.querySelector('[data-form-status]').textContent`),/has been sent/);assert.equal(await b.evaluate(`document.forms[0].elements.name.value`),'');assert.equal(await b.evaluate('window.testResets'),2);
  ready=false;await b.send('Page.navigate',{url:'http://127.0.0.1:4173'+route});await pause(400);await b.evaluate('window.testWidget["error-callback"]()');assert.match(await b.evaluate(`document.querySelector('[data-form-status]').textContent`),/unavailable/);
  results.push({kind,width,result:'mocked failure preserves all fields; accepted response resets; correct action; quote phone required/contact optional; unavailable notice retained'});
 }
 assert.equal(b.errors.length,0,JSON.stringify(b.errors));await fs.writeFile('docs/reference/modern-redesign/form-results.json',JSON.stringify({results,providerCalls:'isolated browser interceptions only; no real email'},null,2));
 console.log('PASS: Contact and Quote desktop/mobile mock submissions, validation, failure preservation, success reset, captcha lifecycle, readiness notice; no real email or provider request.');
}finally{await b.close();}
