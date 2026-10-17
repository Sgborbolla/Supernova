const fs=require('fs');
const DIR='/data/data/com.termux/files/home/supernova/.musicdl';
const all=require(DIR+'/oga_music.json');
const want=/(cyber|synth|neon|space|star|galax|battle|boss|arcade|retro|electro|techno|pulse|drive|night|city|dark|dragon|void|nova|cosmic|machine|reactor|lazer|laser|action|run|speed|turbo|circuit|grid|energy|power|storm|fire|ice|flame|rocket|orbit|mission|combat|attack|war|fighter|ship|engine|thrust|warp|jump|crash|impact|chase|hunt|escape|danger|alert|system|hack|data|digital|code|virus|core|nexus|matrix|space)/i;
function pickFile(x){ const ogg=x.files.find(f=>/\.ogg$/i.test(f)); if(ogg) return ogg; const mp3=x.files.find(f=>/\.mp3$/i.test(f)); return mp3||null; }
let pool=all.filter(x=>/^CC0$/i.test(x.license)).map(x=>({...x,file:pickFile(x)})).filter(x=>x.file);
const seenSlug=new Set(), seenBase=new Set();
pool=pool.filter(x=>{ const slug=x.slug; if(seenSlug.has(slug)) return false; seenSlug.add(slug);
  const base=decodeURIComponent(x.file.split('/').pop()).toLowerCase(); if(seenBase.has(base)) return false; seenBase.add(base); return true; });
const scored=pool.map(x=>({x,score:(want.test(x.slug+' '+x.title)?2:0)+(/\.ogg$/i.test(x.file)?1:0)}));
scored.sort((a,b)=>b.score-a.score);
const picked=scored.slice(0,64).map(s=>s.x);
if(picked.length<64){ console.error('Solo',picked.length,'CC0 con audio'); process.exit(1); }
const slots=['intro','select','credits','victory'].concat(Array.from({length:60},(_,i)=>'lvl'+i));
const manifest=picked.map((x,i)=>({slot:slots[i],src:x.file,title:x.title,author:x.author,license:x.license,slug:x.slug}));
fs.writeFileSync(DIR+'/music_manifest.json',JSON.stringify(manifest,null,1));
fs.writeFileSync(DIR+'/download_list.tsv',manifest.map((m,i)=>[i,m.src,m.slot].join('\t')).join('\n'));
console.log('seleccionadas:',manifest.length,'| ogg:',picked.filter(x=>/\.ogg$/i.test(x.file)).length,'| mp3:',picked.filter(x=>/\.mp3$/i.test(x.file)).length);
console.log(manifest.slice(0,8).map(m=>m.slot+'  '+m.title+'  ['+m.author+']').join('\n'));
