(() => {
  const heading=document.querySelector('h1');
  const hero=document.createElement('div');hero.className='repo-hero';
  heading.before(hero);
  heading.remove();
  document.querySelector('.eyebrow')?.remove();
  document.querySelector('.intro')?.remove();
  const showcase=document.createElement('section');showcase.className='repo-showcase';showcase.setAttribute('aria-label','Popular new GitHub repositories');
  const label=document.createElement('p');label.className='showcase-label';label.textContent='NEW & POPULAR · LAST 90 DAYS';
  const slide=document.createElement('div');slide.className='showcase-slide';slide.textContent='Loading popular new repositories…';
  const controls=document.createElement('div');controls.className='showcase-controls';
  const previous=document.createElement('button'),next=document.createElement('button'),pause=document.createElement('button'),count=document.createElement('span');
  previous.textContent='←';previous.setAttribute('aria-label','Previous repository');next.textContent='→';next.setAttribute('aria-label','Next repository');
  let paused=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  pause.textContent=paused?'Play':'Pause';pause.setAttribute('aria-label','Toggle automatic slideshow');
  controls.append(previous,count,next,pause);controls.hidden=true;showcase.append(label,slide,controls);hero.append(showcase);
  let items=[],index=0,hovering=false;
  let transitionId=0,currentAnimation;
  async function fade(frames,duration){
    const animation=slide.animate(frames,{duration,easing:'ease-in-out',fill:'forwards'});currentAnimation=animation;
    let timeout;
    try{await Promise.race([animation.finished.catch(()=>{}),new Promise(resolve=>{timeout=setTimeout(resolve,duration+200);})]);}
    finally{clearTimeout(timeout);}
    return animation;
  }
  async function changeSlide(target){
    if(!items.length)return;
    const id=++transitionId;currentAnimation?.cancel();currentAnimation=null;
    if(target===index)return;
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){index=target;render();return;}
    try{
      const fadeOut=await fade([{opacity:1},{opacity:0}],180);
      if(id!==transitionId)return;
      index=target;render();
      fadeOut.cancel();
      await fade([{opacity:0},{opacity:1}],320);
    }catch{
      if(id===transitionId){index=target;render();}
    }finally{if(id===transitionId){currentAnimation?.cancel();currentAnimation=null;}}
  }
  document.addEventListener('visibilitychange',()=>{if(document.hidden){transitionId++;currentAnimation?.cancel();currentAnimation=null;}});
  const dots=document.createElement('div');dots.className='showcase-dots';dots.setAttribute('aria-label','Choose featured repository');controls.insertBefore(dots,pause);
  function render(){
    const repo=items[index];slide.replaceChildren();
    const owner=document.createElement('div');owner.className='showcase-owner';
    const avatar=document.createElement('img');avatar.className='repo-avatar';avatar.alt='';avatar.dataset.githubProfile=repo.owner.login;avatar.tabIndex=0;avatar.setAttribute('role','button');avatar.setAttribute('aria-label','View '+repo.owner.login+' profile');avatar.src=repo.owner.avatar_url;avatar.referrerPolicy='no-referrer';avatar.onerror=()=>avatar.remove();
    const username=document.createElement('span');username.textContent=repo.owner.login;owner.append(avatar,username);
    const title=document.createElement('h2'),link=document.createElement('a');link.textContent=repo.name;link.href='https://github.com/'+repo.full_name;link.onclick=e=>{e.preventDefault();window.openRepository(repo);};title.append(link);
    const description=document.createElement('p');description.className='showcase-description';description.textContent=repo.description||'Explore this new GitHub project.';
    title.append(window.repositoryStatusDot(repo));
    const meta=document.createElement('p');meta.className='showcase-meta';meta.textContent='★ '+Number(repo.stargazers_count).toLocaleString()+(repo.language?' · '+repo.language:'')+' · Created '+new Date(repo.created_at).toLocaleDateString();
    const copy=document.createElement('div');copy.className='showcase-copy';
    const open=document.createElement('button');open.className='showcase-open';open.textContent='Explore repository ↗';open.onclick=()=>window.openRepository(repo);
    copy.append(owner,title,description,meta,open);
    const visual=document.createElement('div');visual.className='showcase-visual';
    const rank=document.createElement('span');rank.className='showcase-rank';rank.textContent='#'+String(index+1).padStart(2,'0');
    const portrait=avatar.cloneNode(true);portrait.className='showcase-portrait';
    const stars=document.createElement('strong');stars.textContent='★ '+Number(repo.stargazers_count).toLocaleString();
    const caption=document.createElement('span');caption.textContent='stars on GitHub';visual.append(rank,portrait,stars,caption);
    slide.append(copy,visual);count.textContent=(index+1)+' / '+items.length;
    dots.replaceChildren();items.forEach((item,i)=>{const dot=document.createElement('button');dot.setAttribute('aria-label','Show '+item.name);dot.setAttribute('aria-pressed',String(i===index));dot.onclick=()=>changeSlide(i);dots.append(dot);});
  }
  previous.onclick=()=>changeSlide((index+items.length-1)%items.length);next.onclick=()=>changeSlide((index+1)%items.length);
  pause.onclick=()=>{paused=!paused;pause.textContent=paused?'Play':'Pause';};
  showcase.onmouseenter=()=>{hovering=true;};showcase.onmouseleave=()=>{hovering=false;};
  async function load(){
    try{
      const date=new Date();date.setUTCDate(date.getUTCDate()-90);
      const params=new URLSearchParams({q:'created:>='+date.toISOString().slice(0,10)+' stars:>10 archived:false',sort:'stars',order:'desc',per_page:'8'});
      const response=await window.githubRequest('https://api.github.com/search/repositories?'+params,{headers:{Accept:'application/vnd.github+json'},signal:AbortSignal.timeout(15000)});
      if(!response.ok)throw Error(response.status===403||response.status===429?'GitHub’s search limit was reached. Try again shortly.':'GitHub is unavailable right now.');
      items=(await response.json()).items||[];
      if(!items.length){slide.textContent='No new popular repositories found right now.';return;}
      controls.hidden=false;render();
      const timer=setInterval(()=>{if(!paused&&!hovering&&!document.hidden&&!showcase.contains(document.activeElement)&&!document.querySelector('.repo-viewer[open],.github-profile[open]'))next.onclick();},6500);
      window.addEventListener('pagehide',()=>clearInterval(timer),{once:true});
    }catch(error){slide.textContent=error.name==='TimeoutError'?'GitHub took too long to respond. Refresh to try again.':error.message;}
  }
  load();
})();
