(() => {
 if(window.top===window){location.replace('index.html#music');return;}
 const discoveryStyle=document.createElement('link');discoveryStyle.rel='stylesheet';discoveryStyle.href='music-discovery.css';document.head.append(discoveryStyle);
 const wideStyle=document.createElement('link');wideStyle.rel='stylesheet';wideStyle.href='music-wide.css';document.body.append(wideStyle);
 const $=id=>document.getElementById(id),key='kermit.music.recent.v1';let generation=0,recent=[];
 let controller=null,playGeneration=0;
 const searchCache=new Map();
 let resultItems=[],filter='all',currentItem=null,upNext=null,queueGeneration=0,searchTimer;
 let lockedGenre='',lockedGenreSource='';
 const played=new Set();
 const songKey=item=>'song:'+String(item.name||'').toLowerCase().trim()+'|'+String(item.artist||'').toLowerCase().trim();
 try{const saved=JSON.parse(sessionStorage.getItem('kermit.music.played')||'[]');if(Array.isArray(saved))for(const value of saved)if(typeof value==='string')played.add(value);}catch{}
 function rememberPlayed(item){played.add(item.url);if(item.name&&item.artist)played.add(songKey(item));try{sessionStorage.setItem('kermit.music.played',JSON.stringify([...played]));}catch{}}
 const chips=document.createElement('div');chips.className='music-filters';
 for(const [value,label] of [['all','All'],['track','Songs'],['album','Albums']]){
  const button=document.createElement('button');button.textContent=label;button.setAttribute('aria-pressed',String(value===filter));
  button.onclick=()=>{filter=value;for(const b of chips.children)b.setAttribute('aria-pressed',String(b===button));drawResults();};chips.append(button);
 }
 $('results').before(chips);
 let recommendationGeneration=0,recommendations=[];
 const discovery=document.createElement('section');discovery.className='music-discovery';
 const discoveryHeading=document.createElement('h2');discoveryHeading.textContent='Discover your next favorite';
 const discoveryNote=document.createElement('p');discoveryNote.className='discovery-note';discoveryNote.setAttribute('role','status');
 const genrePicks=document.createElement('div');genrePicks.className='genre-picks';
 for(const [label,genre] of [['Pop','pop'],['Hip-hop','hip-hop'],['Rock','rock'],['Chill','ambient'],['Electronic','electronic'],['R&B','r&b']]){const b=document.createElement('button');b.textContent=label;b.onclick=()=>loadRecommendations(genre);genrePicks.append(b);}
 const recommendationGrid=document.createElement('div');recommendationGrid.className='recommendation-grid';
 const surprise=document.createElement('button');surprise.className='quiet surprise-song';surprise.textContent='Surprise me ↗';surprise.disabled=true;surprise.onclick=()=>{if(recommendations.length)open(recommendations[Math.floor(Math.random()*recommendations.length)]);};
 discovery.append(discoveryHeading,discoveryNote,genrePicks,recommendationGrid,surprise);document.querySelector('.library').prepend(discovery);
 function showRecommendations(list,note){
  recommendations=list.filter(x=>x.type==='track'&&parse(x.url)).slice(0,6);recommendationGrid.replaceChildren();discoveryNote.textContent=note;surprise.disabled=!recommendations.length;
  for(const item of recommendations){const card=document.createElement('button');card.className='recommendation-card';card.setAttribute('aria-label','Play '+item.name+' by '+item.artist);const art=document.createElement('div');art.className='recommendation-art';art.textContent='♫';
   if(item.image&&/^https:\/\/[^/]*scdn.co\//.test(item.image)){const img=new Image();img.src=item.image;img.alt='';img.loading='lazy';art.replaceChildren(img);}
   const title=document.createElement('strong');title.textContent=item.name;const artist=document.createElement('small');artist.textContent=item.artist;card.append(art,title,artist);card.onclick=()=>open(item);recommendationGrid.append(card);
  }
  if(!recommendations.length&&!note.startsWith('Finding')){const empty=document.createElement('p');empty.className='discovery-note';empty.textContent='Choose a genre above to explore more songs.';recommendationGrid.append(empty);}
 }
 async function loadRecommendations(genre){const request=++recommendationGeneration;discoveryNote.textContent='Finding '+genre+' picks…';surprise.disabled=true;
  for(const b of genrePicks.children)b.setAttribute('aria-pressed',String(b.textContent.toLowerCase()===genre));
  try{const response=await fetch('/api/music?q='+encodeURIComponent('genre:"'+genre+'"'),{signal:AbortSignal.timeout(20000)});const data=await response.json();if(request!==recommendationGeneration)return;if(!response.ok)throw Error(data.error||'Recommendations unavailable.');showRecommendations((data.items||[]).filter(x=>!played.has(x.url)&&!played.has(songKey(x))),'Explore '+genre+' · Picks from Spotify’s catalog');}
  catch(error){if(request===recommendationGeneration){showRecommendations([],error.name==='TimeoutError'?'Recommendations timed out. Choose a genre to retry.':error.message);}}
 }
 const autoplay=document.createElement('label');autoplay.className='autoplay-toggle';
 const autoCheck=document.createElement('input');autoCheck.type='checkbox';autoCheck.checked=true;
 autoplay.append(autoCheck,document.createTextNode('Autoplay'));
 const nextInfo=document.createElement('p');nextInfo.className='next-info';nextInfo.setAttribute('role','status');nextInfo.textContent='Choose a song to build your next pick.';
 const nextButton=document.createElement('button');nextButton.className='quiet next-track';nextButton.textContent='Next →';nextButton.disabled=true;
 nextButton.onclick=()=>{if(upNext)open(upNext,true);};
 $('player').after(autoplay,nextInfo,nextButton);
 const genreLabel=document.createElement('label');genreLabel.className='autoplay-toggle';genreLabel.textContent='Genre';
 const genreSelect=document.createElement('input');genreSelect.type='text';genreSelect.className='genre-input';genreSelect.maxLength=80;genreSelect.placeholder='Automatic, or type any genre';genreSelect.setAttribute('aria-label','Next-song category');genreSelect.setAttribute('list','music-genres');
 const genreList=document.createElement('datalist');genreList.id='music-genres';
 const genres=['pop','dance pop','indie pop','synthpop','electropop','k-pop','j-pop','c-pop','latin pop','art pop','dream pop','bedroom pop','rock','alternative rock','indie rock','classic rock','hard rock','punk','punk rock','pop punk','post-punk','post-rock','progressive rock','psychedelic rock','grunge','shoegaze','emo','metal','heavy metal','metalcore','death metal','black metal','thrash metal','power metal','nu metal','hip-hop','rap','trap','drill','boom bap','conscious hip hop','alternative hip hop','lo-fi hip hop','phonk','r&b','soul','neo soul','funk','disco','gospel','jazz','smooth jazz','jazz fusion','bebop','swing','blues','blues rock','country','country pop','bluegrass','americana','folk','indie folk','singer-songwriter','acoustic','electronic','edm','house','deep house','tech house','progressive house','techno','trance','dubstep','drum and bass','breakbeat','garage','hardstyle','ambient','downtempo','trip hop','synthwave','vaporwave','chillwave','lo-fi','classical','baroque','romantic','opera','orchestral','piano','chamber music','soundtrack','video game music','anime','musical theatre','reggae','dancehall','dub','ska','reggaeton','latin','salsa','bachata','merengue','cumbia','bossa nova','samba','afrobeats','afropop','amapiano','highlife','afro house','bollywood','desi hip hop','qawwali','flamenco','celtic','new age','meditation','world'];
 for(const value of genres){
  const option=document.createElement('option');option.value=value;genreList.append(option);
 }
 genreSelect.placeholder='Automatic';
 genreLabel.append(genreSelect,genreList);
 const queueOptions=document.createElement('details');queueOptions.className='queue-options';
 const queueSummary=document.createElement('summary');queueSummary.textContent='Tune your queue';
 queueOptions.append(queueSummary,genreLabel);nextButton.after(queueOptions);
 try{genreSelect.value=localStorage.getItem('kermit.music.genre')||'';}catch{}
 genreSelect.onchange=()=>{lockedGenre='';lockedGenreSource='';try{localStorage.setItem('kermit.music.genre',genreSelect.value);}catch{}if(currentItem)queueRelated(currentItem);};
 genreSelect.onkeydown=event=>{if(event.key==='Enter'){event.preventDefault();genreSelect.onchange();}};
 // Keep a cursor and unplayed buffer for each station, rather than repeating page one.
 const stations=new Map();
 async function queueRelated(item){
  const recommendationRequest=++recommendationGeneration;
  const request=++queueGeneration;upNext=null;nextButton.disabled=true;
  if(item.type!=='track'||!parse(item.url)){nextInfo.textContent='Choose a song to build a genre queue.';return;}
  nextInfo.textContent='Finding more songs in the same genre…';
  const unused=x=>x.type==='track'&&parse(x.url)&&x.url!==item.url&&!played.has(x.url)&&!played.has(songKey(x))&&!recent.some(r=>r.url===x.url||songKey(r)===songKey(x));
  try{
   const chosenGenre=genreSelect.value.trim().replace(/["\\]/g,'').toLowerCase()||lockedGenre;
   let endpoint=chosenGenre?'/api/music?q='+encodeURIComponent('genre:"'+chosenGenre+'"'):'/api/music?related='+encodeURIComponent(parse(item.url).id);
   let station=stations.get(endpoint);
   if(!station){station={items:[],offset:0,done:false,genre:chosenGenre,artist:''};stations.set(endpoint,station);}
   station.items=station.items.filter(unused);
   // Prefetch while the current track plays; bound duplicate-only page scans.
   for(let page=0;page<8&&!station.done&&station.items.length<12;page++){
    const response=await fetch(endpoint+'&offset='+station.offset,{signal:AbortSignal.timeout(60000)});
    const data=await response.json();if(request!==queueGeneration)return;
    if(!response.ok)throw Error(data.error||'Recommendations unavailable.');
    if(data.genre&&!chosenGenre){
     lockedGenre=data.genre;lockedGenreSource=data.genreSource||'';
     const genreEndpoint='/api/music?q='+encodeURIComponent('genre:"'+data.genre+'"');
     const existing=stations.get(genreEndpoint);
     if(existing&&existing!==station){station=existing;endpoint=genreEndpoint;station.items=station.items.filter(unused);continue;}
     station.genre=data.genre;stations.set(genreEndpoint,station);endpoint=genreEndpoint;
    }
    station.artist=data.fallbackArtist||station.artist;
    const known=new Set(station.items.flatMap(x=>[x.url,songKey(x)]));
    for(const candidate of data.items||[]){
     if(unused(candidate)&&!known.has(candidate.url)&&!known.has(songKey(candidate))){
      station.items.push(candidate);known.add(candidate.url);known.add(songKey(candidate));
     }
    }
    const next=data.nextOffset;
    station.done=!Number.isInteger(next)||next<=station.offset;
    if(!station.done)station.offset=next;
   }
   if(request!==queueGeneration)return;
   const pool=station.items.filter(unused);
   upNext=pool.length?pool[Math.floor(Math.random()*pool.length)]:null;
   nextButton.disabled=!upNext;
   const label=station.genre?'Genre · '+station.genre:'Same artist · '+(station.artist||item.artist);
   if(recommendationRequest===recommendationGeneration)showRecommendations(pool,label+' · Fresh picks');
   nextInfo.textContent=upNext?'Up next · '+upNext.name:station.done?'No new matches. Try another genre.':'No new matches yet.';
   nextInfo.title=upNext?label+' · '+upNext.name+' — '+upNext.artist:'';
   if(!upNext&&!station.done){nextButton.disabled=false;nextButton.textContent='Find more →';nextButton.onclick=()=>queueRelated(currentItem);}
   else{nextButton.textContent='Next →';nextButton.onclick=()=>{if(upNext)open(upNext,true);};}
  }catch(error){
   if(request===queueGeneration){
    nextInfo.textContent=error.message||'Could not load more songs.';
    nextButton.disabled=false;nextButton.textContent='Retry →';nextButton.onclick=()=>queueRelated(currentItem);
   }
  }
 }
 function drawResults(){render(filter==='all'?resultItems:resultItems.filter(x=>(x.type||parse(x.url)?.type)===filter));}
 const spotifyReady=new Promise(resolve=>{
  window.onSpotifyIframeApiReady=resolve;
  const script=document.createElement('script');
  script.src='https://open.spotify.com/embed/iframe-api/v1';script.async=true;
  script.onerror=()=>resolve(null);document.head.append(script);
 });
 function reportMusic(playing){parent.postMessage({type:'kermit-music-audio',playing},location.origin);}
 window.addEventListener('pagehide',()=>reportMusic(false));
 function destroyPlayer(){reportMusic(false);playGeneration++;if(controller){controller.destroy();controller=null;}}
 async function startPlayback(valid){
  destroyPlayer();const request=playGeneration;
  const api=await Promise.race([spotifyReady,new Promise(resolve=>setTimeout(()=>resolve(null),10000))]);
  if(request!==playGeneration)return;
  if(!api){$('status').textContent='Automatic playback is unavailable. Press Play in the Spotify player.';return;}
  const mount=document.createElement('div');$('player').replaceChildren(mount);
  api.createController(mount,{uri:'spotify:'+valid.type+':'+valid.id,width:'100%',height:152},next=>{
   if(request!==playGeneration){next.destroy();return;}
   controller=next;
   let wasPlaying=false,lastPosition=0,advanced=false;
   next.addListener('playback_update',event=>{
    if(request!==playGeneration)return;
    if(event.data)reportMusic(!event.data.isPaused);
    if(request!==playGeneration||advanced||valid.type!=='track')return;
    const d=event.data;if(!d||d.isBuffering)return;
    if(d.isPaused&&wasPlaying&&d.duration>0&&Math.max(lastPosition,d.position)>=d.duration-500){
     advanced=true;if(autoCheck.checked&&upNext)open(upNext,true);
    }
    wasPlaying=!d.isPaused;lastPosition=d.position||0;
   });
   next.addListener('ready',()=>{if(request===playGeneration){next.play();$('status').textContent='Press play if music doesn’t start.';}});
   next.addListener('playback_started',()=>{if(request===playGeneration){reportMusic(true);$('status').textContent='Playing on Spotify.';}});
  });
 }
 function parse(value){try{let v=value.trim();if(v.startsWith('spotify:')){const p=v.split(':');v='https://open.spotify.com/'+p[1]+'/'+p[2];}const u=new URL(v);if(u.protocol!=='https:'||u.hostname!=='open.spotify.com')return null;const m=u.pathname.match(/^\/(?:intl-[a-z]+\/)?(track|album|playlist|artist|episode|show)\/([A-Za-z0-9]{22})\/?$/);return m?{type:m[1],id:m[2],url:'https://open.spotify.com/'+m[1]+'/'+m[2]}:null;}catch{return null;}}
 try{const saved=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(saved))recent=saved.filter(x=>x&&parse(x.url)).slice(0,20);}catch{}
 function drawRecent(){
  const target=$('recent-results');target.replaceChildren();
  if(!recent.length){const empty=document.createElement('p');empty.className='discovery-note';empty.textContent='Songs and albums you open will appear here.';target.append(empty);return;}
  for(const item of recent){const card=document.createElement('button');card.className='recent-card';card.onclick=()=>open(item);const art=document.createElement('span');art.className='recent-art';art.textContent='♫';if(item.image&&/^https:\/\/[^/]*scdn.co\//.test(item.image)){const img=new Image();img.src=item.image;img.alt='';img.loading='lazy';art.replaceChildren(img);}const meta=document.createElement('span');const name=document.createElement('strong');name.textContent=item.name;const artist=document.createElement('small');artist.textContent=item.artist;meta.append(name,artist);card.append(art,meta);target.append(card);}
 }
 function save(){try{localStorage.setItem(key,JSON.stringify(recent));}catch{}drawRecent();}
function open(item,keepGenre=false){const valid=parse(item.url);if(!valid)return;
 rememberPlayed({...item,...valid});
 if(!keepGenre&&currentItem?.url!==valid.url){
  lockedGenre='';lockedGenreSource='';genreSelect.value='';
  try{localStorage.removeItem('kermit.music.genre');}catch{}
 }
 const frame=document.createElement('iframe');frame.title='Spotify music player';frame.src='https://open.spotify.com/embed/'+valid.type+'/'+valid.id+'?utm_source=generator&theme=0';frame.allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';frame.allowFullscreen=true;$('player').replaceChildren(frame);$('playing-title').textContent=item.name||'Your Spotify selection';$('stop').hidden=false;recent=[{...valid,name:item.name||'Spotify '+valid.type,artist:item.artist||'Saved link',image:item.image||''},...recent.filter(x=>x.url!==valid.url)].slice(0,20);save();currentItem={...item,...valid};startPlayback(valid);queueRelated(currentItem);}
 function render(items){$('results').replaceChildren();if(!items.length){const p=document.createElement('p');p.className='empty';p.textContent=$('query').value.trim()?'No matches in this filter. Try another search or choose All.':'Search for your favorites. Recently opened music will appear here.';$('results').append(p);return;}for(const item of items){if(!parse(item.url))continue;const b=document.createElement('button');b.className='track';const icon=document.createElement('span');icon.className='note';icon.textContent='♫';if(item.image&&/^https:\/\/[^/]*scdn.co\//.test(item.image)){const img=new Image();img.src=item.image;img.alt='';img.loading='lazy';b.append(img);}else b.append(icon);const meta=document.createElement('span');meta.className='meta';const title=document.createElement('strong');title.textContent=item.name;const detail=document.createElement('small');detail.textContent=(item.type==='album'?'Album':'Song')+' · '+(item.artist||'Spotify');meta.append(title,detail);b.append(meta);b.onclick=()=>open(item);$('results').append(b);}}
 $('search-form').onsubmit=async e=>{e.preventDefault();clearTimeout(searchTimer);const value=$('query').value.trim();if(!value)return;const id=++generation,link=parse(value);if(link){open(link);$('status').textContent='Opened in Spotify’s official player.';return;}if(/^https?:|^spotify:/.test(value)){$('status').textContent='Use a full open.spotify.com track, album, or playlist link.';return;}
 if(searchCache.has(value.toLowerCase())){resultItems=searchCache.get(value.toLowerCase());$('results-title').textContent='Search results';drawResults();$('status').textContent=resultItems.length+' Spotify results';return;}
 $('status').textContent='Searching Spotify…';
 try{const r=await fetch('/api/music?q='+encodeURIComponent(value),{signal:AbortSignal.timeout(15000)});const data=await r.json();if(id!==generation)return;if(!r.ok)throw Error(data.error||'Search unavailable.');$('results-title').textContent='Search results';resultItems=data.items||[];if(searchCache.size>=50)searchCache.delete(searchCache.keys().next().value);searchCache.set(value.toLowerCase(),resultItems);drawResults();$('status').textContent=data.items.length+' Spotify results';}catch(error){if(id!==generation)return;$('status').textContent=error.name==='TimeoutError'?'Search timed out. Please try again.':error.message==='Unexpected token'?'Search is unavailable. Please try again later.':error.message;}};
 $('clear').onclick=()=>{recent=[];save();};
 $('stop').onclick=()=>{queueGeneration++;upNext=null;nextButton.disabled=true;nextInfo.textContent='Player stopped.';destroyPlayer();$('player').replaceChildren();$('playing-title').textContent='Player stopped';$('stop').hidden=true;};
 resultItems=[];drawResults();drawRecent();
 $('query').addEventListener('input',()=>{
  clearTimeout(searchTimer);generation++;
  const value=$('query').value.trim();
  if(!value){resultItems=[];$('results-title').textContent='Search results';drawResults();$('status').textContent='Search for a song or artist.';return;}
  if(/^https?:|^spotify:/.test(value))return;
  if(searchCache.has(value.toLowerCase())){resultItems=searchCache.get(value.toLowerCase());$('results-title').textContent='Search results';drawResults();$('status').textContent=resultItems.length+' Spotify results';return;}
  $('status').textContent='Searching Spotify…';
  searchTimer=setTimeout(()=>$('search-form').requestSubmit(),300);
 });
 loadRecommendations('pop');
})();
