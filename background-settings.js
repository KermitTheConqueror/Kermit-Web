(() => {
  if(parent!==window)return;
  const key='kermit.background.v1';
  const options=[
    ['default','Original Kermit background','background-video.mp4'],
    ['horizon','Celestial Horizon','backgrounds/celestial-horizon-above-the-storm-live-wallpaper-wallsflow-com.mp4'],
    ['train','Silent Train Ride','backgrounds/silent-train-ride-anime-live-wallpaper-wallsflow-com.mp4'],
    ['surfer','Silver Surfer','backgrounds/silver-surfer-cosmic-void-wallsflow-com.mp4'],
    ['skyline','Skyline × Minecraft','backgrounds/nissan-skyline-r33-x-minecraft-live-wallpaper-wallsflow-com.mp4'],
    ['oddish','Sunny Oddish','backgrounds/Sunny Oddish in a Blooming Meadow.png']
  ];
  const style=document.createElement('link');style.rel='stylesheet';style.href='background-settings.css';document.head.append(style);
  const dialog=document.createElement('dialog');dialog.className='background-settings';dialog.setAttribute('aria-labelledby','background-settings-title');
  const header=document.createElement('header'),title=document.createElement('h2'),close=document.createElement('button');title.id='background-settings-title';title.textContent='Settings';close.textContent='Close';close.onclick=()=>dialog.close();header.append(title,close);
  const text=document.createElement('p');text.textContent='Choose your background. Your choice is saved on this browser. Videos play muted; previews load when you open Settings.';
  const grid=document.createElement('div');grid.className='background-options';
  const status=document.createElement('p');status.setAttribute('role','status');
  const motion=document.createElement('button');motion.className='background-motion';
  dialog.append(header,text,grid,motion,status);document.body.append(dialog);
  let current='default',media,paused=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function apply(id,persist=false){
    const option=options.find(item=>item[0]===id)||options[0];current=option[0];
    document.querySelectorAll('.site-background-video,.user-background').forEach(el=>{if(el.tagName==='VIDEO'){el.pause();el.removeAttribute('src');el.querySelectorAll('source').forEach(s=>s.remove());el.load();}el.remove();});
    const isImage=option[2].endsWith('.png');media=document.createElement(isImage?'img':'video');media.className='site-background-video user-background';media.setAttribute('aria-hidden','true');media.tabIndex=-1;
    if(isImage)media.alt='';else{media.muted=true;media.loop=true;media.playsInline=true;media.autoplay=!paused;media.preload='metadata';}
    media.src=option[2];media.onerror=()=>{status.textContent='Could not load this background. Try another option.';};document.body.prepend(media);
    if(!isImage&&!paused)media.play().catch(()=>{status.textContent='Press Play background to start the video.';});
    for(const button of grid.children)button.setAttribute('aria-pressed',String(button.dataset.id===current));
    motion.hidden=isImage;motion.textContent=paused?'Play background':'Pause background';status.textContent=option[1]+' selected.';
    if(persist)try{localStorage.setItem(key,current);}catch{status.textContent+=' Browser storage is unavailable, so this choice cannot be saved.';}
  }
  const previews=[];
  for(const [id,label,path] of options){const button=document.createElement('button');button.dataset.id=id;button.className='background-option';const image=document.createElement('img');image.className='background-thumbnail';image.alt=label+' preview';image.loading='lazy';if(path.endsWith('.png'))image.src=path;else{let cached;try{cached=localStorage.getItem('kermit.bg-thumb.'+id);}catch{}if(cached)image.src=cached;else previews.push({id,path,image});}const name=document.createElement('strong');name.textContent=label;const type=document.createElement('small');type.textContent=path.endsWith('.png')?'Still image':'Live wallpaper';button.append(image,name,type);button.onclick=()=>apply(id,true);grid.append(button);}
  let makingPreviews=false;
  async function loadPreviews(){
    if(makingPreviews)return;makingPreviews=true;
    try{while(previews.length&&dialog.open){const {id,path,image}=previews.shift();await new Promise(resolve=>{
      const video=document.createElement('video');video.muted=true;video.playsInline=true;video.preload='auto';
      let finished=false;const cleanup=()=>{if(finished)return;finished=true;clearTimeout(timer);video.onloadeddata=video.onseeked=video.onerror=null;video.removeAttribute('src');video.load();resolve();};
      const capture=()=>{try{const canvas=document.createElement('canvas');canvas.width=400;canvas.height=Math.round(400*video.videoHeight/video.videoWidth);canvas.getContext('2d').drawImage(video,0,0,canvas.width,canvas.height);const data=canvas.toDataURL('image/jpeg',.75);image.src=data;try{localStorage.setItem('kermit.bg-thumb.'+id,data);}catch{}}catch{}cleanup();};
      const timer=setTimeout(cleanup,20000);video.onloadeddata=()=>{if(video.duration>1){video.currentTime=1;}else capture();};video.onseeked=capture;video.onerror=cleanup;video.src=path;
    });}}finally{makingPreviews=false;}
  }
  motion.onclick=()=>{if(media.tagName!=='VIDEO')return;paused=!paused;if(paused)media.pause();else media.play().catch(()=>{status.textContent='Video playback is unavailable.';});motion.textContent=paused?'Play background':'Pause background';};
  const settings=document.createElement('button');settings.type='button';settings.className='background-settings-open';settings.textContent='⚙';settings.title='Settings';settings.setAttribute('aria-label','Settings');settings.onclick=()=>{dialog.showModal();loadPreviews();};
  const dock=document.querySelector('.dock');if(dock)dock.append(settings);else{settings.classList.add('settings-floating');document.body.append(settings);}
  let initial='default';try{initial=localStorage.getItem(key)||initial;}catch{}apply(initial);
  window.addEventListener('storage',event=>{if(event.key===key)apply(event.newValue||'default');});
})();
