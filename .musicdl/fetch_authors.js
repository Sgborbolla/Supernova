const fs=require('fs');
const UA={'User-Agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'};
const cred=JSON.parse(fs.readFileSync('.musicdl/music_credits.json','utf8'));
const slugs=[...new Set(cred.filter(c=>c.slug).map(c=>c.slug))];
console.log('slugs unicos:',slugs.length);
const cache={};
async function get(url){ for(let a=0;a<3;a++){ try{ const c=new AbortController(); const t=setTimeout(()=>c.abort(),20000); const r=await fetch(url,{headers:UA,signal:c.signal}); clearTimeout(t); if(r.ok) return await r.text(); }catch(e){} } return ''; }
let i=0;
async function worker(){ while(i<slugs.length){ const s=slugs[i++];
  const html=await get('https://opengameart.org/content/'+s);
  const author=(html.match(/field-name-author-submitter[\s\S]{0,400}?<span class='username'><a href="\/users\/[^"]+">([^<]+)<\/a>/)||[])[1]
            || (html.match(/Author:&nbsp;[\s\S]{0,200}?<span class='username'><a href="\/users\/[^"]+">([^<]+)<\/a>/)||[])[1] || '';
  let license='';
  const lm=html.match(/license-name'>([^<]+)</g);
  if(lm) license=[...new Set(lm.map(x=>x.replace(/license-name'>/,'').replace('<','')))].join(' / ');
  cache[s]={author:author.trim(),license:license.trim()};
  if(i%10===0) process.stderr.write('['+i+']');
} }
(async()=>{ await Promise.all(Array.from({length:6},worker)); process.stderr.write('\n');
  let a=0; for(const s of slugs) if(cache[s].author) a++;
  console.log('con autor:',a,'/',slugs.length);
  fs.writeFileSync('.musicdl/slugs_meta.json',JSON.stringify(cache,null,1));
  const dec=s=>s.replace(/&amp;/g,'&').replace(/&#039;/g,"'").replace(/&quot;/g,'"').replace(/&gt;/g,'>').replace(/&lt;/g,'<');
  cred.forEach(c=>{ if(c.slug&&cache[c.slug]){ c.author=cache[c.slug].author||c.author; c.license=cache[c.slug].license||c.license; } c.title=dec(c.title); });
  fs.writeFileSync('.musicdl/music_credits.json',JSON.stringify(cred,null,1));
  console.log('--- muestra ---');
  for(const c of cred.slice(0,10)) console.log(c.idx+' | '+c.title.slice(0,26)+' | '+c.author+' | '+c.license);
})();
