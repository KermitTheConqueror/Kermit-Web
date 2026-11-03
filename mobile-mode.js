(() => {
 const key='kermit.mobile-mode.v1';
 const normalize=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
 const titles=new Set([
  'Flappy Bird', 'Candy Crush', '2048', 'Bad Piggies', 'Blockblast',
  'Cookie Clicker', 'Crossy Road', 'Eggy Car', 'Bouncy Basketball',
  'Football Bros', 'Football Legends', 'Drive Mad', 'Drift Boss',
  'Drift Hunters', 'Escape Road', 'Crazy Cars', 'Crazy Motorcycle',
  'Crazy Plane Landing', 'Blaze Drifter', 'Blumgi Racers', 'Bouncy Motors',
  'Blocky Demolition Derby', 'Car Drawing', 'Car King Arena',
  'Car Ramp Vs Police Chase', 'Deadly Descent', 'Demolition Derby Crash Racing',
  'Highway Racer', 'Hover Racer Drive', '2-3-4 Player Games',
  'Archery World Tour', 'Arcade Volley', 'A Small World Cup', 'Golf Battle',
  'Bacon May Die', 'Ball Blast', 'Bit Planes', 'Blockpost', 'Bouncemasters',
  'Burrito Bison Launcha Libre', 'Cannon Balls 3D', 'Geometry Vibes',
  'Helix Jump', 'Block the Pig', 'Capybara Clicker', 'Chess Classic',
  'Cut the Rope', 'Growmi', 'Basketball Stars', 'Basketball Legends',
  '8 Ball Pool', 'A Dance of Fire and Ice', 'Going Balls', 'Count Masters',
  'Geometry Dash SubZero', 'Poly Track', 'Build a Big Army', '3 Dash',
  '2048: Cupcakes', '99 Balls', 'Curveball', 'Idle Dice', 'Meowdoku', 'PokeRogue'
 ].map(normalize));
 const isIPad=()=>/iPad/i.test(navigator.userAgent)||(/Mac/i.test(navigator.platform||navigator.userAgent)&&navigator.maxTouchPoints>1);
 const enabled=()=>{try{const saved=localStorage.getItem(key);if(saved!==null)return saved==='true';}catch{}return isIPad();};
 window.kermitMobileEnabled=enabled;
 window.kermitMobileAllowed=title=>!enabled()||titles.has(normalize(title));
 const style=document.createElement('style');style.textContent='html.mobile-mode #featured-slideshow,html.mobile-mode .game-wall,html.mobile-mode .game-launcher[data-mobile="false"]{display:none!important}html.mobile-mode #all-games-container .game-launcher[data-mobile="true"]{display:flex!important}html.mobile-mode #all-games-container .game-launcher[data-mobile-search-hidden="true"]{display:none!important}.mobile-mode-setting{display:flex;align-items:center;gap:14px;padding:18px;margin:18px 0;border:1px solid #ffffff30;border-radius:14px}.mobile-mode-setting input{width:24px;height:24px;flex:none;accent-color:#a9edbd}.mobile-mode-setting small{display:block;opacity:.75;margin-top:5px}';document.head.append(style);
 function apply(){
  const on=enabled();
  document.documentElement.classList.toggle('mobile-mode',on);
  const query=normalize(document.querySelector('#game-search')?.value);
  for(const card of document.querySelectorAll('.game-launcher[data-url]')){
   const title=card.querySelector('.game-title,.cover-label')?.textContent;
   const allowed=titles.has(normalize(title));
   card.dataset.mobile=String(allowed);
   card.dataset.mobileSearchHidden=String(!!query&&!normalize(title).includes(query));
   if(on){
    if(!('mobileOriginalSearchOnly' in card.dataset))card.dataset.mobileOriginalSearchOnly=String(card.classList.contains('search-only'));
    card.classList.toggle('search-only',!allowed);
    card.hidden=!allowed;
   }else if('mobileOriginalSearchOnly' in card.dataset){
    card.classList.toggle('search-only',card.dataset.mobileOriginalSearchOnly==='true');
    card.hidden=false;
    delete card.dataset.mobileOriginalSearchOnly;
   }
  }
  const toggle=document.querySelector('#mobile-mode-toggle');if(toggle)toggle.checked=on;
  syncPlayerDock();
 }
 function syncPlayerDock(){
  const playing=document.body.classList.contains('game-player-open');
  try{if(window.frameElement?.id==='catalog-frame')window.parent.document.body.classList.toggle('mobile-game-open',playing);}catch{}
 }
 window.addEventListener('storage',e=>{if(e.key===key)apply();});window.addEventListener('kermit-mobile-change',apply);document.addEventListener('input',e=>{if(e.target.id==='game-search')apply();});
 function init(){apply();new MutationObserver(syncPlayerDock).observe(document.body,{attributes:true,attributeFilter:['class']});const container=document.querySelector('#all-games-container');if(container)new MutationObserver(apply).observe(container,{childList:true});}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
 window.addEventListener('pageshow',apply);
 window.kermitSetMobileMode=value=>{
  try{localStorage.setItem(key,String(value));}catch{}
  window.dispatchEvent(new Event('kermit-mobile-change'));
  // Update an already-open embedded Games page immediately, too.
  for(const frame of document.querySelectorAll('iframe')){
   try{frame.contentWindow.dispatchEvent(new frame.contentWindow.Event('kermit-mobile-change'));}catch{}
  }
 };
})();
