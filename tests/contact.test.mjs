import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createContactHandler} from '../functions/api/contact.js';
const env={RESEND_API_KEY:'isolated-mock-key',QUOTE_FROM:'Mock <sender@example.test>',QUOTE_TO:'recipient@example.test',TURNSTILE_SECRET_KEY:'isolated-secret',TURNSTILE_HOSTNAMES:'preview.example.test'};
const values={name:'Customer',email:'customer@example.test',subject:'Printing question',message:'Could you help with my project?',website:'',submissionId:'52b3ba4e-642a-4e43-8578-970d01838524',turnstileToken:'mock-token'};
const request=data=>new Request('https://preview.example.test/api/contact',{method:'POST',headers:{Origin:'https://preview.example.test','Content-Type':'application/json'},body:JSON.stringify(data)});
function mock({accepted=true,action='contact',id='mock-id',throws=false}={}){
 const calls=[];
 return {calls,fetch:async(url,options)=>{calls.push({url,options});if(throws)throw new Error('Isolated failure');return url.includes('siteverify')?Response.json({success:true,hostname:'preview.example.test',action}):Response.json({id},{status:accepted?200:422});}};
}
test('contact uses real shared handler with optional phone and server-owned routing',async()=>{
 const p=mock();const r=await createContactHandler(p.fetch)({request:request({...values,to:'attacker@example.test'}),env});
 assert.equal(r.status,200);assert.equal((await r.json()).ok,true);assert.equal(p.calls.length,2);
 const body=JSON.parse(p.calls[1].options.body);assert.deepEqual(body.to,[env.QUOTE_TO]);assert.equal(body.from,env.QUOTE_FROM);assert.equal(body.reply_to,values.email);
 assert.match(body.subject,/Contact message/);assert.match(body.text,/Phone: Not provided/);assert.match(body.text,/Subject: Printing question/);assert.match(body.text,/Message: Could you/);
 assert.match(p.calls[1].options.headers['Idempotency-Key'],/^contact-/);
});
test('provided phone is included and retries are idempotent',async()=>{
 const p=mock();const handler=createContactHandler(p.fetch);for(let i=0;i<2;i++)await handler({request:request({...values,phone:'555-123-4567'}),env});
 const calls=p.calls.filter(c=>c.url.includes('resend'));assert.match(JSON.parse(calls[0].options.body).text,/Phone: 555-123-4567/);assert.equal(calls[0].options.headers['Idempotency-Key'],calls[1].options.headers['Idempotency-Key']);
});
for(const [name,change] of [['missing subject',{subject:''}],['missing message',{message:''}],['invalid email',{email:'invalid'}],['oversize subject',{subject:'x'.repeat(151)}],['oversize phone',{phone:'x'.repeat(51)}],['honeypot',{website:'bot'}]])test(name,async()=>{const p=mock();const r=await createContactHandler(p.fetch)({request:request({...values,...change}),env});assert.equal(r.status,400);assert.equal(p.calls.length,0);});
test('quote captcha cannot be reused for contact',async()=>{const p=mock({action:'quote'});const r=await createContactHandler(p.fetch)({request:request(values),env});assert.equal(r.status,400);assert.equal(p.calls.length,1);});
for(const options of [{accepted:false},{id:''},{throws:true}])test('failure is never reported as sent '+JSON.stringify(options),async()=>{const p=mock(options);const r=await createContactHandler(p.fetch)({request:request(values),env});assert.equal(r.status,503);assert.equal((await r.json()).ok,false);});
test('missing setup fails closed without provider calls',async()=>{const p=mock();const r=await createContactHandler(p.fetch)({request:request(values),env:{}});assert.equal(r.status,503);assert.equal(p.calls.length,0);});
