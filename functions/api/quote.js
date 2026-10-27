const json=(status,message,ok=false)=>Response.json({ok,message},{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const unavailable=()=>json(503,'Your message could not be sent. Your entries are preserved. Please try again or email info@nextstepprinting.com.');
const fields={name:100,email:254,phone:50,city:150,projectType:150,details:6000};
export function createQuoteHandler(providerFetch=fetch) {
  return async ({request,env})=>{
    if(request.method!=='POST')return json(405,'Use POST to submit a quote.');
    const origin=new URL(request.url).origin;
    if(request.headers.get('Origin')!==origin)return json(403,'Please submit the form from this website.');
    if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json(415,'Expected a JSON form submission.');
    if(Number(request.headers.get('Content-Length'))>16384)return json(413,'Your message is too long.');
    let data;
    try{
      const reader=request.body?.getReader();if(!reader)return json(400,'Please complete the form.');
      const chunks=[];let size=0;
      while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>16384){await reader.cancel();return json(413,'Your message is too long.');}chunks.push(value);}
      const buffer=new Uint8Array(size);let offset=0;for(const c of chunks){buffer.set(c,offset);offset+=c.length;}
      data=JSON.parse(new TextDecoder().decode(buffer));
      if(!data||typeof data!=='object'||Array.isArray(data))return json(400,'Please complete the form.');
    }catch{return json(400,'The form submission could not be read.');}
    if(data.website)return json(400,'The form submission could not be verified.');
    for(const [key,max] of Object.entries(fields)){
      if(typeof data[key]!=='string'||!data[key].trim()||data[key].trim().length>max||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(data[key]))return json(400,'Please complete all fields and stay within the allowed lengths.');
      data[key]=data[key].trim();
    }
    if(!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(data.email)||/[\r\n]/.test(data.email))return json(400,'Please enter a valid email address.');
    if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.submissionId||''))return json(400,'Please reload the form and try again.');
    if(typeof data.turnstileToken!=='string'||!data.turnstileToken||data.turnstileToken.length>2048)return json(400,'Please complete the verification.');
    if(!env.RESEND_API_KEY||!env.QUOTE_FROM||!env.QUOTE_TO||!env.TURNSTILE_SECRET_KEY)return unavailable();
    try{
      const verification=await providerFetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:new URLSearchParams({secret:env.TURNSTILE_SECRET_KEY,response:data.turnstileToken,...(request.headers.get('CF-Connecting-IP')?{remoteip:request.headers.get('CF-Connecting-IP')}:{} )}),signal:AbortSignal.timeout(8000)});
      const verdict=await verification.json();
      if(!verification.ok||!verdict.success||verdict.hostname!==new URL(request.url).hostname||verdict.action!=='quote')return json(400,'Verification failed. Please complete it again.');
      const text=Object.entries(fields).map(([key])=>`${({name:'Name',email:'Email',phone:'Phone',city:'City',projectType:'Project Type',details:'Project Details'})[key]}: ${data[key]}`).join('\n\n');
      const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));
      const hash=[...new Uint8Array(digest)].map(n=>n.toString(16).padStart(2,'0')).join('');
      const result=await providerFetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`quote-${data.submissionId}-${hash}`},body:JSON.stringify({from:env.QUOTE_FROM,to:[env.QUOTE_TO],reply_to:data.email,subject:'Next Step Printing — Quote request',text}),signal:AbortSignal.timeout(10000)});
      if(!result.ok)return unavailable();
      const accepted=await result.json();if(typeof accepted.id!=='string'||!accepted.id)return unavailable();
      return json(200,'Your message has been sent.',true);
    }catch{return unavailable();}
  };
}
export const onRequest=createQuoteHandler();
