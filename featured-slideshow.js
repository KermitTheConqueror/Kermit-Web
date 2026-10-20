(() => {
  const host = document.querySelector('#featured-slideshow');
  if (!host) return;
  const games = [
    ['Minecraft','Minecraft 1.12.2.html','minecraft-user-wide.jpg','Build something extraordinary.'],
    ['Hollow Knight','Hollow Knight.html','hollow-knight.jpg','Discover a kingdom beneath the surface.'],
    ['Undertale','Undertale.html','undertale-castle.png','An adventure where every choice matters.'],
    ['Deltarune','DELTARUNE.html','deltarune-sunset.png','Step into the Dark World.'],
    ['1v1.LOL','1v1lol-reloaded.html','1v1lol-wide.jpg','Build fast. Aim higher.'],
    ['Balatro','balatro.html','balatro-user.png','Play your cards differently.'],
    ['The Binding of Isaac','Binding of Issac_ Wrath of the Lamb.html','isaac.jpg','One more run into the unknown.'],
    ['Mario & Luigi: Superstar Saga','clmarioandluigisuperstarsaga.html','mario-luigi-superstar-user.jpg','Team up for a superstar adventure.'],
    ['Candy Crush','Candy Crush.html','candy-crush.jpg','Match your way to something sweet.'],
    ['Pokemon Emerald','clpokemonemerald.html','pokemon-emerald-user.png','Your adventure through Hoenn starts here.']
  ];
  host.innerHTML = '<div class="featured-viewport"><div class="featured-track"></div><button class="featured-arrow featured-prev" aria-label="Previous game">‹</button><button class="featured-arrow featured-next" aria-label="Next game">›</button></div><div class="featured-controls"><span class="featured-count"></span><div class="featured-dots" aria-label="Choose featured game"></div></div>';
  const track=host.querySelector('.featured-track'), dots=host.querySelector('.featured-dots');
  const slides=[], indicators=[];
  let index=0, paused=matchMedia('(prefers-reduced-motion: reduce)').matches, hover=false, focused=false;
  games.forEach(([title,file,art,description],i)=>{
    const button=document.createElement('button');
    button.type='button'; button.className='featured-slide';
    if (file === '1v1lol-reloaded.html') button.classList.add('featured-1v1');
    if (file === 'clpokemonemerald.html') button.classList.add('featured-emerald');
    button.setAttribute('aria-label',`Play ${title}`);
    const image=document.createElement('img');image.src=`featured-art/${art}`;image.alt='';image.draggable=false;
    const copy=document.createElement('span');copy.className='featured-copy';
    const eyebrow=document.createElement('span');eyebrow.className='featured-eyebrow';eyebrow.textContent='IN THE SPOTLIGHT';
    const name=document.createElement('strong');name.textContent=title;
    const tagline=document.createElement('span');tagline.className='featured-tagline';tagline.textContent=description;
    const play=document.createElement('span');play.className='featured-play';play.textContent='▶  Play now';
    copy.append(eyebrow,name,tagline,play);button.append(image,copy);
    button.addEventListener('click',()=>{
      const launcher=[...document.querySelectorAll('.game-launcher[data-url]')].find(el=>el.dataset.url===file);
      if(launcher)openGamePlayer(launcher);
    });
    track.append(button);slides.push(button);
    const dot=document.createElement('button');dot.type='button';dot.setAttribute('aria-label',`Show ${title}`);
    dot.addEventListener('click',()=>show(i));dots.append(dot);indicators.push(dot);
  });
  function show(next){
    index=(next+games.length)%games.length;
    slides.forEach((slide,i)=>{
      slide.classList.toggle('is-current',i===index);
      slide.classList.toggle('is-prev',i===(index+games.length-1)%games.length);
      slide.classList.toggle('is-next',i===(index+1)%games.length);
      slide.tabIndex=i===index?0:-1;
      slide.setAttribute('aria-hidden',String(i!==index));
      indicators[i].setAttribute('aria-pressed',String(i===index));
    });
    host.querySelector('.featured-count').textContent=`${String(index+1).padStart(2,'0')} / 10`;
  }
  host.querySelector('.featured-prev').addEventListener('click',()=>show(index-1));
  host.querySelector('.featured-next').addEventListener('click',()=>show(index+1));
  host.addEventListener('mouseenter',()=>hover=true);host.addEventListener('mouseleave',()=>hover=false);
  host.addEventListener('focusin',()=>focused=true);host.addEventListener('focusout',e=>focused=host.contains(e.relatedTarget));
  host.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();show(index+1);}if(e.key==='ArrowLeft'){e.preventDefault();show(index-1);}});
  setInterval(()=>{if(!paused&&!hover&&!focused&&!document.hidden&&!document.querySelector('.game-player-page'))show(index+1);},6000);
  show(0);
})();
