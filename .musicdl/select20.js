const fs=require('fs');
const res=JSON.parse(fs.readFileSync('probe_small.json','utf8'));
const used=new Set(['Caves.ogg','new_factory_129bpm.ogg','cyberpunkmenu.ogg','cyberpunkmenu.mp3','claimed_by_the_void_mix.ogg','corrupt_data_stream.ogg','corrupt_data_stream.mp3','ruskerdax_-_cybershaman_preview.ogg','synthwavehouse.ogg','auferstanden_aus_ruinen.ogg','slampe.ogg','space_adventure_bpm140.ogg','boss_fight_2.ogg','space_city_bpm115.ogg','Vaporwave.ogg','techno.ogg','diver_1.ogg','slow_techno_track_2_prev.ogg','techno_dawn_prog_v4.ogg','fast_techno_action_loop.ogg','MyVeryOwnDeadShip.ogg','ObservingTheStar.ogg','OutThere.ogg','crazy-space.ogg','Out in Space.ogg','Space Bass.ogg','Spacearray.ogg','Vape In Space.ogg','Space Bass Evil.ogg','46.ogg','eeriechoir.ogg','boss_battle_10_retro_0.ogg'].map(decodeURIComponent));
const base=u=>decodeURIComponent(u.split('/').pop());
const norm=u=>base(u).replace(/_\d+\./,'.');
const seen=new Set();
const pick=[];
for(const r of res){
  const b=base(r.url), n=norm(r.url);
  if(used.has(b)) continue;
  if(seen.has(n)) continue;
  if(r.size<150000||r.size>1600000) continue;          // música pequeña, no SFX
  if(!/\.(ogg|mp3)$/i.test(b)) continue;
  const bad=/hover|click|beep|blip|select|coin|jump|footstep|hurt|explosion|laser|shoot|walk|step|impact|ui_|_ui|pop\.|confirm|cancel/i;
  if(bad.test(b)) continue;
  seen.add(n); pick.push(r);
  if(pick.length>=20) break;
}
for(const r of pick) console.log((r.size/1048576).toFixed(2)+'MB\t'+base(r.url)+'\t'+r.title.slice(0,42)+'\t'+r.license);
console.log('TOTAL',pick.length);
fs.writeFileSync('extra20.json',JSON.stringify(pick,null,1));
