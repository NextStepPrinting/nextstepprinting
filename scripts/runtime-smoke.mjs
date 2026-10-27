import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base='http://127.0.0.1:8788';
const pages=JSON.parse(await fs.readFile('docs/page-inventory.json','utf8'));
for(const {route} of pages){const response=await fetch(base+route);assert.equal(response.status,200,route);assert.match(response.headers.get('content-type'),/text\/html/);assert.equal(response.headers.get('x-content-type-options'),'nosniff');}
let response=await fetch(base+'/api/form-config');assert.equal(response.status,503);assert.deepEqual(await response.json(),{message:'Form is not configured.'});
response=await fetch(base+'/api/quote');assert.equal(response.status,405);
const data={name:'Runtime mock customer',email:'isolated@example.test',phone:'5551234567',city:'City',projectType:'Wrap',details:'Isolated fail-closed smoke check',website:'',submissionId:'52b3ba4e-642a-4e43-8578-970d01838524',turnstileToken:'isolated-token'};
response=await fetch(base+'/api/quote',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify(data)});assert.equal(response.status,503);assert.equal((await response.json()).ok,false);
response=await fetch(base+'/api/quote',{method:'POST',headers:{Origin:'https://other.example.test','Content-Type':'application/json'},body:JSON.stringify(data)});assert.equal(response.status,403);
console.log('PASS: Cloudflare local runtime serves 15 pages with headers; config 503, method 405, missing configuration 503, cross-origin 403. No provider credentials or provider calls.');
