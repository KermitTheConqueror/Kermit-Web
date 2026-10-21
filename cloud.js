const host=document.querySelector('#cloud-host');
const gameLinks=[
 {name:'Roblox',path:'com.roblox.client',image:'https://play-lh.googleusercontent.com/QqZj22aXblAyYDxLQw-Gg0ycW0QkKhrDnwqgERZU9BMRXZnMlgXfq-94sikG5mEpt_I0lzZxcUzfLblmQgwYzUE=w240-h480-rw'},
 {name:'Brawl Stars',path:'com.supercell.brawlstars',image:'https://play-lh.googleusercontent.com/wEOIM7cYyXkMExNztvFYKHJLPegXp6h81-P_JQQ_9KQvDCWK49m2zpt1mTRXO5bA2qU_Bp4em_nfMsHXmq8Z=w240-h480-rw'},
 {name:'Fortnite',path:'com.epicgames.fortnite',image:'https://play-lh.googleusercontent.com/kFD7zd_CN6HBVdDr_S2KsPyU3kDakbJSuC1U_0l6xEwjZd8M2R7Sk9CelUSAsgFvC4MIDZqMKxix-3_5wKAuGA=w240-h480-rw'}
];
function openCloud(game){
 if(host.querySelector('iframe')&&!confirm('Replace the current CloudMoon view? An active game may disconnect.'))return;
 const frame=document.createElement('iframe');
 const url=game?'https://web.cloudmoonapp.com/game/'+game.path+'/':'https://web.cloudmoonapp.com/';
 frame.src=url;frame.title=game?game.name+' on CloudMoon':'Official CloudMoon game catalog';
 frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-pointer-lock allow-presentation');
 frame.setAttribute('allow','fullscreen; autoplay; gamepad');frame.allowFullscreen=true;frame.referrerPolicy='no-referrer';
 host.replaceChildren(frame);
 const help=document.querySelector('.player-help');help.hidden=false;help.replaceChildren(document.createTextNode('If CloudMoon cannot load inside the site, '));const direct=document.createElement('a');direct.href=url;direct.target='_blank';direct.rel='noopener noreferrer';direct.textContent='open it directly';help.append(direct,document.createTextNode('. CloudMoon may require its own login or subscription.'));
 document.querySelector('#cloud-title').textContent=game?game.name:'CloudMoon catalog';
 document.querySelector('#cloud-player').showModal();
}
for(const game of gameLinks){const button=document.createElement('button');button.className='cloud-game';button.setAttribute('aria-label','Open '+game.name);const image=document.createElement('img');image.src=game.image;image.alt='';image.loading='lazy';image.onerror=()=>image.hidden=true;const name=document.createElement('strong');name.textContent=game.name;button.append(image,name);button.onclick=()=>openCloud(game);document.querySelector('#cloud-games').append(button);}
const player=document.querySelector('#cloud-player');
document.querySelector('#close-player').onclick=()=>player.close();
player.addEventListener('close',()=>{host.replaceChildren();document.querySelector('.player-help').hidden=true;});
document.querySelector('#fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await player.requestFullscreen();}catch{const help=document.querySelector('.player-help');help.hidden=false;help.textContent='Fullscreen is unavailable here. Try the fullscreen control inside CloudMoon.';}};
