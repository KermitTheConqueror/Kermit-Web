// The catalog is populated asynchronously, after the document load event.
document.addEventListener('DOMContentLoaded',()=>{
  const grid=document.querySelector('#game-grid');
  if(!grid||window.parent===window)return;
  let done=false,quietTimer;
  const watched=new WeakSet();
  function check(){
    if(done)return;
    clearTimeout(quietTimer);
    if(!grid.querySelector('.game-card-item'))return;
    const images=[...grid.querySelectorAll('img')];
    for(const image of images){
      // Images below the fold must load too, while the catalog is covered.
      image.loading='eager';
      if(!watched.has(image)){
        watched.add(image);
        image.addEventListener('load',check);
        image.addEventListener('error',check);
      }
    }
    if(images.length&&images.every(image=>image.complete))quietTimer=setTimeout(()=>{
      const current=[...grid.querySelectorAll('img')];
      if(!current.length||current.some(image=>!image.complete))return check();
      done=true;observer.disconnect();
      // Failed images count as settled so an unavailable cover cannot trap users.
      window.parent.postMessage({type:'kermit-cloud-images-ready'},location.origin);
    },200);
  }
  const observer=new MutationObserver(check);
  observer.observe(grid,{childList:true,subtree:true,attributes:true,attributeFilter:['src','srcset']});
  check();
  window.addEventListener('pagehide',()=>{observer.disconnect();clearTimeout(quietTimer);},{once:true});
});
