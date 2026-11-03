// Entertainment themes, not age profiling; strict search filtering stays enabled.
const topics=['funny brainrot memes','absurd internet humor memes','AI animated comedy','AI animals funny memes','viral funny memes','relatable school comedy','Minecraft funny memes','Roblox funny moments','gaming meme edits','surreal animated memes','funny cat voiceover memes','viral comedy animation'];
const cache=new Map(),pending=new Map();let calls=0,day='',cooldown=0;
async function discover(batch,pageToken){
 const key=process.env.YOUTUBE_API_KEY;
 if(!key||key.startsWith('PASTE_'))throw Error('setup');
 if(Date.now()<cooldown)throw Error('quota');
 const today=new Date().toISOString().slice(0,10);if(day!==today){calls=0;day=today;}
 if(calls>=80)throw Error('quota');calls++;
 const get=async(endpoint,params)=>{
  const response=await fetch('https://www.googleapis.com/youtube/v3/'+endpoint+'?'+new URLSearchParams(params),{headers:{'X-Goog-Api-Key':key},signal:AbortSignal.timeout(15000)});
  if(!response.ok){if(response.status===403||response.status===429)cooldown=Date.now()+300000;throw Error(response.status===403||response.status===429?'quota':'upstream');}return response.json();
 };
 const cutoff=Date.now()-30*86400000;
 const result=await get('search',{...(pageToken?{pageToken}:{}),part:'snippet',type:'video',q:topics[batch%topics.length]+' #shorts',publishedAfter:new Date(cutoff).toISOString(),relevanceLanguage:'en',regionCode:'US',videoDuration:'short',videoEmbeddable:'true',videoSyndicated:'true',safeSearch:'strict',maxResults:'50',order:'date'});
 const ids=(result.items||[]).map(x=>x.id?.videoId).filter(x=>/^[\w-]{11}$/.test(x||''));if(!ids.length)return {items:[],nextPageToken:result.nextPageToken||''};
 const details=await get('videos',{part:'snippet,contentDetails,status',id:ids.join(',')});
 details.items=(details.items||[]).filter(video=>{
  if(Date.parse(video.snippet?.publishedAt||'')<cutoff||!video.snippet?.publishedAt)return false;
  const region=video.contentDetails?.regionRestriction;
  return video.status?.privacyStatus==='public'&&video.status?.uploadStatus==='processed'&&video.snippet?.liveBroadcastContent==='none'&&video.contentDetails?.contentRating?.ytRating!=='ytAgeRestricted'&&!region?.blocked?.includes('US')&&(!region?.allowed||region.allowed.includes('US'));
 });
 const seconds=value=>{const m=/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(value||'');return m?Number(m[1]||0)*3600+Number(m[2]||0)*60+Number(m[3]||0):Infinity;};
 // Audio language, not title language: English titles do not imply English speech.
 const items=(details.items||[]).filter(x=>/^en(?:-|$)/i.test(x.snippet?.defaultAudioLanguage||'')).filter(x=>x.status?.embeddable&&seconds(x.contentDetails?.duration)>0&&seconds(x.contentDetails?.duration)<=180&&/#shorts\b/i.test(x.snippet?.title+' '+x.snippet?.description)).map(x=>({platform:'youtube',id:x.id,url:'https://www.youtube.com/shorts/'+x.id,title:x.snippet.title,audioLanguage:x.snippet.defaultAudioLanguage}));
 return {items,nextPageToken:result.nextPageToken||''};
}
module.exports=async(req,res)=>{
 const send=(status,data)=>{res.statusCode=status;res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify(data));};
 if(req.method!=='GET')return send(405,{error:'Method not allowed'});
 const batch=Number(new URL(req.url,'http://localhost').searchParams.get('batch')||0);
 const pageToken=new URL(req.url,'http://localhost').searchParams.get('pageToken')||'';
 if(pageToken.length>512||!/^[\w=-]*$/.test(pageToken))return send(400,{error:'Invalid page token'});
 const cacheKey=batch+':'+pageToken;
 if(!Number.isInteger(batch)||batch<0||batch>=24)return send(400,{error:'Invalid batch'});
 try{const hit=cache.get(cacheKey);if(hit&&hit.until>Date.now())return send(200,hit.data);
  if(!pending.has(cacheKey))pending.set(cacheKey,discover(batch,pageToken).then(data=>{if(cache.size>=100)cache.delete(cache.keys().next().value);cache.set(cacheKey,{data,until:Date.now()+3600000});return data;}).finally(()=>pending.delete(cacheKey)));
  return send(200,await pending.get(cacheKey));
 }catch(e){return send(e.message==='setup'?503:502,{error:e.message==='setup'?'YouTube discovery needs a server API key.':e.message==='quota'?'YouTube quota or key restrictions blocked discovery. Saved videos still work.':'YouTube discovery is temporarily unavailable. Try again later.'});}
};
