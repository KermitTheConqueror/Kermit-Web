(() => {
  document.querySelector('.home').onclick=event=>{if(parent!==window){event.preventDefault();parent.postMessage({type:'kermit-home'},location.origin);}};
  const form=document.querySelector('#repo-form'), input=document.querySelector('#repo-query'), sort=document.querySelector('#repo-sort');
  const results=document.querySelector('#repo-results'), status=document.querySelector('#repo-status'), pages=document.querySelector('#repo-pages');
  const prev=document.querySelector('#repo-prev'), next=document.querySelector('#repo-next');
  prev.remove();document.querySelector('#repo-page').remove();next.textContent='Load more';pages.setAttribute('aria-label','Load more repositories');
  const displayed=new Set();
  let query='', order='', page=1, total=0, controller, serial=0, retryAt=0;
  const cache=new Map();
  let feedLabel='Recent games';
  const feed=document.createElement('nav');feed.className='repo-feed-tabs';feed.setAttribute('aria-label','Discover repositories');
  const categories=[['Recent games','game in:name,description archived:false'],['Web proxies','"web proxy" in:name,description archived:false'],['Unblocked games','"unblocked games" in:name,description archived:false']];
  for(const [label,q] of categories){
    const button=document.createElement('button');button.type='button';button.textContent=label;
    button.onclick=()=>{feedLabel=label;query=q;order='updated';input.value='';for(const item of feed.children)item.setAttribute('aria-pressed',String(item===button));search(1);};
    button.setAttribute('aria-pressed',String(label===feedLabel));feed.append(button);
  }
  form.after(feed);
  async function search(targetPage) {
    if(Date.now()<retryAt){status.textContent='GitHub’s search limit was reached. Try again after '+new Date(retryAt).toLocaleTimeString()+'.';return;}
    const id=++serial;
    controller?.abort();controller=new AbortController();
    results.setAttribute('aria-busy','true');next.disabled=true;next.textContent=targetPage===1?'Load more':'Loading…';
    if(targetPage===1){page=0;total=0;displayed.clear();pages.hidden=true;results.replaceChildren();}
    status.textContent=targetPage===1?'Searching GitHub…':'Loading more repositories…';
    const params=new URLSearchParams({q:query,per_page:'30',page:String(targetPage)});
    if(order){params.set('sort',order);params.set('order','desc');}
    try {
      const key=params.toString();let data=cache.get(key);
      if(!data){
        const response=await window.githubRequest('https://api.github.com/search/repositories?'+params,{signal:controller.signal,headers:{Accept:'application/vnd.github+json'}});
        if(response.status===403||response.status===429){
          const reset=Number(response.headers.get('x-ratelimit-reset'))*1000;
          const delay=Number(response.headers.get('retry-after'))*1000;
          retryAt=Math.max(Date.now()+60000,reset||0,Date.now()+(delay||0));
          throw Error('GitHub temporarily limited search. Try again after '+new Date(retryAt).toLocaleTimeString()+'.');
        }
        if(response.status===422)throw Error('GitHub could not understand that query. Try a simpler search.');
        if(!response.ok)throw Error('GitHub search is unavailable right now. Please try again.');
        data=await response.json();cache.set(key,data);
      }
      if(id!==serial)return;
      page=targetPage;total=Math.min(data.total_count,1000);
      for(const repo of data.items || []){
        if(displayed.has(repo.full_name))continue;displayed.add(repo.full_name);
        const card=document.createElement('article');card.className='repo-card';
        const title=document.createElement('h2'),link=document.createElement('a');
        title.append(window.repositoryStatusDot(repo));
        if(repo.owner?.avatar_url){const avatar=document.createElement('img');avatar.className='repo-avatar';avatar.src=repo.owner.avatar_url;avatar.alt=(repo.owner.login||'Owner')+' profile picture';avatar.dataset.githubProfile=repo.owner.login;avatar.tabIndex=0;avatar.setAttribute('role','button');avatar.setAttribute('aria-label','View '+repo.owner.login+' profile');avatar.loading='lazy';avatar.referrerPolicy='no-referrer';avatar.onerror=()=>avatar.remove();title.append(avatar);}
        link.textContent=repo.full_name;link.href='https://github.com/'+repo.full_name.split('/').map(encodeURIComponent).join('/');link.target='_blank';link.rel='noopener noreferrer';title.append(link);
        link.onclick=event=>{event.preventDefault();window.openRepository(repo);};
        const description=document.createElement('p');description.textContent=repo.description || 'No description provided.';
        const meta=document.createElement('div');meta.className='repo-meta';meta.textContent=[repo.language, '★ '+Number(repo.stargazers_count || 0).toLocaleString(),repo.archived?'Archived':null,feedLabel&&repo.pushed_at?'Updated '+new Date(repo.pushed_at).toLocaleDateString():null].filter(Boolean).join(' · ');
        card.append(title,description,meta);results.append(card);
      }
      status.textContent=data.total_count ? Number(data.total_count).toLocaleString()+' repositories found'+(data.total_count>1000?' · Showing the first 1,000 matches.':'')+(data.incomplete_results?' · GitHub returned partial results; try narrowing your search.':'') : 'No repositories found. Try another keyword.';
      if(feedLabel)status.textContent=feedLabel+' · Recently updated on GitHub · '+status.textContent;
      pages.hidden=!total||page*30>=total||!(data.items||[]).length;
    } catch(error){if(error.name!=='AbortError'&&id===serial)status.textContent=error instanceof TypeError?'Unable to reach GitHub. Check your connection and try again.':error.message;}
    finally{if(id===serial){results.setAttribute('aria-busy','false');next.disabled=false;next.textContent='Load more';}}
  }
  form.onsubmit=event=>{event.preventDefault();query=input.value.trim();order=sort.value;if(query){feedLabel='';for(const button of feed.children)button.setAttribute('aria-pressed','false');search(1);}};
  next.onclick=()=>search(page+1);
  query=categories[0][1];order='updated';search(1);
})();
