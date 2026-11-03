const musicbrainzGenre=require('./musicbrainz-genres.cjs');
let token='',expires=0;const cache=new Map();
module.exports=async function(req,res){
 const send=(code,data)=>{res.statusCode=code;res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify(data));};
 if(req.method!=='GET')return send(405,{error:'Method not allowed'});
 const params=new URL(req.url,'http://localhost').searchParams,related=params.get('related');
 const offset=Number(params.get('offset')||0);
 if(!Number.isInteger(offset)||offset<0||offset>1000)return send(400,{error:'Invalid search offset.'});
 let q=params.get('q')?.trim();
 if(related&&!/^[A-Za-z0-9]{22}$/.test(related))return send(400,{error:'Invalid track.'});
 if(related)q='related:'+related;
 if(!q||q.length>200)return send(400,{error:'Enter a search of 1–200 characters.'});
 const client=process.env.SPOTIFY_CLIENT_ID,secret=process.env.SPOTIFY_CLIENT_SECRET;
 if(!client||!secret)return send(503,{error:'In-page search is not connected yet. Search on Spotify below, then paste a song or playlist link here.'});
 const cacheKey=q+'|offset:'+offset;
 const hit=cache.get(cacheKey);if(hit&&hit.until>Date.now())return send(200,hit.data);
 try{
 if(!token||expires<Date.now()){const r=await fetch('https://accounts.spotify.com/api/token',{method:'POST',headers:{Authorization:'Basic '+Buffer.from(client+':'+secret).toString('base64'),'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=client_credentials',signal:AbortSignal.timeout(10000)});if(!r.ok)return send(502,{error:'Spotify credentials could not be authorized. You can still paste Spotify links.'});const d=await r.json();token=d.access_token;expires=Date.now()+(d.expires_in-60)*1000;}
 let genre=null,genreSource=null,fallbackArtist=null;
 if(related){
  const get=async path=>{const response=await fetch('https://api.spotify.com/v1/'+path,{headers:{Authorization:'Bearer '+token},signal:AbortSignal.timeout(10000)});if(!response.ok)throw Error();return response.json();};
  const track=await get('tracks/'+related+'?market=US');
  for(const artist of (track.artists||[]).slice(0,2)){
   const info=await get('artists/'+artist.id).catch(()=>({}));
   genre=(info.genres||[])[0];if(genre)break;
  }
  if(genre)genreSource='Spotify artist';
  if(!genre){const fallback=await musicbrainzGenre(track).catch(()=>null);if(fallback){genre=fallback.genre;genreSource=fallback.genreSource;}}
  if(!genre){
   fallbackArtist=track.artists?.[0];
   if(!fallbackArtist)return send(200,{items:[],reason:'No artist or genre available for this song.'});
   q='artist:"'+fallbackArtist.name.replace(/["\\]/g,'')+'"';
  }else q='genre:"'+genre.replace(/["\\\\]/g,'')+'"';
 }
 const r=await fetch('https://api.spotify.com/v1/search?'+new URLSearchParams({q,type:(related||q.startsWith('genre:'))?'track':'track,album',limit:'10',offset:String(offset),market:'US'}),{headers:{Authorization:'Bearer '+token},signal:AbortSignal.timeout(10000)});
 if(!r.ok){if(r.status===401)expires=0;return send(r.status===429?429:502,{error:r.status===429?'Spotify search limit reached. Please try later.':'Spotify search is unavailable for this app. Use Search on Spotify or paste a link.'});}
 const d=await r.json(),items=[...(d.tracks?.items||[]),...(d.albums?.items||[])].filter(Boolean).filter(x=>!fallbackArtist||(x.artists||[]).some(a=>a.id===fallbackArtist.id)).filter(x=>!related||x.id!==related).map(x=>({name:x.name,type:x.type,url:x.external_urls?.spotify,artist:(x.artists||[]).map(a=>a.name).join(', '),image:(x.album?.images||x.images||[])[0]?.url||''})).filter(x=>x.url);
 const nextOffset=d.tracks?.next&&offset+10<=1000?offset+10:null;
 const data={items,genre,genreSource,fallbackArtist:fallbackArtist?.name||null,nextOffset};if(cache.size>=100)cache.delete(cache.keys().next().value);cache.set(cacheKey,{data,until:Date.now()+300000});return send(200,data);
 }catch{return send(502,{error:'Could not reach Spotify. Try again, or paste a Spotify link.'});}
};
