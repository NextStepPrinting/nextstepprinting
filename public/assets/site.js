const toggle = document.querySelector('.nsp-menu-toggle');
const menu = document.querySelector('#nsp-menu');
const homeLogo=document.body.classList.contains('home');
const updateHeader=()=>{
  document.body.classList.toggle('nsp-stuck',window.scrollY>1);
  if(homeLogo)document.body.classList.toggle('nsp-logo-compact',window.scrollY>=80);
};
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
// Keep this breakpoint in sync with the desktop-navigation rules in site.css.
const wideMenu=window.matchMedia('(min-width:1100px)');
let menuAnimation,menuPreviousOverflow='';
const menuIsOpen=()=>!wideMenu.matches&&toggle.getAttribute('aria-expanded')==='true';
function syncMenuMode(){
  const wasOpen=toggle.getAttribute('aria-expanded')==='true';
  const focusWasInMenu=menu.contains(document.activeElement);
  menuAnimation?.cancel();
  menu.hidden=!wideMenu.matches;
  menu.inert=!wideMenu.matches;
  toggle.setAttribute('aria-expanded','false');
  toggle.setAttribute('aria-label','Open menu');
  if(wasOpen)document.body.style.overflow=menuPreviousOverflow;
  if(!wideMenu.matches&&focusWasInMenu)toggle.focus({preventScroll:true});
  else if(wasOpen)menu.querySelector('a[aria-current]')?.focus({preventScroll:true});
}
wideMenu.addEventListener('change',syncMenuMode);
syncMenuMode();
function setMenu(open) {
  if(wideMenu.matches)return;
  if(open&&!menuIsOpen())menuPreviousOverflow=document.body.style.overflow;
  menuAnimation?.cancel();
  toggle?.setAttribute('aria-expanded',String(open));
  toggle?.setAttribute('aria-label',open?'Close menu':'Open menu');
  if(menu){
    menu.hidden=false;
    menu.inert=!open;
    menuAnimation=menu.animate([{opacity:open?0:1},{opacity:open?1:0}],{duration:180,easing:'ease-out'});
    if(!open)menuAnimation.onfinish=()=>{if(!wideMenu.matches&&!menuIsOpen())menu.hidden=true;};
  }
  document.body.style.overflow=open?'hidden':menuPreviousOverflow;
  if(open)menu.querySelector('a')?.focus();else toggle?.focus();
}
toggle?.addEventListener('click',()=>setMenu(toggle.getAttribute('aria-expanded')!=='true'));
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&menuIsOpen())setMenu(false);
  if(e.key==='Tab'&&menuIsOpen()){
    const elements=[toggle,...menu.querySelectorAll('a')];
    const index=elements.indexOf(document.activeElement);
    if(e.shiftKey&&index===0){e.preventDefault();elements.at(-1).focus();}
    if(!e.shiftKey&&index===elements.length-1){e.preventDefault();toggle.focus();}
  }
});
// Native horizontal scrolling with explicit controls replaces Slick.
document.querySelectorAll('.js-slick').forEach(list=>{
  const controls=document.createElement('div');controls.className='nsp-carousel-controls';
  const move=direction=>{const end=list.scrollWidth-list.clientWidth;let x=list.scrollLeft+direction*(list.firstElementChild?.clientWidth||list.clientWidth);if(x>end+5)x=0;if(x<0)x=end;list.scrollTo({left:x,behavior:'smooth'});};
  for(const [label,direction] of [['Previous',-1],['Next',1]]){
    const button=document.createElement('button');button.type='button';button.textContent=direction<0?'‹':'›';button.setAttribute('aria-label',label+' projects');
    button.addEventListener('click',()=>move(direction));controls.append(button);
  }
  const nav=list.closest('.recentwork_carousel')?.querySelector('.znSlickNav');if(nav)nav.append(controls);else list.after(controls);
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches)setInterval(()=>{if(!document.hidden&&!list.matches(':hover')&&!list.parentElement.matches(':focus-within'))move(1);},5000);
});
// Place each card in the shortest column, like the original masonry gallery.
// Only card transforms animate; the document's wheel/touch scrolling stays native.
function createMasonry(list) {
  let frame;
  let lastWidth=0;
  const layout=()=>{
    const columns=Number(getComputedStyle(list).getPropertyValue('--gallery-columns'))||4;
    const width=list.clientWidth/columns;
    const heights=Array(columns).fill(0);
    for(const card of list.children){
      const column=heights.indexOf(Math.min(...heights));
      card.style.transform=`translate(${column*width}px, ${heights[column]}px)`;
      heights[column]+=card.getBoundingClientRect().height+20;
    }
    list.style.height=`${Math.max(...heights)}px`;
  };
  const schedule=()=>{
    cancelAnimationFrame(frame);
    frame=requestAnimationFrame(layout);
  };
  list.classList.add('nsp-masonry');
  layout();
  requestAnimationFrame(()=>list.classList.add('nsp-masonry-ready'));
  new ResizeObserver(entries=>{
    const width=entries[0].contentRect.width;
    if(width!==lastWidth){lastWidth=width;schedule();}
  }).observe(list);
  for(const image of list.querySelectorAll('img')){
    image.addEventListener('load',schedule);
    image.addEventListener('error',schedule);
  }
  document.fonts.ready.then(schedule);
  return {layout:schedule};
}
// Preserve the archive's original name/date sorting and directions.
document.querySelectorAll('.hg-portfolio-sortable').forEach(archive=>{
  const list=archive.querySelector('.kl-ptfsortable-items');let by='date',ascending=true;
  const masonry=createMasonry(list);
  archive.querySelectorAll('[data-option-value]').forEach(link=>link.addEventListener('click',e=>{
    e.preventDefault();const value=link.dataset.optionValue;
    if(value==='name'||value==='date')by=value;else ascending=value==='true';
    [...list.children].sort((a,b)=>{
      const result=by==='date'?Number(a.dataset.date)-Number(b.dataset.date):(a.querySelector('h3,h4')?.textContent||a.textContent).trim().localeCompare((b.querySelector('h3,h4')?.textContent||b.textContent).trim());
      return ascending?result:-result;
    }).forEach(item=>list.append(item));
    masonry.layout();
    archive.querySelectorAll('[data-option-value]').forEach(a=>a.setAttribute('aria-pressed',String(a.dataset.optionValue===by||a.dataset.optionValue===String(ascending))));
  }));
});
const imageLinks=[...document.querySelectorAll('a[data-lightbox],a[data-mfp="image"],.mfp-gallery a[href]')].filter(a=>/\.(jpe?g|png|webp|gif)$/i.test(a.pathname));
if(imageLinks.length){
  const dialog=document.createElement('dialog');dialog.className='nsp-lightbox';dialog.setAttribute('aria-label','Project image');
  dialog.innerHTML=`
    <button type="button" class="nsp-close" aria-label="Close image" autofocus>
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m6 6 12 12M6 18 18 6"/></svg>
    </button>
    <div class="nsp-lightbox-stage">
      <button type="button" class="nsp-lightbox-arrow" data-prev aria-label="Previous image">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m14 6-6 6 6 6"/></svg>
      </button>
      <img alt="">
      <button type="button" class="nsp-lightbox-arrow" data-next aria-label="Next image">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m10 6 6 6-6 6"/></svg>
      </button>
      <span class="nsp-lightbox-count" role="status" aria-live="polite" aria-atomic="true"></span>
    </div>`;
  document.body.append(dialog);let index=0,returnFocus,previousOverflow;
  const enlargedImage=dialog.querySelector('img');
  enlargedImage.addEventListener('load',()=>enlargedImage.animate([{opacity:.4},{opacity:1}],{duration:160,easing:'ease-out'}));
  function show(n){index=(n+imageLinks.length)%imageLinks.length;const a=imageLinks[index];enlargedImage.src=a.href;enlargedImage.alt=a.title||a.querySelector('img')?.alt||'Next Step Printing project';dialog.querySelector('.nsp-lightbox-count').textContent=`${index+1} / ${imageLinks.length}`;}
  if(imageLinks.length===1)dialog.querySelectorAll('.nsp-lightbox-arrow').forEach(button=>button.hidden=true);
  imageLinks.forEach((a,i)=>a.addEventListener('click',e=>{e.preventDefault();returnFocus=a;previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';show(i);dialog.showModal();}));
  dialog.querySelector('.nsp-close').onclick=()=>dialog.close();
  dialog.querySelector('[data-prev]').onclick=()=>show(index-1);dialog.querySelector('[data-next]').onclick=()=>show(index+1);
  dialog.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();show(index-1);}if(e.key==='ArrowRight'){e.preventDefault();show(index+1);}});
  dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
  dialog.addEventListener('close',()=>{document.body.style.overflow=previousOverflow;returnFocus?.focus({preventScroll:true});});
}
const form=document.querySelector('[data-quote-form],[data-contact-form]');
if(form){
  const formKind=form.hasAttribute('data-contact-form')?'contact':'quote';
  const status=form.querySelector('[data-form-status]');const button=form.querySelector('button[type="submit"],button:not([type])');
  const submitId=form.elements.submissionId;submitId.value=crypto.randomUUID();
  let widget,turnstileReady=false,deliveryReady=false;
  const say=(text,error=false)=>{status.textContent=text;status.dataset.error=String(error);};
  const unavailable=()=>say(formKind==='contact'?'Online messaging is currently unavailable. Please use the email link above. Your entries will stay here.':'The quote form is temporarily unavailable. Please email info@nextstepprinting.com. Your entries will stay here.',true);
  // Preserve the form in memory on every failure; never store personal data in browser storage.
  fetch('/api/form-config').then(async response=>{if(!response.ok)throw new Error();return response.json();}).then(config=>{
    if(!config.siteKey)throw new Error();
    deliveryReady=config.ready!==false;
    if(!deliveryReady)unavailable();
    let slot=form.querySelector('[data-verification]');
    if(!slot){slot=document.createElement('div');slot.className='col-sm-12';form.querySelector('.zn_submit_container').parentElement.before(slot);}
    slot.style.display='block';
    window.nspCaptchaReady=()=>{
      let widgetSize;
      const render=()=>{
        const style=getComputedStyle(slot);
        const availableWidth=slot.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight);
        const size=availableWidth<300?'compact':'flexible';
        if(widget!==undefined&&size===widgetSize)return;
        if(widget!==undefined)window.turnstile.remove(widget);
        widgetSize=size;
        widget=window.turnstile.render(slot,{sitekey:config.siteKey,action:formKind,theme:formKind==='contact'?'light':'dark',size,
          'expired-callback':()=>deliveryReady?say('Verification expired. Please complete it again before sending.',true):unavailable(),
          'error-callback':()=>deliveryReady?say('Verification could not be completed. Please try again.',true):unavailable()});
        turnstileReady=true;
      };
      render();new ResizeObserver(render).observe(slot);
    };
    const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?onload=nspCaptchaReady&render=explicit';script.async=true;script.onerror=()=>deliveryReady?say('Verification could not load. Please try again or email info@nextstepprinting.com.',true):unavailable();document.head.append(script);
  }).catch(unavailable);
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(!form.reportValidity())return;
    if(!deliveryReady){unavailable();return;}
    if(!turnstileReady){say('Verification is unavailable. Please try again or email info@nextstepprinting.com.',true);return;}
    const token=window.turnstile.getResponse(widget);if(!token){say('Please complete the verification before sending.',true);return;}
    const data=Object.fromEntries(new FormData(form));data.turnstileToken=token;
    button.disabled=true;say('Sending your message…');
    try{
      const response=await fetch(form.getAttribute('action'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:AbortSignal.timeout(20000)});
      const result=await response.json();if(!response.ok||result.ok!==true)throw new Error(result.message||'Your message could not be sent. Please try again.');
      say('Thank you! Your message has been sent. Our team will get back to you.');form.reset();submitId.value=crypto.randomUUID();
    }catch(error){say(error.name==='TimeoutError'?'The request timed out. Your entries are preserved. Please try again.':error.message||'Unable to send. Your entries are preserved. Please try again.',true);}
    finally{button.disabled=false;window.turnstile.reset(widget);}
  });
}
