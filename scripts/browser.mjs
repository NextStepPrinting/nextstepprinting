import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
export async function browser(port=9333) {
  const child = spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', ['--headless=new','--disable-gpu','--no-first-run',`--remote-debugging-port=${port}`,`--user-data-dir=${path.resolve('.preview/edge-'+port)}`],{stdio:'ignore'});
  let info;
  for(let i=0;i<60;i++) { try {info = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`,{method:'PUT'})).json();break;} catch {await new Promise(r=>setTimeout(r,250));} }
  if(!info) throw new Error('Browser debugging endpoint unavailable');
  const socket = new WebSocket(info.webSocketDebuggerUrl);
  await new Promise(r=>socket.addEventListener('open',r,{once:true}));
  let id=0; const pending=new Map(); const errors=[];const listeners=new Map();
  socket.addEventListener('message',e=>{const m=JSON.parse(e.data); if(m.id){pending.get(m.id)?.(m);pending.delete(m.id);} if(m.method==='Runtime.exceptionThrown')errors.push(m.params);for(const fn of listeners.get(m.method)||[])fn(m.params);});
  const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,m=>m.error?reject(new Error(JSON.stringify(m.error))):resolve(m.result));socket.send(JSON.stringify({id:n,method,params}));});
  await send('Page.enable');await send('Runtime.enable');
  return {send,errors,on(method,fn){if(!listeners.has(method))listeners.set(method,[]);listeners.get(method).push(fn);},async evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(r.exceptionDetails.text+': '+r.result.description);return r.result.value;},async close(){await send('Browser.close');socket.close();child.kill();}};
}
if(process.argv[1]?.endsWith('browser.mjs') && process.argv[2]) {
  const b=await browser();
  await fs.mkdir('docs/reference/screenshots',{recursive:true});
  const routes=process.argv[2]==='--all' ? JSON.parse(await fs.readFile('docs/reference/inventory.json','utf8')).routes : [''];
  for(const route of routes) for(const width of [1440,768,390]) {
    await b.send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<500});
    await b.send('Page.navigate',{url:process.argv[2]==='--all'?'https://nextstepprinting.com'+route:process.argv[2]});
    await new Promise(r=>setTimeout(r,2500));
    await b.evaluate(`(async()=>{for(let y=0;y<document.body.scrollHeight;y+=650){scrollTo(0,y);await new Promise(r=>setTimeout(r,90));}scrollTo(0,0);await new Promise(r=>setTimeout(r,500));})()`);
    const prefix=process.argv[2]==='--all'?'original'+(route==='/'?'-home':route.replaceAll('/','-')):process.argv[3]||'original';
    const shot=await b.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});
    await fs.writeFile(`docs/reference/screenshots/${prefix}-${width}.png`,Buffer.from(shot.data,'base64'));
    console.log(JSON.stringify({width,details:await b.evaluate(`({title:document.title,height:document.body.scrollHeight,width:document.body.scrollWidth,forms:[...document.forms].map(f=>({action:f.action,fields:[...f.elements].map(e=>({type:e.type,name:e.name,required:e.required,accept:e.accept}))})),fonts:[...document.fonts].map(f=>({family:f.family,status:f.status})),headings:[...document.querySelectorAll('h1,h2,h3,h4')].map(e=>({text:e.innerText,size:getComputedStyle(e).fontSize,color:getComputedStyle(e).color}))})`)}));
  }
  await b.close();
}
