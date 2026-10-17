const fs=require('fs');
const res=JSON.parse(fs.readFileSync('probe_sfx.json','utf8'));
const base=u=>decodeURIComponent(u.split('/').pop()).toLowerCase();
const names={
 shoot:    ['shoot','laser','fire','pew','shot','blaster'],
 laser:    ['laser','beam','zap','blaster'],
 plasma:   ['plasma','energy','electric','warp','power','charge'],
 lightning:['lightning','thunder','electric','shock','zap','zap'],
 missile:  ['missile','rocket','launch','whoosh','torpedo'],
 explosion:['explosion','explode','boom','blast','explode'],
 powerup:  ['powerup','power up','pickup','power','coin','bonus','item','up'],
 hit:      ['hit','impact','damage','hurt','thud','collision'],
 bomb:     ['bomb','explosion','explode','boom','detonat','nuke'],
 levelup:  ['level','fanfare','win','complete','success','jingle','up'],
 warning:  ['warning','alarm','alert','siren','beep'],
 click:    ['click','button','ui','select','menu','beep','blip'],
};
// solo archivos razonables (<=200KB) y formatos ogg/wav/mp3
const pool=res.filter(r=>r.size>=800 && r.size<=200000);
const used=new Set();
const chosen={};
for(const [name,kws] of Object.entries(names)){
  // score: coincide keyword en basename (fuerte) o en title
  let best=null,bestScore=-1;
  for(const r of pool){
    const b=base(r.url); const t=(r.title||'').toLowerCase();
    let score=0;
    kws.forEach((k,ki)=>{ if(b.includes(k.replace(' ',''))) score+=10-ki; else if(b.includes(k)) score+=10-ki; if(t.includes(k)) score+=2; });
    if(b.includes(name.replace(' ',''))) score+=15;
    if(score<=0) continue;
    if(r.size<3000) score+=2;                 // preferir cortos
    if(/laser|shoot|explosion|explode|missile|rocket|bomb|warning|alarm|click|button|ui|hit|impact|power|pickup|coin|level|fanfare/i.test(b)) score+=1;
    if(score>bestScore || (score===bestScore && r.size<(best?best.size:1e9))){ bestScore=score; best=r; }
  }
  chosen[name]=best;
}
const out={};
for(const [name,r] of Object.entries(chosen)){
  if(!r){ console.log(name+'\t(NO MATCH)'); continue; }
  out[name]={url:r.url,src:decodeURIComponent(r.url.split('/').pop()),size:r.size,title:r.title,license:r.license};
  console.log(name+'\t'+(r.size/1024).toFixed(0)+'KB\t'+out[name].src+'\t| '+r.title.slice(0,34)+'\t| '+r.license);
}
fs.writeFileSync('sfx_selection.json',JSON.stringify(out,null,1));
