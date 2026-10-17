const fs=require('fs');
const UA={'User-Agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'};
const probe=JSON.parse(fs.readFileSync('.musicdl/probe_sfx.json','utf8'));
const base=u=>decodeURIComponent(u.split('/').pop());
const byBase={}; for(const r of probe){ if(!byBase[base(r.url)]) byBase[base(r.url)]=r; }

const srcs=[
 // base 12
 ['shoot','laser_shooting_sfx.mp3'],['laser','sfx_laser_1.mp3'],['plasma','snd_fillenergy.wav'],
 ['lightning','groundhit.wav'],['missile','burst fire.mp3'],['explosion','explosion_preview.mp3'],
 ['powerup','SFX_Powerup_21.mp3'],['hit','playerhit.mp3'],['bomb','8bit_bomb_explosion.wav'],
 ['levelup','level_up.wav'],['warning','alarm.ogg'],['click','MP3_Button Clicks & Beeps_04.mp3'],
 // enemigos 16
 ['exp_drone','explosion02.ogg'],['exp_swarm','Explosion6.wav'],['exp_hunter','explosion03.ogg'],
 ['exp_elite','explosions4.ogg'],['exp_sniper','explosion04.ogg'],['exp_bomber','explosion2.ogg'],
 ['exp_kamikaze','boom2.mp3'],['exp_shielder','explosion01.ogg'],['exp_spinner','boom1.mp3'],
 ['exp_mothership','boom9.mp3'],['exp_boss','boom6.mp3'],['exp_destroyer','explosion5.ogg'],
 ['exp_hive','explosion3.ogg'],['exp_dreadnought','SFX_Explosion_06.mp3'],['exp_titan','SFX_Explosion_09.mp3'],
 ['exp_overlord','deathboom.wav'],
 // jugadores 4
 ['pdeath_viper','boom4.mp3'],['pdeath_falcon','atari_boom.mp3'],['pdeath_phantom','mechanical_explosion.wav'],['pdeath_titan','dull_explosion.wav']
];

const items=[]; const slugs=new Set();
for(const [name,src] of srcs){ const r=byBase[src]; if(!r){ console.log('FALTA',src); continue; }
  items.push({name,title:r.title,license:r.license,slug:r.slug}); slugs.add(r.slug); }

const cache={};
async function get(url){ for(let a=0;a<3;a++){ try{ const c=new AbortController(); const t=setTimeout(()=>c.abort(),20000); const r=await fetch(url,{headers:UA,signal:c.signal}); clearTimeout(t); if(r.ok) return await r.text(); }catch(e){} } return ''; }
const list=[...slugs]; let i=0;
async function worker(){ while(i<list.length){ const s=list[i++];
  const html=await get('https://opengameart.org/content/'+s);
  const author=(html.match(/field-name-author-submitter[\s\S]{0,400}?<span class='username'><a href="\/users\/[^"]+">([^<]+)<\/a>/)||[])[1]
            || (html.match(/Author:&nbsp;[\s\S]{0,200}?<span class='username'><a href="\/users\/[^"]+">([^<]+)<\/a>/)||[])[1] || '';
  cache[s]=(author||'').trim();
  if(i%5===0) process.stderr.write('['+i+']');
} }
(async()=>{ await Promise.all(Array.from({length:6},worker)); process.stderr.write('\n');
  const dec=s=>String(s).replace(/&amp;/g,'&').replace(/&#039;/g,"'").replace(/&quot;/g,'"').replace(/&gt;/g,'>').replace(/&lt;/g,'<');
  for(const it of items){ it.author=cache[it.slug]||''; it.title=dec(it.title); }
  fs.writeFileSync('.musicdl/sfx_credits.json',JSON.stringify(items,null,1));
  const authors=new Set(items.map(x=>x.author).filter(Boolean));
  console.log('items:',items.length,'| autores únicos:',authors.size,'| sin autor:',items.filter(x=>!x.author).length);
  for(const it of items) console.log('  '+it.name.padEnd(16)+' | '+(it.author||'¿?').padEnd(16)+' | '+it.license.padEnd(9)+' | '+it.title.slice(0,32));
})();
