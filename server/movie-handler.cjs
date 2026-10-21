module.exports=async(req,res)=>{
 const send=(status,data)=>{res.statusCode=status;res.setHeader('Content-Type','application/json');res.end(JSON.stringify(data));};
 if(req.method!=='GET')return send(405,{error:'Method not allowed'});
 const token=process.env.TMDB_READ_ACCESS_TOKEN;
 if(!token)return send(503,{error:'Movies need TMDB_READ_ACCESS_TOKEN in the Vercel environment settings. Redeploy after adding it.'});
 const url=new URL(req.url,'https://local');
 const tv=url.pathname.match(/^\/api\/tv\/([1-9]\d{0,8})(?:\/season\/(\d{1,3}))?$/);
 if(url.pathname!=='/api/movies'&&!tv)return send(404,{error:'Not found'});
 const type=url.searchParams.get('type')==='tv'?'tv':'movie';
 const q=(url.searchParams.get('q')||'').trim().slice(0,150);
 const endpoint=tv?'tv/'+tv[1]+(tv[2]!==undefined?'/season/'+tv[2]:''):(q?'search/'+type:type+'/popular');
 const upstream=new URL('https://api.themoviedb.org/3/'+endpoint);
 upstream.searchParams.set('include_adult','false');upstream.searchParams.set('language','en-US');
 upstream.searchParams.set('page',String(Math.max(1,Math.min(500,Number(url.searchParams.get('page'))||1))));if(q)upstream.searchParams.set('query',q);
 try{
  const response=await fetch(upstream,{headers:{Authorization:'Bearer '+token.trim(),Accept:'application/json'},signal:AbortSignal.timeout(12000)});
  if(!response.ok)return send(502,{error:response.status===401?'TMDB rejected the server token. Check Vercel configuration.':'Movie provider is unavailable. Try again shortly.'});
  const data=await response.json();
  const clean=tv?(tv[2]!==undefined?{episodes:data.episodes||[]}:{seasons:(data.seasons||[]).filter(s=>s.episode_count>0)}):{page:data.page,total_pages:Math.min(data.total_pages||1,500),results:(data.results||[]).filter(m=>!m.adult).map(m=>({...m,media_type:type,title:m.title||m.name,release_date:m.release_date||m.first_air_date}))};
  res.setHeader('Cache-Control','public, s-maxage=300, stale-while-revalidate=600');send(200,clean);
 }catch{send(502,{error:'Movie provider could not be reached. Please try again.'});}
};
