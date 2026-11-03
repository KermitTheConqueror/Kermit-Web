(() => {
  const mobileScript=document.createElement('script');mobileScript.src='mobile-mode.js';document.head.append(mobileScript);
  if(parent!==window)return;
  const key='kermit.background.v1';
  const options=[
    ['default','Original Kermit background','background-video.mp4'],
    ['horizon','Celestial Horizon','backgrounds/celestial-horizon-above-the-storm-live-wallpaper-wallsflow-com.mp4'],
    ['train','Silent Train Ride','backgrounds/silent-train-ride-anime-live-wallpaper-wallsflow-com.mp4'],
    ['surfer','Silver Surfer','backgrounds/silver-surfer-cosmic-void-wallsflow-com.mp4'],
    ['skyline','Skyline × Minecraft','backgrounds/nissan-skyline-r33-x-minecraft-live-wallpaper-wallsflow-com.mp4'],
    ['oddish','Sunny Oddish','backgrounds/Sunny Oddish in a Blooming Meadow.png'],
    ["black-cat","Black Cat & Glowing Water","backgrounds/black-cat-glowing-water-live-wallpaper-wallsflow-com.mp4"],
    ["japanese-garden","Japanese Garden","backgrounds/whispers-of-the-japanese-garden-tranquil-temple-live-wallpaper-wallsflow-com.mp4"],
    ["eclipse-throne","Eclipse Throne","backgrounds/eclipse-throne-live-wallpaper-wallsflow-com.mp4"],
    ["sakura-warrior","Sakura Warrior","backgrounds/knight-of-falling-petals-sakura-warrior-live-wallpaper-wallsflow-com.mp4"],
    ["forgotten-station","Forgotten Train Station","backgrounds/forgotten-train-station.mp4"],
    ["minecraft-fireplace","Minecraft Cozy Fireplace","backgrounds/minecraft-cozy-fireplace_wallsflow-com.mp4"],
    ["clash-royale","Clash Royale","backgrounds/clash-royale-live-wallpaper-wallsflow-com.mp4"]
  ];
  const style=document.createElement('link');style.rel='stylesheet';style.href='background-settings.css';document.head.append(style);
  const dialog=document.createElement('dialog');dialog.className='background-settings';dialog.setAttribute('aria-labelledby','background-settings-title');
  const header=document.createElement('header'),title=document.createElement('h2'),close=document.createElement('button');title.id='background-settings-title';title.textContent='Settings';close.textContent='Close';close.onclick=()=>dialog.close();header.append(title,close);
  const text=document.createElement('p');text.className='settings-description';text.textContent='Make yourself at home. Pick a wallpaper — your choice saves automatically.';
  const grid=document.createElement('div');grid.className='background-options';
  const status=document.createElement('p');status.setAttribute('role','status');
  const motion=document.createElement('button');motion.className='background-motion';
  const sectionLabel=document.createElement('h3');sectionLabel.className='settings-section-label';sectionLabel.textContent='Wallpaper collection';
  const footer=document.createElement('footer');footer.className='settings-footer';footer.append(status,motion);
  dialog.append(header,text,sectionLabel,grid,footer);document.body.append(dialog);
  const mobileLabel=document.createElement('label');mobileLabel.className='mobile-mode-setting';
  const mobileToggle=document.createElement('input');mobileToggle.type='checkbox';mobileToggle.id='mobile-mode-toggle';
  mobileToggle.checked=/iPad/i.test(navigator.userAgent)||(/Mac/i.test(navigator.platform||navigator.userAgent)&&navigator.maxTouchPoints>1);
  try{const saved=localStorage.getItem('kermit.mobile-mode.v1');if(saved!==null)mobileToggle.checked=saved==='true';}catch{}
  const mobileText=document.createElement('span');const mobileTitle=document.createElement('strong');mobileTitle.textContent='Mobile mode';const mobileDescription=document.createElement('small');mobileDescription.textContent='Show the touch-friendly game collection and hide the slideshow.';mobileText.append(mobileTitle,mobileDescription);mobileLabel.append(mobileToggle,mobileText);text.after(mobileLabel);
  mobileToggle.onchange=()=>window.kermitSetMobileMode?.(mobileToggle.checked);
  let current='default',media,paused=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const badgeColors=new Map();
  function updateBadgeColor(id){
    if(badgeColors.has(id)){document.documentElement.style.setProperty('--wallpaper-badge-color',badgeColors.get(id));return;}
    const preview=new Image();
    preview.onload=()=>{
      try{
        const canvas=document.createElement('canvas');canvas.width=64;canvas.height=36;
        const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(preview,0,0,64,36);
        const pixels=ctx.getImageData(0,0,64,36).data,bins=new Map();
        for(let i=0;i<pixels.length;i+=4){
          const r=pixels[i],g=pixels[i+1],b=pixels[i+2],key=(r>>5)*64+(g>>5)*8+(b>>5);
          const bin=bins.get(key)||[0,0,0,0];bin[0]++;bin[1]+=r;bin[2]+=g;bin[3]+=b;bins.set(key,bin);
        }
        const top=[...bins.values()].sort((a,b)=>b[0]-a[0])[0];
        const color='rgb('+top.slice(1).map(v=>Math.round(v/top[0])).join(',')+')';
        badgeColors.set(id,color);
        if(current===id)document.documentElement.style.setProperty('--wallpaper-badge-color',color);
      }catch{}
    };
    preview.src='backgrounds/thumbnails/'+id+'.jpg';
  }
  function apply(id,persist=false){
    const option=options.find(item=>item[0]===id)||options[0];current=option[0];updateBadgeColor(current);
    window.kermitApplyUITheme?.(current);
    document.querySelectorAll('.site-background-video,.user-background').forEach(el=>{if(el.tagName==='VIDEO'){el.pause();el.removeAttribute('src');el.querySelectorAll('source').forEach(s=>s.remove());el.load();}el.remove();});
    const isImage=option[2].endsWith('.png');media=document.createElement(isImage?'img':'video');media.className='site-background-video user-background';media.setAttribute('aria-hidden','true');media.tabIndex=-1;
    if(isImage)media.alt='';else{media.muted=true;media.loop=true;media.playsInline=true;media.autoplay=!paused;media.preload='metadata';}
    media.src=option[2];media.onerror=()=>{status.textContent='Could not load this background. Try another option.';};document.body.prepend(media);
    if(!isImage&&!paused)media.play().catch(()=>{status.textContent='Press Play background to start the video.';});
    for(const button of grid.children)button.setAttribute('aria-pressed',String(button.dataset.id===current));
    motion.hidden=isImage;motion.textContent=paused?'Play background':'Pause background';status.textContent=option[1]+' selected.';
    if(persist)try{localStorage.setItem(key,current);}catch{status.textContent+=' Browser storage is unavailable, so this choice cannot be saved.';}
  }
  for(const [id,label,path] of options){const button=document.createElement('button');button.dataset.id=id;button.className='background-option';const image=document.createElement('img');image.className='background-thumbnail';image.alt=label+' preview';image.loading='lazy';image.decoding='async';image.width=400;image.height=225;image.src='backgrounds/thumbnails/'+id+'.jpg';const name=document.createElement('strong');name.textContent=label;const type=document.createElement('small');type.textContent=path.endsWith('.png')?'Still image':'Live wallpaper';button.append(image,name,type);button.onclick=()=>apply(id,true);grid.append(button);}
  motion.onclick=()=>{if(media.tagName!=='VIDEO')return;paused=!paused;if(paused)media.pause();else media.play().catch(()=>{status.textContent='Video playback is unavailable.';});motion.textContent=paused?'Play background':'Pause background';};
  const settings=document.createElement('button');settings.type='button';settings.className='background-settings-open';settings.textContent='⚙';settings.title='Settings';settings.setAttribute('aria-label','Settings');settings.onclick=()=>{dialog.showModal();};
  const settingsIcon=document.createElement('img');settingsIcon.src='settings-icon.svg';settingsIcon.alt='';settingsIcon.width=24;settingsIcon.height=24;settings.replaceChildren(settingsIcon);
  const dock=document.querySelector('.dock');if(dock)dock.append(settings);else{settings.classList.add('settings-floating');document.body.append(settings);}
  let initial='default';try{initial=localStorage.getItem(key)||initial;}catch{}apply(initial);
  window.addEventListener('storage',event=>{if(event.key===key)apply(event.newValue||'default');});
})();
