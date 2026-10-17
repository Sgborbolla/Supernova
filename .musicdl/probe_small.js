const fs=require('fs');
const UA={'User-Agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'};
const d=JSON.parse(fs.readFileSync('oga_music.json','utf8'));
// construir lista de {url,title,slug,license,author}
const items=[];
for(const e of d){ for(const u of (e.files||[])){ if(/\.(ogg|mp3)$/i.test(u)) items.push({url:u,title:e.title,slug:e.slug,license:e.license}); } }
console.log('urls de audio:',items.length);
let i=0, res=[];
async function one(it){
  for(let a=0;a<2;a++){
    try{ const c=new AbortController(); const t=setTimeout(()=>c.abort(),15000);
      const r=await fetch(it.url,{method:'HEAD',headers:UA,signal:c.signal}); clearTimeout(t);
      const cl=r.headers.get('content-length');
      if(r.ok&&cl) return {...it,size:+cl};
    }catch(e){}
  }
  return {...it,size:null};
}
async function worker(){ while(i<items.length){ const it=items[i++]; const r=await one(it); if(r.size) res.push(r); if(i%100===0) process.stderr.write('['+i+']'); } }
(async()=>{ await Promise.all(Array.from({length:8},worker)); process.stderr.write('\n');
  res=res.filter(r=>/\.(ogg|mp3)$/i.test(r.url));
  res.sort((a,b)=>a.size-b.size);
  const small=res.filter(r=>r.size<2000000);
  console.log('con tamaño:',res.length,'| <2MB:',small.length);
  for(const r of small.slice(0,60)) console.log((r.size/1048576).toFixed(2)+'MB\t'+r.url.replace('https://opengameart.org/sites/default/files/','')+'\t'+r.title.slice(0,40));
  fs.writeFileSync('probe_small.json',JSON.stringify(res,null,1));
})();
