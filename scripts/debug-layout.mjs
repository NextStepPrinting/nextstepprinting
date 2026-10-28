import {browser} from './browser.mjs';
const b=await browser(9336);
for(const url of ['https://nextstepprinting.com/','http://127.0.0.1:4173/']){
  await b.send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});await b.send('Page.navigate',{url});await new Promise(r=>setTimeout(r,2000));
  console.log(url,JSON.stringify(await b.evaluate(`({header:document.querySelector('header').getBoundingClientRect().toJSON(),logo:document.querySelector('.nsp-logo,.site-logo-img').getBoundingClientRect().toJSON(),bg:[...document.querySelectorAll('.zn-bgSource-image')].map(e=>({rect:e.getBoundingClientRect().toJSON(),bg:getComputedStyle(e).backgroundImage,parentRect:e.parentElement.getBoundingClientRect().toJSON(),display:getComputedStyle(e).display,z:getComputedStyle(e).zIndex})),broken:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>({src:i.src,loading:i.loading}))})`)));
  await b.evaluate('scrollTo(0,3300)');await new Promise(r=>setTimeout(r,600));
  console.log('SCROLLED',url,JSON.stringify(await b.evaluate(`({header:document.querySelector('header').getBoundingClientRect().toJSON(),logo:document.querySelector('.nsp-logo,.site-logo-img').getBoundingClientRect().toJSON(),background:document.querySelector('.zn-bgSource-image').getBoundingClientRect().toJSON()})`)));
}
for(const route of ['/','/get-a-quote/']){
 await b.send('Emulation.setDeviceMetricsOverride',{width:390,height:900,deviceScaleFactor:1,mobile:true});await b.send('Page.navigate',{url:'https://nextstepprinting.com'+route});await new Promise(r=>setTimeout(r,1600));
 console.log('MOBILE',route,JSON.stringify(await b.evaluate(`({header:document.querySelector('header').getBoundingClientRect().toJSON(),position:getComputedStyle(document.querySelector('header')).position,logo:document.querySelector('.site-logo-img').getBoundingClientRect().toJSON(),image:document.querySelector('.site-logo-img').src,wrapper:document.querySelector('#page_wrapper').style.cssText,sections:[...document.querySelectorAll('.zn_pb_wrapper>section')].slice(0,2).map(e=>({rect:e.getBoundingClientRect().toJSON(),margin:getComputedStyle(e).marginTop}))})`)));
}
await b.close();
