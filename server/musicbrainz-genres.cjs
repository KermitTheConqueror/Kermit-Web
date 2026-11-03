// Public metadata only. Serialize requests to respect MusicBrainz's 1/sec limit.
const cache=new Map(),pending=new Map();let queue=Promise.resolve(),lastStart=0;
const normalize=s=>String(s||'').normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
const quote=s=>'"'+String(s).replace(/["\\]/g,' ')+'"';
const title=s=>String(s||'').replace(/\s*[([](?:feat\.?|ft\.?|featuring|with)\s+[^)\]]+[)\]]/gi,'').trim();
function request(path){
 const job=queue.then(async()=>{
  await new Promise(resolve=>setTimeout(resolve,Math.max(0,1100-(Date.now()-lastStart))));lastStart=Date.now();
  const response=await fetch('https://musicbrainz.org/ws/2/'+path,{headers:{Accept:'application/json','User-Agent':'KermitMusic/1.0 (https://github.com/KermitTheConqueror/Kermit-Web)'},signal:AbortSignal.timeout(6000)});
  if(response.status===404)return {};
  if(!response.ok)throw new Error('MusicBrainz unavailable');
  return response.json();
 });queue=job.catch(()=>{});return job;
}
function genreOf(entity){return [...(entity.genres||[])].filter(g=>g.count>0).sort((a,b)=>b.count-a.count)[0]?.name||null;}
async function lookup(track){
 const artists=(track.artists||[]).map(a=>normalize(a.name));
 const matches=r=>normalize(title(r.title))===normalize(title(track.name))&&(r['artist-credit']||[]).some(c=>artists.includes(normalize(c.artist?.name))||artists.includes(normalize(c.name)));
 let recordings=[];
 const isrc=track.external_ids?.isrc;
 if(/^[A-Z0-9]{12}$/i.test(isrc||''))recordings=(await request('isrc/'+isrc+'?inc=genres+artist-credits&fmt=json').catch(()=>({}))).recordings||[];
 let recording=recordings.find(matches);
 if(!recording){
  const query='recording:'+quote(title(track.name))+' AND artist:'+quote(track.artists?.[0]?.name||'');
  const search=await request('recording/?'+new URLSearchParams({query,limit:'10',fmt:'json'}));
  recording=(search.recordings||[]).find(matches);
  if(recording)recording=await request('recording/'+recording.id+'?inc=genres+artist-credits&fmt=json');
 }
 if(!recording)return null;
 const genre=genreOf(recording);if(genre)return {genre,genreSource:'MusicBrainz song'};
 const credit=(recording['artist-credit']||[]).find(c=>artists.includes(normalize(c.artist?.name))||artists.includes(normalize(c.name)));
 if(!credit?.artist?.id)return null;
 const artist=await request('artist/'+credit.artist.id+'?inc=genres&fmt=json');
 const artistGenre=genreOf(artist);return artistGenre?{genre:artistGenre,genreSource:'MusicBrainz artist'}:null;
}
module.exports=async track=>{
 const key=track.id||JSON.stringify([track.name,track.artists]);const hit=cache.get(key);
 if(hit&&hit.until>Date.now())return hit.value;
 if(pending.has(key))return pending.get(key);
 const job=lookup(track).then(value=>{if(cache.size>=500)cache.delete(cache.keys().next().value);cache.set(key,{value,until:Date.now()+(value?86400000:300000)});return value;}).finally(()=>pending.delete(key));
 pending.set(key,job);return job;
};
