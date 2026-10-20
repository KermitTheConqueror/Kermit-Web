(() => {
  const dialog=document.createElement('dialog');dialog.className='github-profile';dialog.setAttribute('aria-label','GitHub profile');
  const close=document.createElement('button');close.textContent='Close';close.className='profile-close';
  const content=document.createElement('div');content.className='profile-content';content.setAttribute('aria-live','polite');dialog.append(close,content);document.body.append(dialog);
  let requestId=0,controller;const cache=new Map();
  function cancel(){requestId++;controller?.abort();}
  close.onclick=()=>{cancel();dialog.close();};dialog.addEventListener('cancel',cancel);
  async function show(login){
    const id=++requestId;controller?.abort();controller=new AbortController();content.textContent='Loading '+login+'’s profile…';if(!dialog.open)dialog.showModal();
    try{
      let profile=cache.get(login);
      if(!profile){const response=await window.githubRequest('https://api.github.com/users/'+encodeURIComponent(login),{credentials:'omit',signal:controller.signal,headers:{Accept:'application/vnd.github+json'}});if(!response.ok)throw Error(response.status===403||response.status===429?'GitHub’s access limit was reached. Please try again later.':response.status===404?'This profile could not be found.':'Unable to load this profile.');profile=await response.json();cache.set(login,profile);}
      if(id!==requestId)return;content.replaceChildren();
      const image=document.createElement('img');image.src=profile.avatar_url;image.alt=profile.login+' profile picture';image.referrerPolicy='no-referrer';image.onerror=()=>image.remove();
      const name=document.createElement('h2');name.textContent=profile.name||profile.login;
      const handle=document.createElement('p');handle.className='profile-handle';handle.textContent='@'+profile.login+(profile.type==='Organization'?' · Organization':'');
      const bio=document.createElement('p');bio.className='profile-bio';bio.textContent=profile.bio||profile.description||'No bio provided.';content.append(image,name,handle,bio);
      for(const value of [profile.location,profile.company])if(value){const p=document.createElement('p');p.textContent=value;content.append(p);}
      const stats=document.createElement('p');stats.className='profile-stats';stats.textContent=Number(profile.followers||0).toLocaleString()+' followers · '+Number(profile.public_repos||0).toLocaleString()+' public repositories';content.append(stats);
      const projects=document.createElement('section');projects.className='profile-projects';
      const title=document.createElement('h3');title.textContent='Public projects';
      const list=document.createElement('div'),message=document.createElement('p'),more=document.createElement('button');
      more.textContent='Load more';more.hidden=true;projects.append(title,list,message,more);content.append(projects);
      let page=1,busy=false;
      async function loadProjects(){
        if(busy||id!==requestId)return;busy=true;more.disabled=true;message.textContent='Loading projects…';
        try{
          const response=await window.githubRequest('https://api.github.com/users/'+encodeURIComponent(login)+'/repos?type=owner&sort=updated&direction=desc&per_page=12&page='+page,{credentials:'omit',signal:controller.signal,headers:{Accept:'application/vnd.github+json'}});
          if(!response.ok)throw Error(response.status===403||response.status===429?'GitHub’s access limit was reached. Please try again later.':'Unable to load projects.');
          const repos=await response.json();if(id!==requestId)return;
          for(const repo of repos){
            const card=document.createElement('article');card.className='profile-project';
            card.append(window.repositoryStatusDot(repo));
            const link=document.createElement('button');link.textContent=repo.name;link.className='profile-project-link';
            link.onclick=()=>{cancel();dialog.close();window.openRepository(repo);};
            const description=document.createElement('p');description.textContent=repo.description||'No description provided.';
            const meta=document.createElement('small');meta.textContent=[repo.language,'★ '+Number(repo.stargazers_count||0).toLocaleString(),repo.fork?'Fork':null].filter(Boolean).join(' · ');
            card.append(link,description,meta);list.append(card);
          }
          message.textContent=page===1&&!repos.length?'No public projects to show.':'';
          more.hidden=!response.headers.get('link')?.includes('rel="next"');more.textContent='Load more';page++;
        }catch(error){if(id!==requestId||error.name==='AbortError')return;message.textContent=error instanceof TypeError?'Could not reach GitHub. Check your connection.':error.message;more.hidden=false;more.textContent='Retry loading projects';}
        finally{busy=false;if(id===requestId)more.disabled=false;}
      }
      more.onclick=loadProjects;loadProjects();
    }catch(error){if(id!==requestId||error.name==='AbortError')return;content.textContent=error instanceof TypeError?'Could not reach GitHub. Check your connection.':error.message;const retry=document.createElement('button');retry.textContent='Try again';retry.onclick=()=>show(login);content.append(retry);}
  }
  function activate(event){const avatar=event.target.closest('[data-github-profile]');if(!avatar)return;event.preventDefault();event.stopPropagation();show(avatar.dataset.githubProfile);}
  document.addEventListener('click',activate);
  document.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' ')activate(event);});
})();
