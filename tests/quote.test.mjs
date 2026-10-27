import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createQuoteHandler} from '../functions/api/quote.js';
import {onRequestGet} from '../functions/api/form-config.js';
const env={RESEND_API_KEY:'isolated-mock-key',QUOTE_FROM:'Mock <sender@example.test>',QUOTE_TO:'recipient@example.test',TURNSTILE_SECRET_KEY:'isolated-secret',TURNSTILE_SITE_KEY:'public-mock-key'};
const values={name:'Customer',email:'customer@example.test',phone:'555 123 4567',city:'Fountain Valley',projectType:'Vehicle wrap',details:'Please quote a wrap.',website:'',submissionId:'52b3ba4e-642a-4e43-8578-970d01838524',turnstileToken:'mock-token'};
function request(data=values,options={}){return new Request('https://preview.example.test/api/quote',{method:'POST',headers:{Origin:'https://preview.example.test','Content-Type':'application/json',...options.headers},body:JSON.stringify(data),...options});}
function mock({accepted=true,verified=true,hostname='preview.example.test',action='quote',id='mock-email-id',throws=false}={}){
  const calls=[];const fetch=async(url,options)=>{calls.push({url,options});if(throws)throw new Error('Mock timeout');return url.includes('siteverify')?Response.json({success:verified,hostname,action}):Response.json(accepted?{id}:{message:'Mock rejected'},{status:accepted?200:422});};return {calls,fetch};
}
test('success only after verification and provider acceptance; server owns sender and recipient',async()=>{
  const provider=mock();const response=await createQuoteHandler(provider.fetch)({request:request({...values,from:'attacker@example.test',to:'attacker@example.test'}),env});
  assert.equal(response.status,200);assert.equal((await response.json()).ok,true);assert.equal(provider.calls.length,2);
  const delivery=provider.calls[1];assert.equal(delivery.url,'https://api.resend.com/emails');const body=JSON.parse(delivery.options.body);
  assert.equal(body.from,env.QUOTE_FROM);assert.deepEqual(body.to,[env.QUOTE_TO]);assert.equal(body.reply_to,values.email);assert.match(body.text,/Project Details: Please quote/);
});
test('retries use stable idempotency keys; changed content uses a new key',async()=>{
  const provider=mock();const handler=createQuoteHandler(provider.fetch);
  for(const details of [values.details,values.details,'Changed project'])await handler({request:request({...values,details}),env});
  const keys=provider.calls.filter(c=>c.url.includes('resend')).map(c=>c.options.headers['Idempotency-Key']);
  assert.equal(keys[0],keys[1]);assert.notEqual(keys[1],keys[2]);
});
for(const [name,changes,status] of [['missing name',{name:''},400],['invalid email',{email:'invalid'},400],['email injection',{email:'a@example.test\r\nBcc:x@example.test'},400],['long details',{details:'x'.repeat(6001)},400],['honeypot',{website:'bot'},400],['missing captcha',{turnstileToken:''},400],['invalid retry id',{submissionId:'invalid'},400]]){
  test(name+' is rejected without provider calls',async()=>{const p=mock();const r=await createQuoteHandler(p.fetch)({request:request({...values,...changes}),env});assert.equal(r.status,status);assert.equal(p.calls.length,0);});
}
test('cross-origin request is rejected',async()=>{const p=mock();const r=await createQuoteHandler(p.fetch)({request:request(values,{headers:{Origin:'https://other.example.test','Content-Type':'application/json'}}),env});assert.equal(r.status,403);assert.equal(p.calls.length,0);});
test('oversize streamed body is rejected without trusting content-length',async()=>{const p=mock();const r=await createQuoteHandler(p.fetch)({request:request({...values,extra:'x'.repeat(17000)}),env});assert.equal(r.status,413);assert.equal(p.calls.length,0);});
test('malformed JSON and null are rejected',async()=>{const p=mock();for(const body of ['{','null']){const r=await createQuoteHandler(p.fetch)({request:new Request('https://preview.example.test/api/quote',{method:'POST',headers:{Origin:'https://preview.example.test','Content-Type':'application/json'},body}),env});assert.equal(r.status,400);}assert.equal(p.calls.length,0);});
for(const options of [{verified:false},{hostname:'attacker.example.test'},{action:'other'}])test('invalid captcha verdict prevents delivery '+JSON.stringify(options),async()=>{const p=mock(options);const r=await createQuoteHandler(p.fetch)({request:request(),env});assert.equal(r.status,400);assert.equal(p.calls.length,1);});
for(const options of [{accepted:false},{id:''},{throws:true}])test('provider failure never reports success '+JSON.stringify(options),async()=>{const p=mock(options);const r=await createQuoteHandler(p.fetch)({request:request(),env});assert.equal(r.status,503);assert.equal((await r.json()).ok,false);});
test('missing setup fails closed and does not call any provider',async()=>{const p=mock();const r=await createQuoteHandler(p.fetch)({request:request(),env:{}});assert.equal(r.status,503);assert.equal(p.calls.length,0);});
test('public configuration exposes only site key',async()=>{assert.deepEqual(await onRequestGet({env}).json(),{siteKey:env.TURNSTILE_SITE_KEY});assert.equal(onRequestGet({env:{}}).status,503);});
