(() => {
 // Only game descendants are affected, never the music or background players.
 let host;
 try{
  if(window===top)return;
  let ancestor=parent,game=false;
  while(true){if(ancestor.location.pathname.endsWith('/games.html'))game=true;if(ancestor===ancestor.parent)break;ancestor=ancestor.parent;}
  if(!game)return;host=ancestor;
 }catch{return;}
 const media=new Map(),gains=new Set();
 const muted=()=>host.kermitMusicPlaying===true;
 function apply(){
  for(const element of document.querySelectorAll('audio,video'))track(element);
  for(const [element,previous] of media){if(muted())element.muted=true;else{element.muted=previous;media.delete(element);}}
  for(const gain of gains)gain.gain.value=muted()?0:1;
 }
 function track(element){if(muted()&&!media.has(element)){media.set(element,element.muted);element.muted=true;}}
 // Route Web Audio output through a dedicated gain without suspending game logic.
 const Native=window.AudioContext||window.webkitAudioContext;
 if(Native){
  const originalConnect=AudioNode.prototype.connect;
  const outputs=new WeakMap();
  AudioNode.prototype.connect=function(destination,...args){
   const gain=outputs.get(this.context);
   return originalConnect.call(this,gain&&destination===this.context.destination&&this!==gain?gain:destination,...args);
  };
  const Wrapped=new Proxy(Native,{construct(target,args){const context=Reflect.construct(target,args);const gain=context.createGain();originalConnect.call(gain,context.destination);gain.gain.value=muted()?0:1;outputs.set(context,gain);gains.add(gain);context.addEventListener('statechange',()=>{if(context.state==='closed')gains.delete(gain);});return context;}});
  window.AudioContext=Wrapped;if(window.webkitAudioContext)window.webkitAudioContext=Wrapped;
 }
 const play=HTMLMediaElement.prototype.play;
 HTMLMediaElement.prototype.play=function(...args){track(this);return play.apply(this,args);};
 document.addEventListener('volumechange',event=>{if(muted()&&event.target instanceof HTMLMediaElement){track(event.target);if(!event.target.muted)event.target.muted=true;}},true);
 const observer=new MutationObserver(apply);observer.observe(document,{childList:true,subtree:true});
 host.addEventListener('kermit-music-audio-change',apply);
 window.addEventListener('pagehide',()=>{observer.disconnect();host.removeEventListener('kermit-music-audio-change',apply);});
 apply();
})();
