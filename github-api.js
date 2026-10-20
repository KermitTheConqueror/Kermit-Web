(() => {
  const key='kermit.github-cache.v1',limitKey='kermit.github-limits.v1';
  let cache={},limits={};
  try{cache=JSON.parse(sessionStorage.getItem(key)||'{}');limits=JSON.parse(sessionStorage.getItem(limitKey)||'{}');}catch{}
  const banner=document.createElement('div');banner.className='github-limit-banner';banner.setAttribute('role','status');
  function attach(){if(!banner.isConnected)document.body.append(banner);}
  function updateBanner(){
    const until=Math.max(0,...Object.values(limits));
    banner.hidden=until<=Date.now();
    if(!banner.hidden){attach();const seconds=Math.ceil((until-Date.now())/1000);banner.textContent='GitHub request limit · Cached pages still work. Retry in '+Math.floor(seconds/60)+'m '+seconds%60+'s.';}
  }
  setInterval(updateBanner,1000);
  function save(){
    const entries=Object.entries(cache).sort((a,b)=>b[1].time-a[1].time);let bytes=0;cache={};
    for(const [id,value] of entries){bytes+=value.body.length;if(bytes>2500000)break;cache[id]=value;}
    try{sessionStorage.setItem(key,JSON.stringify(cache));sessionStorage.setItem(limitKey,JSON.stringify(limits));}catch{}
  }
  function restore(item){return new Response(item.body,{status:200,headers:item.headers});}
  window.githubRequest=async (url,options={})=>{
    const address=new URL(url,location.href);
    if(address.origin!=='https://api.github.com'||(options.method&&options.method!=='GET'))return fetch(url,options);
    const bucket=address.pathname.startsWith('/search/')?'search':'core';
    const accept=new Headers(options.headers).get('Accept')||'';
    const id=address.href+'|'+accept,item=cache[id];
    const ttl=bucket==='search'?5*60000:15*60000;
    if(item&&Date.now()-item.time<ttl)return restore(item);
    if(limits[bucket]>Date.now()){
      updateBanner();if(item)return restore(item);
      throw Error('GitHub is temporarily limiting requests. Try again after '+new Date(limits[bucket]).toLocaleTimeString()+'. Cached repositories remain available.');
    }
    const response=await fetch(url,{...options,signal:options.signal||AbortSignal.timeout(15000)});
    if(response.status===403||response.status===429){
      let detail={};try{detail=await response.clone().json();}catch{}
      const limited=response.status===429||response.headers.get('x-ratelimit-remaining')==='0'||/rate limit|abuse|secondary limit/i.test(detail.message||'');
      if(limited){
        const reset=Number(response.headers.get('x-ratelimit-reset'))*1000;
        const after=Number(response.headers.get('retry-after'))*1000;
        limits[bucket]=Math.max(Date.now()+60000,reset||0,Date.now()+(after||0));save();updateBanner();
        if(item)return restore(item);
        throw Error('GitHub request limit reached. Try again after '+new Date(limits[bucket]).toLocaleTimeString()+'.');
      }
      throw Error('GitHub denied access to this information. It may require sign-in or repository permission.');
    }
    if(response.ok){
      const body=await response.clone().text();
      if(body.length<1000000){cache[id]={body,headers:[...response.headers],time:Date.now()};save();}
      if(response.headers.get('x-ratelimit-remaining')==='0'){limits[bucket]=Number(response.headers.get('x-ratelimit-reset'))*1000||Date.now()+60000;save();updateBanner();}
    }
    return response;
  };
})();
