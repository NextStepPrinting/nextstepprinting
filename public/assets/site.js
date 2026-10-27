const toggle = document.querySelector('.nsp-menu-toggle');
const menu = document.querySelector('#nsp-menu');
const updateHeader=()=>document.body.classList.toggle('nsp-stuck',window.scrollY>185);
window.addEventListener('scroll',updateHeader,{passive:true});updateHeader();
const currentDate=document.querySelector('#current-date');
if(currentDate)currentDate.textContent=new Intl.DateTimeFormat('en-US',{month:'long',day:'numeric',year:'numeric'}).format(new Date());
const canonical=document.querySelector('link[rel="canonical"]')?.href||location.href;
document.querySelectorAll('.zn-shareIcons').forEach(share=>{
  const image=document.querySelector('.portfolio-item-right img')?.getAttribute('src');
  const title=document.querySelector('.portfolio-item-title')?.textContent.trim()||document.title;
  const destinations={twitter:'https://x.com/intent/tweet?'+new URLSearchParams({url:canonical,text:title}),facebook:'https://www.facebook.com/sharer/sharer.php?'+new URLSearchParams({u:canonical}),pinterest:'https://www.pinterest.com/pin/create/button/?'+new URLSearchParams({url:canonical,description:title,...(image?{media:new URL(image,canonical).href}:{})}),mail:'mailto:?'+new URLSearchParams({subject:'Check out this awesome project: '+title,body:'You can see it live here '+canonical}).toString().replaceAll('+','%20')};
  share.querySelector('.zn-shareIcons-item--gplus')?.remove();
  for(const [name,url] of Object.entries(destinations)){const link=share.querySelector('.zn-shareIcons-item--'+name);if(link){link.href=url;link.setAttribute('aria-label',link.title);if(name!=='mail'){link.target='_blank';link.rel='noopener noreferrer';}}}
});
function setMenu(open) {
  toggle?.setAttribute('aria-expanded',String(open));
  toggle?.setAttribute('aria-label',open?'Close menu':'Open menu');
  if(menu)menu.hidden=!open;
  document.body.style.overflow=open?'hidden':'';
  if(open)menu.querySelector('a')?.focus();else toggle?.focus();
}
toggle?.addEventListener('click',()=>setMenu(menu.hidden));
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&!menu.hidden)setMenu(false);
  if(e.key==='Tab'&&!menu.hidden){
    const elements=[toggle,...menu.querySelectorAll('a')];
    const index=elements.indexOf(document.activeElement);
    if(e.shiftKey&&index===0){e.preventDefault();elements.at(-1).focus();}
    if(!e.shiftKey&&index===elements.length-1){e.preventDefault();toggle.focus();}
  }
});
// Native horizontal scrolling with explicit controls replaces Slick.
document.querySelectorAll('.js-slick').forEach(list=>{
  const controls=document.createElement('div');controls.className='nsp-carousel-controls';
  const move=direction=>{const end=list.scrollWidth-list.clientWidth;let x=list.scrollLeft+direction*(list.firstElementChild?.clientWidth||list.clientWidth);if(x>end+5)x=0;if(x<0)x=end;list.scrollTo({left:x,behavior:'instant'});};
  for(const [label,direction] of [['Previous',-1],['Next',1]]){
    const button=document.createElement('button');button.type='button';button.textContent=direction<0?'‹':'›';button.setAttribute('aria-label',label+' projects');
    button.addEventListener('click',()=>move(direction));controls.append(button);
  }
  const nav=list.closest('.recentwork_carousel')?.querySelector('.znSlickNav');if(nav)nav.append(controls);else list.after(controls);
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches)setInterval(()=>{if(!document.hidden&&!list.matches(':hover')&&!list.parentElement.matches(':focus-within'))move(1);},5000);
});
// Preserve the archive's original name/date sorting and directions.
document.querySelectorAll('.hg-portfolio-sortable').forEach(archive=>{
  const list=archive.querySelector('.kl-ptfsortable-items');let by='date',ascending=true;
  archive.querySelectorAll('[data-option-value]').forEach(link=>link.addEventListener('click',e=>{
    e.preventDefault();const value=link.dataset.optionValue;
    if(value==='name'||value==='date')by=value;else ascending=value==='true';
    [...list.children].sort((a,b)=>{
      const result=by==='date'?Number(a.dataset.date)-Number(b.dataset.date):(a.querySelector('h3,h4')?.textContent||a.textContent).trim().localeCompare((b.querySelector('h3,h4')?.textContent||b.textContent).trim());
      return ascending?result:-result;
    }).forEach(item=>list.append(item));
    archive.querySelectorAll('[data-option-value]').forEach(a=>a.setAttribute('aria-pressed',String(a.dataset.optionValue===by||a.dataset.optionValue===String(ascending))));
  }));
});
const imageLinks=[...document.querySelectorAll('a[data-lightbox],a[data-mfp="image"],.mfp-gallery a[href]')].filter(a=>/\.(jpe?g|png|webp|gif)$/i.test(a.pathname));
if(imageLinks.length){
  const dialog=document.createElement('dialog');dialog.className='nsp-lightbox';dialog.setAttribute('aria-label','Project image');
  dialog.innerHTML='<button type="button" class="nsp-close" aria-label="Close image">Close</button><img alt=""><div class="nsp-lightbox-controls"><button type="button" data-prev>Previous</button><span></span><button type="button" data-next>Next</button></div>';
  document.body.append(dialog);let index=0,returnFocus;
  function show(n){index=(n+imageLinks.length)%imageLinks.length;const a=imageLinks[index];dialog.querySelector('img').src=a.href;dialog.querySelector('img').alt=a.title||a.querySelector('img')?.alt||'Next Step Printing project';dialog.querySelector('span').textContent=`${index+1} / ${imageLinks.length}`;}
  imageLinks.forEach((a,i)=>a.addEventListener('click',e=>{e.preventDefault();returnFocus=a;show(i);dialog.showModal();}));
  dialog.querySelector('.nsp-close').onclick=()=>dialog.close();
  dialog.querySelector('[data-prev]').onclick=()=>show(index-1);dialog.querySelector('[data-next]').onclick=()=>show(index+1);
  dialog.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')show(index-1);if(e.key==='ArrowRight')show(index+1);});
  dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});dialog.addEventListener('close',()=>returnFocus?.focus());
}
const form=document.querySelector('[data-quote-form]');
if(form){
  const status=form.querySelector('[data-form-status]');const button=form.querySelector('button[type="submit"],button:not([type])');
  const submitId=form.elements.submissionId;submitId.value=crypto.randomUUID();
  let widget,turnstileReady=false;
  const say=(text,error=false)=>{status.textContent=text;status.dataset.error=String(error);};
  // Preserve the form in memory on every failure; never store personal data in browser storage.
  fetch('/api/form-config').then(async response=>{if(!response.ok)throw new Error();return response.json();}).then(config=>{
    if(!config.siteKey)throw new Error();
    const slot=document.createElement('div');slot.className='col-sm-12';form.querySelector('.zn_submit_container').parentElement.before(slot);
    window.nspCaptchaReady=()=>{widget=window.turnstile.render(slot,{sitekey:config.siteKey,action:'quote',theme:'dark'});turnstileReady=true;};
    const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?onload=nspCaptchaReady&render=explicit';script.async=true;script.onerror=()=>say('Verification could not load. Please try again or email info@nextstepprinting.com.',true);document.head.append(script);
  }).catch(()=>say('The quote form is temporarily unavailable. Please email info@nextstepprinting.com. Your entries will stay here.',true));
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(!form.reportValidity())return;
    if(!turnstileReady){say('Verification is unavailable. Please try again or email info@nextstepprinting.com.',true);return;}
    const token=window.turnstile.getResponse(widget);if(!token){say('Please complete the verification before sending.',true);return;}
    const data=Object.fromEntries(new FormData(form));data.turnstileToken=token;
    button.disabled=true;say('Sending your message…');
    try{
      const response=await fetch('/api/quote',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:AbortSignal.timeout(20000)});
      const result=await response.json();if(!response.ok||result.ok!==true)throw new Error(result.message||'Your message could not be sent. Please try again.');
      say('Thank you! Your message has been sent. Our team will get back to you.');form.reset();submitId.value=crypto.randomUUID();
    }catch(error){say(error.name==='TimeoutError'?'The request timed out. Your entries are preserved. Please try again.':error.message||'Unable to send. Your entries are preserved. Please try again.',true);}
    finally{button.disabled=false;window.turnstile.reset(widget);}
  });
}
