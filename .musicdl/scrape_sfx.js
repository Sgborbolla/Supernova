const fs=require('fs');
const DIR='/data/data/com.termux/files/home/supernova/.musicdl';
const UA={'User-Agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'};
const QUERIES=['laser','explosion','shoot','spaceship','engine','missile','rocket','bomb','powerup','pickup','hit','impact','alarm','warning','click','menu','lightning','electric','plasma','energy','scifi','sci-fi','retro','8-bit','ui','button','coin','fanfare','boost','warp','shoot sound','laser shot','explosion sound','video game sfx'];
const BASE='https://opengameart.org';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function get(url){ for(let a=0;a<3;a++){ try{ const c=new AbortController(); const t=setTimeout(()=>c.abort(),20000); const r=await fetch(url,{headers:UA,signal:c.signal}); clearTimeout(t); if(r.ok) return await r.text(); }catch(e){} await sleep(500);} return ''; }
(async()=>{
  const contents=new Set();
  for(const q of QUERIES){
    for(let page=0;page<2;page++){
      const url=BASE+'/art-search-advanced?keys='+encodeURIComponent(q)+'&field_art_type_tid%5B%5D=13&page='+page;
      const html=await get(url);
      const re=/href="\/content\/([a-z0-9-]+)"/g; let m;
      while((m=re.exec(html))){ if(m[1]!=='faq') contents.add(m[1]); }
      await sleep(250);
    }
    process.stderr.write('.');
  }
  const list=[...contents];
  console.error('\ncontenidos:',list.length);
  const out=[]; let done=0;
  async function worker(){
    while(list.length){
      const slug=list.shift();
      const html=await get(BASE+'/content/'+slug);
      done++; if(done%25===0) process.stderr.write('['+done+']');
      if(!html) continue;
      const lic=(html.match(/license-name'>([^<]+)</)||[])[1]||'';
      if(!/CC0|CC-BY 3\.0|CC-BY 4\.0|CC-BY 2\.0/i.test(lic)) continue;
      if(/SA|GPL/i.test(lic)) continue;
      const title=(html.match(/<meta property="og:title" content="([^"]+)"/)||[])[1]||slug;
      const files=new Set();
      const fre=/https:\/\/opengameart\.org\/sites\/default\/files\/[^"'\s]+?\.(ogg|wav|mp3)/gi; let f;
      while((f=fre.exec(html))){ const u=f[0]; if(/\/styles\/|\/audio_preview\//.test(u)) continue; files.add(u); }
      if(!files.size) continue;
      out.push({slug,title:title.replace(/\s+/g,' ').trim(),license:lic,files:[...files]});
    }
  }
  await Promise.all(Array.from({length:6},worker));
  fs.writeFileSync(DIR+'/oga_sfx.json', JSON.stringify(out,null,1));
  console.error('\ncandidatos:',out.length);
})();
