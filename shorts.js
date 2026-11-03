(() => {
 if(top===window){location.replace('index.html#shorts');return;}
 const minimalStyle=document.createElement('link');minimalStyle.rel='stylesheet';minimalStyle.href='shorts-minimal.css';document.head.append(minimalStyle);
 document.addEventListener('keydown',event=>{if(event.key==='Escape')parent.postMessage({type:'kermit-home'},location.origin);});
 // Leave the old collection intact, but do not mix it into English discovery.
 const $=id=>document.getElementById(id),storage='kermit.shorts.recent.v4.'+new Date().toISOString().slice(0,10);let items=[],filter='all',active=-1,visible=[];
 function parse(value){try{const u=new URL(value);if(u.protocol!=='https:')return null;let id;
  if(['youtube.com','www.youtube.com','m.youtube.com','youtu.be'].includes(u.hostname)){id=u.hostname==='youtu.be'?u.pathname.slice(1):u.pathname.startsWith('/shorts/')?u.pathname.split('/')[2]:u.searchParams.get('v');if(/^[\w-]{11}$/.test(id||''))return {platform:'youtube',id,url:'https://www.youtube.com/shorts/'+id};}
 }catch{}return null;}
 const toolbar=document.createElement('div');toolbar.className='scroll-platforms';
 const filters=document.querySelector('.filters');toolbar.append(filters);
 const addButton=document.createElement('button');addButton.type='button';addButton.textContent='+ Add videos';toolbar.append(addButton);document.querySelector('main').prepend(toolbar);
 const dialog=document.createElement('dialog');dialog.className='scroll-add-dialog';
 const heading=document.createElement('h2');heading.textContent='Add YouTube Shorts';
 const help=document.createElement('p');help.textContent='Paste YouTube Shorts links, one per line.';
 const close=document.createElement('button');close.type='button';close.textContent='Done';close.onclick=()=>dialog.close();
 dialog.append(heading,help,$('add-form'),$('status'),close);document.body.append(dialog);addButton.onclick=()=>dialog.showModal();
 const seen=new Set();let cursors={};
 try{const saved=JSON.parse(localStorage.getItem('kermit.shorts.seen.v1')||'[]');if(Array.isArray(saved))for(const id of saved)if(typeof id==='string')seen.add(id);const state=JSON.parse(localStorage.getItem('kermit.shorts.discovery.v1')||'{}');if(state&&typeof state==='object'&&!Array.isArray(state))cursors=state;}catch{}
 function remember(id){seen.add(id);try{localStorage.setItem('kermit.shorts.seen.v1',JSON.stringify([...seen].slice(-10000)));}catch{}}
 function save(){try{localStorage.setItem(storage,JSON.stringify(items));}catch{$('status').textContent='Could not save this collection. Browser storage may be full.';}}
 const unavailable=new Set();let youtubePlayer=null,playerGeneration=0,errorStreak=0;
 const youtubeReady=new Promise(resolve=>{window.onYouTubeIframeAPIReady=()=>resolve(true);const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.onerror=()=>resolve(false);document.head.append(script);});
 function playerError(item,code,generation){
  if(generation!==playerGeneration)return;
  // Identification errors affect the whole player, not the video's availability.
  if(code===153||++errorStreak>=5){const box=$('feed').children[active]?.querySelector('.video');if(box){box.replaceChildren();const message=document.createElement('p');message.textContent=code===153?'YouTube could not verify this browser embed. Try opening the site in your regular browser.':'Several videos could not play. Check browser restrictions, then try another video.';const next=document.createElement('button');next.textContent='Try next video';next.onclick=()=>{errorStreak=0;move(1);};box.append(message,next);}return;}
  unavailable.add(item.id);const index=active;items=items.filter(x=>x.platform!=='youtube'||x.id!==item.id);save();render();
  if(visible.length){const next=Math.min(index,visible.length-1);$('feed').children[next].scrollIntoView({block:'nearest'});activate(next);}else loadMore();
 }
 function activate(index){if(index===active)return;active=index;const generation=++playerGeneration;youtubePlayer?.destroy();youtubePlayer=null;document.querySelectorAll('.video').forEach(el=>el.replaceChildren());const item=visible[index];if(!item)return;const frame=document.createElement('iframe');frame.title='YouTube Short'+' '+(index+1);frame.allow='autoplay; encrypted-media; fullscreen; picture-in-picture';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';frame.src='https://www.youtube.com/embed/'+item.id+'?autoplay=1&mute=0&playsinline=1&enablejsapi=1&origin='+encodeURIComponent(location.origin);$('feed').children[index].querySelector('.video').append(frame);$('count').textContent=(index+1)+' / '+visible.length;$('previous').disabled=index===0;$('next').disabled=index===visible.length-1;
  if(item.platform==='youtube')youtubeReady.then(ready=>{if(!ready||generation!==playerGeneration||!frame.isConnected)return;youtubePlayer=new YT.Player(frame,{events:{onError:event=>playerError(item,event.data,generation),onStateChange:event=>{if(generation===playerGeneration&&event.data===1)errorStreak=0;}}});});
 }
 function shuffle(){for(let i=items.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[items[i],items[j]]=[items[j],items[i]];}}
 shuffle();
 let batch=Number.isInteger(cursors.batch)?cursors.batch%12:Math.floor(Math.random()*12),loading=false,loadedBatches=0,lastAutoIndex=-1;
 const discoverButton=document.createElement('button');discoverButton.type='button';discoverButton.textContent='Discover new Shorts';discoverButton.style.marginTop='14px';
 document.querySelector('.filters').after(discoverButton);
 async function loadMore(){
  if(loading)return;if(loadedBatches>=24){$('status').textContent='You have explored all current batches. More results may be available later.';return;}
  loading=true;discoverButton.disabled=true;$('status').textContent='Finding new YouTube Shorts…';
  const current=visible[active];
  try{const response=await fetch('/api/shorts?'+new URLSearchParams({batch:String(batch),pageToken:cursors[batch]||''}),{signal:AbortSignal.timeout(35000)});const data=await response.json();if(!response.ok)throw Error(data.error||'Discovery unavailable.');cursors[batch]=data.nextPageToken||'';batch=(batch+1)%12;cursors.batch=batch;try{localStorage.setItem('kermit.shorts.discovery.v1',JSON.stringify(cursors));}catch{}loadedBatches++;
   const fresh=(data.items||[]).map(x=>parse(x.url)).filter(x=>x&&!seen.has(x.id)&&!unavailable.has(x.id)&&!items.some(old=>old.platform===x.platform&&old.id===x.id));
   fresh.forEach(x=>remember(x.id));
   for(let i=fresh.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[fresh[i],fresh[j]]=[fresh[j],fresh[i]];}
   items.push(...fresh);save();render();
   if(current){const index=visible.findIndex(x=>x.id===current.id&&x.platform===current.platform);if(index>=0)$('feed').children[index]?.scrollIntoView({block:'nearest'});}
   $('status').textContent=fresh.length?fresh.length+' new videos added. Scroll to watch.':'No new English-audio matches in this batch.';
   if(!visible.length){const empty=$('feed').querySelector('.empty');if(empty){empty.textContent='No English-audio Shorts in this batch.';const retry=document.createElement('button');retry.textContent='Try another batch';retry.onclick=loadMore;empty.append(retry);}}
  }catch(error){$('status').textContent=error.name==='TimeoutError'?'Discovery timed out. Try again.':error.message;if(!visible.length){const empty=$('feed').querySelector('.empty');if(empty){empty.textContent=$('status').textContent;const retry=document.createElement('button');retry.textContent='Retry';retry.onclick=loadMore;empty.append(retry);}}}
  finally{loading=false;discoverButton.disabled=false;}
 }
 discoverButton.onclick=loadMore;
 const shuffleButton=document.createElement('button');shuffleButton.type='button';shuffleButton.textContent='Shuffle videos ↝';shuffleButton.style.marginTop='14px';
 document.querySelector('.filters').after(shuffleButton);
 shuffleButton.onclick=()=>{shuffle();render();$('status').textContent=items.length?'Saved videos shuffled. Each appears once in this feed.':'Add video links first to start your random feed.';};
 let observer;
 function render(){observer?.disconnect();youtubePlayer?.destroy();youtubePlayer=null;playerGeneration++;active=-1;visible=items.filter(x=>filter==='all'||x.platform===filter);$('feed').replaceChildren();$('feed').scrollTop=0;$('count').textContent='0 / '+visible.length;$('previous').disabled=$('next').disabled=!visible.length;
  if(!visible.length){const empty=document.createElement('div');empty.className='empty';empty.textContent='Finding your next Shorts…';$('feed').append(empty);return;}
  visible.forEach((item,index)=>{const card=document.createElement('article');card.className='clip';card.dataset.index=index;const video=document.createElement('div');video.className='video';const footer=document.createElement('footer');const link=document.createElement('a');link.href=item.url;link.target='_blank';link.rel='noopener noreferrer';link.textContent='YouTube'+' · Open original ↗';const remove=document.createElement('button');remove.textContent='Remove';remove.onclick=()=>{items=items.filter(x=>x.platform!==item.platform||x.id!==item.id);save();render();};footer.append(link,remove);card.append(video,footer);$('feed').append(card);});
  observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting&&e.intersectionRatio>.6)activate(Number(e.target.dataset.index));},{root:$('feed'),threshold:.65});for(const card of $('feed').children)observer.observe(card);
 }
 function move(step){const index=Math.max(0,Math.min(visible.length-1,active+step));$('feed').children[index]?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest'});}
 $('previous').onclick=()=>move(-1);$('next').onclick=()=>move(1);$('feed').onkeydown=e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();move(e.key==='ArrowDown'?1:-1);}};
 $('feed').addEventListener('scroll',()=>{if(active!==lastAutoIndex&&active>=visible.length-2&&visible.length&&$('feed').scrollTop>0&&!loading){lastAutoIndex=active;loadMore();}},{passive:true});
 $('add-form').onsubmit=e=>{e.preventDefault();let added=0,invalid=0;for(const raw of $('links').value.trim().split(/\s+/)){const item=parse(raw);if(!item){invalid++;continue;}if(items.length<200&&!items.some(x=>x.id===item.id&&x.platform===item.platform)){items.push(item);added++;}}save();render();$('status').textContent=added+' video(s) added.'+(invalid?' Use valid YouTube video URLs.':'')+(items.length>=200?' Collection limit: 200 videos.':'');if(!invalid)$('links').value='';};
 for(const button of document.querySelectorAll('[data-filter]'))button.onclick=()=>{filter=button.dataset.filter;for(const b of document.querySelectorAll('[data-filter]'))b.setAttribute('aria-pressed',String(b===button));render();};render();
 const intro=document.querySelector('aside>p');intro.textContent='Discover shuffled YouTube Shorts, or add your own YouTube links.';
 document.querySelector('.note').textContent='Discovery finds #shorts-tagged videos up to 3 minutes; YouTube does not expose a definitive Shorts filter. Not a personalized feed. Embedding restrictions may apply.';
 loadMore();
})();
