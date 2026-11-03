(() => {
 const palettes={default:[145,45],horizon:[225,65],train:[32,55],surfer:[200,42],skyline:[190,65],oddish:[95,52],'black-cat':[165,62],'japanese-garden':[132,38],'eclipse-throne':[270,57],'sakura-warrior':[335,58],'forgotten-station':[82,35],'minecraft-fireplace':[22,66],'clash-royale':[215,70]};
 function apply(id){
  const [h,s]=palettes[id]||palettes.default;
  const values={accent:`hsl(${h} ${s}% 80%)`,text:`hsl(${h} 25% 95%)`,muted:`hsl(${h} 18% 75%)`,panel:`hsl(${h} 27% 9% / .95)`,field:`hsl(${h} 32% 6%)`,border:`hsl(${h} 18% 33%)`,soft:`hsl(${h} 30% 14%)`,hover:`hsl(${h} 28% 18%)`,ink:`hsl(${h} 35% 10%)`,active:`hsl(${h} ${s}% 75% / .18)`};
  for(const [key,value] of Object.entries(values))document.documentElement.style.setProperty('--ui-'+key,value);
 }
 window.kermitApplyUITheme=id=>{
  apply(id);
  for(const frame of document.querySelectorAll('iframe')){
   try{frame.contentWindow.kermitApplyUITheme?.(id);}catch{}
  }
 };
 let initial='default';try{initial=localStorage.getItem('kermit.background.v1')||initial;}catch{}
 // Newly opened page frames inherit even an unsaved choice from their parent.
 try{if(parent!==window)initial=parent.document.documentElement.dataset.uiBackground||initial;}catch{}
 const original=window.kermitApplyUITheme;
 window.kermitApplyUITheme=id=>{document.documentElement.dataset.uiBackground=id;original(id);};
 window.kermitApplyUITheme(initial);
 window.addEventListener('storage',event=>{if(event.key==='kermit.background.v1')window.kermitApplyUITheme(event.newValue||'default');});
})();
