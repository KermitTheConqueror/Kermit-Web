(() => {
  const joker=document.querySelector('.screen-joker');
  if(!joker)return;
  const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const panel=document.createElement('dialog');
  panel.className='joker-chat';
  panel.setAttribute('aria-label','Joker Game Finder');
  panel.innerHTML='<header><div><strong>Joker Game Finder</strong><small>Search games and view site help</small></div><button type="button" aria-label="Close game finder">×</button></header><form role="search"><label class="joker-label" for="joker-input">Game name</label><input id="joker-input" placeholder="Search by game name…" maxlength="100"><button>Search</button></form><div class="joker-messages"><section aria-live="polite"></section><details class="joker-message"><summary>How to play</summary><p>Search for a game and select its Play button.</p></details><details class="joker-message"><summary>Fullscreen and navigation</summary><p>Use the player toolbar for fullscreen or to go back. The bottom K button returns home.</p></details></div>';
  document.body.append(panel);
  const input=panel.querySelector('input'),results=panel.querySelector('section');
  function search(){
    results.replaceChildren();
    const q=normalize(input.value.trim()),status=document.createElement('p');
    results.append(status);
    if(!q){status.textContent='Enter a game name to search the library.';return;}
    const seen=new Set();
    const games=[...document.querySelectorAll('.game-launcher[data-url]')].filter(el=>{if(seen.has(el.dataset.url))return false;seen.add(el.dataset.url);return true;}).map(el=>({el,title:(el.querySelector('.game-title,.cover-label')?.textContent||'').trim()})).filter(g=>q.split(/\s+/).every(w=>normalize(g.title).includes(w))).sort((a,b)=>a.title.length-b.title.length);
    status.textContent=games.length?`${games.length} matches${games.length>30?' (first 30 shown; narrow your search)':''}`:'No matching games.';
    games.slice(0,30).forEach(g=>{const btn=document.createElement('button');btn.type='button';btn.textContent=`Play ${g.title}`;btn.style.cssText='display:block;width:100%;margin-bottom:8px;text-align:left';btn.onclick=()=>{panel.close();openGamePlayer(g.el);};results.append(btn);});
  }
  panel.querySelector('form').onsubmit=e=>{e.preventDefault();search();};
  input.oninput=search;
  panel.querySelector('header button').onclick=()=>panel.close();
  panel.addEventListener('click',e=>{if(e.target!==panel)return;const r=panel.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)panel.close();});
  joker.removeAttribute('aria-hidden');joker.setAttribute('role','button');joker.tabIndex=0;joker.alt='Open Joker Game Finder';joker.setAttribute('aria-haspopup','dialog');
  const open=()=>{if(!window.isJokerUnlocked?.())return;search();panel.showModal();input.focus();};
  joker.onclick=open;
  joker.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}};
  panel.addEventListener('close',()=>joker.focus());
})();
