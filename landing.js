const catalogShell = document.querySelector('#catalog-shell');
const pageDock = document.querySelector('.dock');
pageDock.classList.add('page-aware');
function highlightPage(page) {
  pageDock.querySelectorAll('a').forEach(link => {
    if (link.getAttribute('aria-label') === page) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}
highlightPage('Home');
const catalogFrame = document.querySelector('#catalog-frame');
const moviesFrame = document.createElement('iframe');
moviesFrame.id = 'movies-frame';
moviesFrame.title = 'Kermit Web movies';
moviesFrame.style.display = 'none';
catalogShell.append(moviesFrame);
const cloudFrame=document.createElement('iframe');
cloudFrame.id='cloud-frame';cloudFrame.title='Kermit Web cloud gaming';cloudFrame.style.display='none';catalogShell.append(cloudFrame);
cloudFrame.allow='fullscreen; autoplay; gamepad';
cloudFrame.allowFullscreen=true;
const catalogHome = document.querySelector('#catalog-home');
const reposFrame=document.createElement('iframe');
reposFrame.id='repositories-frame';reposFrame.title='GitHub repository search';reposFrame.style.display='none';catalogShell.append(reposFrame);
const sectionLoader = document.createElement('div');
sectionLoader.className='section-loader';sectionLoader.hidden=true;
sectionLoader.innerHTML='<div class="section-loader-content"><span class="section-loader-mark">K</span><h2></h2><p role="status">Opening page…</p><div class="section-loader-track"><span></span></div><button type="button" hidden>Show page</button></div>';
catalogShell.append(sectionLoader);
let loadingFrame=null, sectionLoadTimeout;
function showSectionLoader(frame,title){
  clearTimeout(sectionLoadTimeout);loadingFrame=frame;
  sectionLoader.hidden=frame.dataset.loaded==='true';
  sectionLoader.querySelector('h2').textContent=title;
  sectionLoader.querySelector('p').textContent='Opening page…';
  sectionLoader.querySelector('button').hidden=true;
  if(!sectionLoader.hidden)sectionLoadTimeout=setTimeout(()=>{
    sectionLoader.querySelector('p').textContent='Taking longer than expected. You can show the page while it loads.';
    sectionLoader.querySelector('button').hidden=false;
  },15000);
}
sectionLoader.querySelector('button').onclick=()=>{sectionLoader.hidden=true;clearTimeout(sectionLoadTimeout);};
[catalogFrame,moviesFrame,cloudFrame,reposFrame].forEach(frame=>frame.addEventListener('load',()=>{
  if(!frame.getAttribute('src'))return;
  if(frame===cloudFrame)return; // Cloud catalog reports readiness after its images settle.
  frame.dataset.loaded='true';
  if(loadingFrame===frame){sectionLoader.hidden=true;clearTimeout(sectionLoadTimeout);}
}));
window.addEventListener('message',event=>{
  if (event.origin === location.origin && event.source === catalogFrame.contentWindow &&
      catalogFrame.getAttribute('src') && event.data?.type === 'kermit-games-ready') {
    catalogFrame.dataset.loaded = 'true';
    if (loadingFrame === catalogFrame) { sectionLoader.hidden = true; clearTimeout(sectionLoadTimeout); }
    return;
  }
  if(event.origin!=='http://127.0.0.1:8010'||event.source!==cloudFrame.contentWindow||!cloudFrame.getAttribute('src'))return;
  if(event.data?.type!=='kermit-cloud-images-ready')return;
  cloudFrame.dataset.loaded='true';
  if(loadingFrame===cloudFrame){sectionLoader.hidden=true;clearTimeout(sectionLoadTimeout);}
});

function openCatalog(destination = 'games.html') {
  const url = new URL(destination, location.href);
  url.searchParams.set('v', url.pathname.endsWith('/movies.html') ? '20261017-direct-tmdb-2' : url.pathname.endsWith('/cloud.html') ? '20261017-cloud-refresh' : '20261018-fresh-covers');
  const isMovies = url.pathname.endsWith('/movies.html');
  const isCloud = url.pathname.endsWith('/cloud.html');
  const isRepos = url.pathname.endsWith('/repositories.html');
  const frame = isRepos ? reposFrame : isCloud ? cloudFrame : isMovies ? moviesFrame : catalogFrame;
  highlightPage(isRepos ? 'Repositories' : isCloud ? 'Cloud Gaming' : isMovies ? 'Movies' : 'Games');
  stopGamesBeforeLeaving(frame);
  const currentSource = frame.getAttribute('src');
  const needsNavigation=!currentSource || (url.searchParams.has('launch') && new URL(currentSource, location.href).href !== url.href);
  if(needsNavigation)delete frame.dataset.loaded;
  showSectionLoader(frame,isRepos?'Repositories':isCloud?'Cloud Gaming':isMovies?'Movies & Shows':'Games');
  // Keep each page alive; only an explicit game launch may change its URL.
  if (needsNavigation) frame.src = isCloud ? 'http://127.0.0.1:8010/index-261014.html?v=images-ready-2' : url.href;
  [catalogFrame,moviesFrame,cloudFrame,reposFrame].forEach(item=>{item.style.display=item===frame?'block':'none';});
  catalogShell.hidden = false;
  document.body.classList.add('catalog-open');
  document.body.style.overflow = 'hidden';
  history.replaceState({ catalogOpen: true }, '', isRepos?'#repositories':isCloud?'#cloud':isMovies?'#movies':'#games');
}

function closeCatalog() {
  highlightPage('Home');
  stopGamesBeforeLeaving(null);
  sectionLoader.hidden=true;loadingFrame=null;clearTimeout(sectionLoadTimeout);
  catalogShell.hidden = true;
  document.body.classList.remove('catalog-open');
  document.body.style.overflow = '';
  history.replaceState({}, '', location.pathname);
}

// Unload the outgoing game page, not just its visual layer. This also stops
// audio, timers and cloud streaming connections inside nested game frames.
function stopGamesBeforeLeaving(nextFrame) {
  for (const frame of [catalogFrame, cloudFrame]) {
    if (frame === nextFrame || !frame.getAttribute('src')) continue;
    if (document.fullscreenElement === frame) document.exitFullscreen().catch(() => {});
    frame.removeAttribute('src');
    delete frame.dataset.loaded;
  }
}

document.querySelectorAll('a[href^="games.html"]:not(.dock-search), a[href="movies.html"], a[href="cloud.html"], a[href="repositories.html"]').forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();
    openCatalog(link.getAttribute('href'));
  });
});
document.querySelector('.game-wall')?.addEventListener('click', event => {
  const link = event.target.closest('a[href]');
  if (!link) return;
  event.preventDefault();
  openCatalog(`games.html?launch=${encodeURIComponent(link.getAttribute('href'))}`);
});
document.querySelector('.dock .brand-mark')?.addEventListener('click', event => {
  if (!catalogShell.hidden) {
    event.preventDefault();
    closeCatalog();
  }
});
catalogHome?.addEventListener('click', closeCatalog);
window.addEventListener('message', event => {
  const validOrigin = location.origin === 'null' ? event.origin === 'null' : event.origin === location.origin;
  if (!validOrigin) return;
  if (event.data?.type === 'kermit-home') closeCatalog();
  if (event.data?.type === 'kermit-search') toggleSiteSearch();
});
if (location.hash === '#games') openCatalog('games.html');
if (location.hash === '#movies') openCatalog('movies.html');
if (location.hash === '#cloud') openCatalog('cloud.html');
if (location.hash === '#repositories') openCatalog('repositories.html');
[catalogFrame, moviesFrame].forEach(frame => frame.addEventListener('load', () => {
  const doc = frame.contentDocument;
  if (!doc) return;
  doc.querySelectorAll('.dock, .page-dock').forEach(dock => { dock.style.display = 'none'; });
  doc.addEventListener('click', event => {
    const link = event.target.closest('.dock a, .page-dock a, header .brand');
    if (!link) return;
    const url = new URL(link.href);
    if (url.origin !== location.origin) return;
    event.preventDefault();
    if (url.pathname.endsWith('/movies.html')) openCatalog('movies.html');
    else if (url.pathname.endsWith('/games.html') || url.hash === '#games') openCatalog('games.html');
    else closeCatalog();
  }, true);
}));

