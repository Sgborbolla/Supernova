const fs=require('fs');
const UA={'User-Agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'};
const d=JSON.parse(fs.readFileSync('oga_sfx.json','utf8'));
const items=[];
for(const e of d) for(const u of (e.files||[])){ items.push({url:u,title:e.title,slug:e.slug,license:e.license}); }
console.error('urls:',items.length);
let i=0; const res=[];
async function one(it){ for(let a=0;a<2;a++){ try{ const c=new AbortController(); const t=setTimeout(()=>c.abort(),15000); const r=await fetch(it.url,{method:'HEAD',headers:UA,signal:c.signal}); clearTimeout(t); const cl=r.headers.get('content-length'); if(r.ok&&cl) return {...it,size:+cl}; }catch(e){} } return {...it,size:null}; }
async function worker(){ while(i<items.length){ const it=items[i++]; const r=await one(it); if(r.size) res.push(r); if(i%100===0) process.stderr.write('['+i+']'); } }
(async()=>{ await Promise.all(Array.from({length:8},worker)); process.stderr.write('\n');
  res.sort((a,b)=>a.size-b.size);
  fs.writeFileSync('probe_sfx.json',JSON.stringify(res,null,1));
  console.error('con tamaño:',res.length);
  console.log('mas pequeños:');
  for(const r of res.slice(0,15)) console.log((r.size/1024).toFixed(0)+'KB\t'+r.url.split('/').pop());
})();
