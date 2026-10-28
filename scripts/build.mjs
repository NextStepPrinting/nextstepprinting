import fs from 'node:fs/promises';
await fs.mkdir('dist',{recursive:true});
await fs.cp('public','dist',{recursive:true});
console.log('Copied editable public/ files into dist/. Pages compiles functions/ separately.');