const siteSearch = document.querySelector('#site-search');
const siteSearchInput = document.querySelector('#site-search-input');
const siteSearchResults = document.querySelector('#site-search-results');
let searchableGames = [];

async function loadSearchableGames() {
  if (searchableGames.length) return;
  const html = await fetch('games.html?v=20261013-pokemon', { cache: 'no-store' }).then(response => response.text());
  const page = new DOMParser().parseFromString(html, 'text/html');
  searchableGames = [...page.querySelectorAll('.game-launcher[data-url]')]
    .map(game => ({
      title: (game.querySelector('.game-title, .cover-label')?.textContent || '').trim(),
      url: game.dataset.url
    }))
    .filter((game, index, all) => game.title && all.findIndex(item => item.url === game.url) === index);
}

function showSiteSearchResults() {
  const query = siteSearchInput.value.trim().toLowerCase();
  siteSearchResults.replaceChildren();
  if (!query) { siteSearchResults.style.display = 'none'; return; }
  const matches = searchableGames.filter(game => game.title.toLowerCase().includes(query)).slice(0, 10);
  matches.forEach(game => {
    const button = document.createElement('button');
    button.className = 'site-search-result';
    button.type = 'button';
    button.textContent = game.title;
    button.addEventListener('click', () => {
      siteSearch.hidden = true;
      siteSearchResults.style.display = 'none';
      openCatalog(`games.html?launch=${encodeURIComponent(game.url)}`);
    });
    siteSearchResults.appendChild(button);
  });
  siteSearchResults.style.display = matches.length ? 'block' : 'none';
}

