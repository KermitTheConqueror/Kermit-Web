(() => {
 if(window.parent!==window){document.documentElement.classList.add('embedded-movies');document.querySelector('.site-background-video')?.remove();}
 let mediaType='movie';
 // Browser-only mode: this configuration is public to site visitors by design.
 let browserConfig;
 async function fetch(url,options){
  const address=new URL(url,location.href), type=mediaType;
  const tv=address.pathname.match(/^\/api\/tv\/([1-9]\d*)(?:\/season\/(\d+))?$/);
  if(address.pathname!=='/api/movies'&&!tv)throw Error('Unsupported movie request');
  if(!browserConfig)browserConfig=window.fetch('tmdb-browser.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Movie configuration is missing.');return r.json();}).catch(e=>{browserConfig=null;throw e;});
  const config=await browserConfig;
  if(!config.readAccessToken)throw Error('TMDB token is missing.');
  const query=(address.searchParams.get('q')||'').trim().slice(0,150);
  const endpoint=tv?`tv/${tv[1]}`+(tv[2]!==undefined?`/season/${tv[2]}`:''):(query?`search/${type}`:`${type}/popular`);
  const target=new URL('https://api.themoviedb.org/3/'+endpoint);
  target.searchParams.set('include_adult','false');target.searchParams.set('language','en-US');
  target.searchParams.set('page',String(Math.max(1,Math.min(500,Number(address.searchParams.get('page'))||1))));
  if(query)target.searchParams.set('query',query);
  const response=await window.fetch(target,{headers:{Authorization:'Bearer '+config.readAccessToken.trim(),accept:'application/json'},signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw Error(response.status===401?'TMDB rejected the token.':'TMDB is unavailable. Try again shortly.');
  const data=await response.json();
  const clean=tv?(tv[2]!==undefined?{episodes:data.episodes||[]}:{seasons:(data.seasons||[]).filter(s=>s.episode_count>0)}):{page:data.page,total_pages:Math.min(data.total_pages||1,500),results:(data.results||[]).filter(m=>!m.adult).map(m=>({...m,media_type:type,title:m.title||m.name,release_date:m.release_date||m.first_air_date}))};
  return {ok:true,json:async()=>clean};
 }
 const $=s=>document.querySelector(s),grid=$('#grid'),status=$('#status');
 let saved=[],mode='popular',page=1,total=1,query='',selected,request=0;
 let featured=[],featureIndex=0;
 let featureVersion=0;
 const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
 async function showFeature(){
  const movie=featured[featureIndex];if(!movie)return;
  const version=++featureVersion;
  const artwork=movie.backdrop_path||movie.poster_path;
  const source=/^\/[a-zA-Z0-9._-]+$/.test(artwork||'')?'https://image.tmdb.org/t/p/w1280'+artwork:'';
  if(source){const preload=new Image();preload.src=source;try{await preload.decode();}catch{}}
  if(version!==featureVersion||movie!==featured[featureIndex])return;
  const art=$('#hero-art');
  const previous=art.cloneNode();previous.removeAttribute('id');previous.className='hero-previous';
  document.querySelectorAll('.hero-previous').forEach(el=>el.remove());
  if(!art.hidden&&!reducedMotion.matches)art.after(previous);
  $('#hero-title').textContent=movie.title;$('#hero-summary').textContent=movie.overview||'Discover your next favorite movie.';
  art.hidden=!source;if(source)art.src=source;
  if(!reducedMotion.matches){
   previous.animate([{opacity:1},{opacity:0}],{duration:900,easing:'ease-in-out',fill:'forwards'}).finished.then(()=>previous.remove()).catch(()=>previous.remove());
   $('.hero-copy').animate([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:700,easing:'ease-out'});
  }
  $('#hero-details').hidden=false;$('#hero-details').onclick=()=>details(movie);
  $('#hero-count').textContent=`${featureIndex+1} / ${featured.length}`;
 }
 $('#hero-prev').remove();$('#hero-next').remove();
 setInterval(()=>{
  if(featured.length<2||document.hidden||reducedMotion.matches||document.querySelector('dialog[open]')||$('.movie-hero').matches(':hover, :focus-within'))return;
  if(window.parent!==window&&(window.frameElement?.style.display==='none'||window.frameElement?.parentElement.hidden))return;
  featureIndex=(featureIndex+1)%featured.length;showFeature();
 },7000);
 const observeGrid=new MutationObserver(()=>{if(mode==='popular'&&!query&&!featured.length){const buttons=[...grid.querySelectorAll('.movie')];if(buttons.length){fetch('/api/movies?page=1').then(r=>r.json()).then(data=>{featured=(data.results||[]).slice(0,5);showFeature();}).catch(()=>{});}}});
 observeGrid.observe(grid,{childList:true});
 try{const value=JSON.parse(localStorage.getItem('kermit.movies.watchlist.v1')||'[]');if(Array.isArray(value))saved=value.filter(m=>Number.isInteger(m.id)&&typeof m.title==='string');}catch{}
 const same=(a,b)=>a.id===b.id&&(a.media_type||'movie')===(b.media_type||'movie');
 function label(){ $('#save').textContent=saved.some(m=>same(m,selected))?'Remove from watchlist':'+ Add to watchlist'; }
 function details(m){selected=m;$('#movie-title').textContent=m.title;$('#movie-meta').textContent=`${(m.release_date||'').slice(0,4)||'Release unknown'} · ${Number(m.vote_average||0).toFixed(1)} / 10`;$('#overview').textContent=m.overview||'No description available.';$('#tmdb').href='https://www.themoviedb.org/movie/'+m.id;label();$('#details').showModal();}
 function render(list,append=false){if(!append)grid.replaceChildren();for(const m of list){const b=document.createElement('button');b.className='movie';b.setAttribute('aria-label','Details for '+m.title);const poster=document.createElement('span');poster.className='poster';poster.textContent='No poster';if(/^\/[a-zA-Z0-9._-]+$/.test(m.poster_path||'')){const image=document.createElement('img');image.src='https://image.tmdb.org/t/p/w342'+m.poster_path;image.alt='';image.loading='lazy';image.onerror=()=>{image.remove();poster.textContent='No poster';};poster.replaceChildren(image);}const title=document.createElement('strong');title.textContent=m.title;const year=document.createElement('small');year.textContent=(m.release_date||'').slice(0,4)||'Release unknown';b.append(poster,title,year);b.onclick=()=>details(m);grid.append(b);}}
 async function load(append=false){const id=++request;$('#more').hidden=true;$('#popular').setAttribute('aria-pressed',String(mode!=='watchlist'));$('#watchlist').setAttribute('aria-pressed',String(mode==='watchlist'));
  if(mode==='watchlist'){render(saved);status.textContent=saved.length?`${saved.length} movies in your watchlist`:'Your watchlist is empty. Open a movie and add it here.';return;}
  status.textContent='Loading movies…';if(!append)grid.replaceChildren();
  try{const response=await fetch('/api/movies?'+new URLSearchParams({q:query,page:String(page)}));const data=await response.json();if(id!==request)return;if(!response.ok)throw Error(data.error||'Could not load movies.');total=data.total_pages;render(data.results,append);status.textContent=data.results.length?(query?`Results for “${query}”`:'Popular right now'):'No movies found. Try another title.';$('#more').hidden=page>=total;}
  catch(error){if(id===request)status.textContent=error.message+' Use Search or Popular movies to retry.';}}
 $('#search').onsubmit=e=>{e.preventDefault();query=$('#query').value.trim();mode='popular';page=1;load();};
 $('#popular').onclick=()=>{mode='popular';query='';$('#query').value='';page=1;load();};$('#watchlist').onclick=()=>{mode='watchlist';load();};
 $('#more').onclick=()=>{page++;load(true);};$('#close').onclick=()=>$('#details').close();
 $('#save').onclick=()=>{const next=saved.some(m=>same(m,selected))?saved.filter(m=>!same(m,selected)):[selected,...saved];try{localStorage.setItem('kermit.movies.watchlist.v1',JSON.stringify(next));saved=next;label();if(mode==='watchlist')load();}catch{$('#save').textContent='Browser storage unavailable';}};
 let playing;
 function mountPlayer(){
  if(!playing || !Number.isSafeInteger(playing.id) || playing.id<=0)return;
  const frame=document.createElement('iframe');
  frame.title=playing.title+' — CineSrc player';
  frame.src='https://cinesrc.st/embed/'+(playing.media_type==='tv'?`tv/${playing.id}?s=${playing.season}&e=${playing.episode}`:'movie/'+playing.id);
  frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-presentation');
  frame.setAttribute('allow','fullscreen; autoplay; encrypted-media; picture-in-picture');
  frame.allowFullscreen=true;frame.referrerPolicy='no-referrer';
  $('#player-host').replaceChildren(frame);
 }
 $('#watch').onclick=()=>{
  if(!selected || !Number.isSafeInteger(selected.id) || selected.id<=0)return;
  if(selected.media_type==='tv'&&(!$('#episodes').value||!$('#seasons').value))return;
  playing={...selected,season:Number($('#seasons').value),episode:Number($('#episodes').value)};$('#details').close();$('#player-title').textContent=playing.title+(playing.media_type==='tv'?` · S${playing.season} E${playing.episode}`:'');
  $('#player').showModal();mountPlayer();
 };
 $('#player-close').onclick=()=>$('#player').close();
 $('#player').addEventListener('close',()=>{$('#player-host').replaceChildren();playing=null;});
 $('#player-reload').onclick=mountPlayer;
 const typeBar=document.createElement('div');typeBar.className='tabs';
 for(const [value,title] of [['movie','Movies'],['tv','TV shows']]){const button=document.createElement('button');button.textContent=title;button.setAttribute('aria-pressed',String(value===mediaType));button.onclick=()=>{mediaType=value;mode='popular';page=1;featured=[];featureIndex=0;typeBar.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));$('#popular').textContent=value==='tv'?'Popular shows':'Popular movies';$('#query').placeholder=value==='tv'?'Search TV shows…':'Search movies…';load();};typeBar.append(button);}$('#search').before(typeBar);
 const picker=document.createElement('section');picker.id='episode-picker';picker.hidden=true;
 for(const [id,title] of [['seasons','Season'],['episodes','Episode']]){const label=document.createElement('label');label.htmlFor=id;label.textContent=title;const select=document.createElement('select');select.id=id;picker.append(label,select);}
 const notice=document.createElement('p');notice.id='episode-status';notice.setAttribute('role','status');picker.append(notice);$('#watch').before(picker);
 let selectionVersion=0;
 const originalDetails=details;
 details=function(m){originalDetails(m);$('#tmdb').href='https://www.themoviedb.org/'+(m.media_type==='tv'?'tv':'movie')+'/'+m.id;picker.hidden=m.media_type!=='tv';$('#watch').disabled=m.media_type==='tv';$('#seasons').replaceChildren();$('#episodes').replaceChildren();const version=++selectionVersion;if(m.media_type==='tv'){notice.textContent='Loading seasons…';fetch('/api/tv/'+m.id).then(async r=>{if(!r.ok)throw Error();return r.json();}).then(data=>{if(version!==selectionVersion)return;for(const s of data.seasons)$('#seasons').add(new Option(s.name,s.season_number));return loadEpisodes(version);}).catch(()=>{if(version===selectionVersion)notice.textContent='Could not load seasons. Close and reopen to retry.';});}};
 async function loadEpisodes(version=selectionVersion){$('#watch').disabled=true;$('#episodes').replaceChildren();notice.textContent='Loading episodes…';if(!$('#seasons').value){notice.textContent='No seasons available.';return;}const season=$('#seasons').value;try{const r=await fetch(`/api/tv/${selected.id}/season/${season}`);if(!r.ok)throw Error();const data=await r.json();if(version!==selectionVersion||season!==$('#seasons').value)return;for(const e of data.episodes)$('#episodes').add(new Option(`${e.episode_number}. ${e.name}`,e.episode_number));$('#watch').disabled=!data.episodes.length;notice.textContent=data.episodes.length?'Choose an episode, then press Watch.':'No episodes available.';}catch{if(version===selectionVersion)notice.textContent='Could not load episodes. Select the season again to retry.';}}
 $('#seasons').onchange=()=>loadEpisodes(++selectionVersion);
 load();
})();