async function toggleSiteSearch() {
  siteSearch.hidden = !siteSearch.hidden;
  if (!siteSearch.hidden) {
    await loadSearchableGames();
    siteSearchInput.focus();
    showSiteSearchResults();
  }
}

document.querySelector('.dock-search')?.addEventListener('click', event => {
  event.preventDefault();
  toggleSiteSearch();
});
siteSearchInput?.addEventListener('input', showSiteSearchResults);
siteSearch?.querySelector('.search-backdrop')?.addEventListener('click', () => {
  siteSearch.hidden = true;
  siteSearchResults.style.display = 'none';
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !siteSearch.hidden) {
    siteSearch.hidden = true;
    siteSearchResults.style.display = 'none';
  }
});

// Duplicate each column once, then move it by its precisely measured set height.
// Using requestAnimationFrame avoids the visible reset/jump of percentage animations.
const scrollingColumns = [...document.querySelectorAll('.wall-column')].map(column => {
  const originals = [...column.children];
  originals.forEach(card => {
    const clone = card.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.setAttribute('tabindex', '-1');
    column.appendChild(clone);
  });

  const state = {
    element: column,
    originalCount: originals.length,
    direction: column.classList.contains('wall-column-b') ? 1 : -1,
    offset: 0,
    seam: 1,
    paused: false
  };

  column.addEventListener('mouseenter', () => { state.paused = true; });
  column.addEventListener('mouseleave', () => { state.paused = false; });
  column.addEventListener('focusin', () => { state.paused = true; });
  column.addEventListener('focusout', () => { state.paused = false; });
  return state;
});

function measureColumns() {
  scrollingColumns.forEach(state => {
    const cards = state.element.children;
    state.seam = cards[state.originalCount].offsetTop - cards[0].offsetTop;
    state.offset = state.direction > 0 ? -state.seam : 0;
    state.element.style.transform = `translate3d(0, ${state.offset}px, 0)`;
  });
}

let lastScrollFrame = performance.now();
const SCROLL_SPEED = 24;
function scrollGameWall(now) {
  const elapsed = Math.min((now - lastScrollFrame) / 1000, 0.04);
  lastScrollFrame = now;

  scrollingColumns.forEach(state => {
    if (state.paused || state.seam <= 1) return;
    state.offset += SCROLL_SPEED * state.direction * elapsed;
    if (state.direction < 0 && state.offset <= -state.seam) state.offset += state.seam;
    if (state.direction > 0 && state.offset >= 0) state.offset -= state.seam;
    state.element.style.transform = `translate3d(0, ${state.offset}px, 0)`;
  });
  requestAnimationFrame(scrollGameWall);
}

addEventListener('load', measureColumns, { once: true });
addEventListener('resize', measureColumns);
requestAnimationFrame(scrollGameWall);

const canvas = document.querySelector('#stars');
const ctx = canvas.getContext('2d');
let particles = [];
let shootingStars = [];
let nextShootingStar = performance.now() + 3500;

function resize() {
  canvas.width = innerWidth * devicePixelRatio;
  canvas.height = innerHeight * devicePixelRatio;
  canvas.style.width = `${innerWidth}px`;
  canvas.style.height = `${innerHeight}px`;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  particles = Array.from({ length: Math.max(45, Math.floor(innerWidth / 20)) }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    r: Math.random() * 1.6 + .45,
    a: Math.random() * .55 + .25,
    v: Math.random() * .12 + .03,
    phase: Math.random() * Math.PI * 2,
    twinkle: Math.random() * .018 + .006,
    tint: Math.random() > .82 ? '190,220,255' : '255,255,255'
  }));
}

function draw(now = performance.now()) {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  for (const p of particles) {
    p.y -= p.v;
    p.phase += p.twinkle;
    if (p.y < -4) { p.y = innerHeight + 4; p.x = Math.random() * innerWidth; }
    ctx.beginPath();
    ctx.fillStyle = `rgba(${p.tint},${Math.max(.12, p.a + Math.sin(p.phase) * .18)})`;
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }

  if (now >= nextShootingStar && shootingStars.length === 0) {
    shootingStars.push({ x: Math.random() * innerWidth * .55, y: Math.random() * innerHeight * .35, life: 1 });
    nextShootingStar = now + 6500 + Math.random() * 7000;
  }
  shootingStars = shootingStars.filter(star => {
    const gradient = ctx.createLinearGradient(star.x - 85, star.y - 45, star.x, star.y);
    gradient.addColorStop(0, 'rgba(160,205,255,0)');
    gradient.addColorStop(1, `rgba(225,240,255,${star.life * .72})`);
    ctx.beginPath();
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 1.25;
    ctx.moveTo(star.x - 85, star.y - 45);
    ctx.lineTo(star.x, star.y);
    ctx.stroke();
    star.x += 4.2;
    star.y += 2.2;
    star.life -= .018;
    return star.life > 0;
  });
  requestAnimationFrame(draw);
}

addEventListener('resize', resize);
resize();
draw();
