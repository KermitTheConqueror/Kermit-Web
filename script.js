const canvas = document.getElementById('snowCanvas');
const ctx = canvas?.getContext('2d');
const parentMessageOrigin = window.location.origin === 'null' ? '*' : window.location.origin;

if (window.parent !== window) {
    document.body.classList.add('embedded-page');
}

const dockHomeLink = document.querySelector('.dock .brand-mark');
if (dockHomeLink && window.parent !== window) {
    dockHomeLink.addEventListener('click', event => {
        event.preventDefault();
        window.parent.postMessage({ type: 'kermit-home' }, parentMessageOrigin);
    });
}

let width, height;
let snowflakes = [];

// Snowflake configuration
const SNOWFLAKE_COUNT_FACTOR = 0.15; // Flakes per pixel of width approx
const MIN_SIZE = 1;
const MAX_SIZE = 3;
const MIN_SPEED = 0.5;
const MAX_SPEED = 1.5;

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    initSnowflakes();
}

class Snowflake {
    constructor() {
        this.reset(true);
    }

    reset(initial = false) {
        this.x = Math.random() * width;
        // Start anywhere vertically if initial, otherwise start just above screen
        this.y = initial ? Math.random() * height : -10;
        
        this.size = Math.random() * (MAX_SIZE - MIN_SIZE) + MIN_SIZE;
        this.speed = Math.random() * (MAX_SPEED - MIN_SPEED) + MIN_SPEED;
        
        // Horizontal drift properties
        this.drift = (Math.random() - 0.5) * 0.5;
        this.driftPhase = Math.random() * Math.PI * 2;
        
        this.opacity = Math.random() * 0.4 + 0.4; // 0.4 to 0.8
    }

    update() {
        this.y += this.speed;
        
        // Add subtle sine wave movement
        this.driftPhase += 0.01;
        this.x += Math.sin(this.driftPhase) * 0.3 + this.drift;

        // Reset if off screen
        if (this.y > height + 10) {
            this.reset();
        }
    }

    draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initSnowflakes() {
    snowflakes = [];
    const count = Math.floor(width * SNOWFLAKE_COUNT_FACTOR); // Responsive density
    for (let i = 0; i < Math.max(50, count); i++) {
        snowflakes.push(new Snowflake());
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);
    
    snowflakes.forEach(flake => {
        flake.update();
        flake.draw();
    });
    
    requestAnimationFrame(animate);
}

if (canvas) window.addEventListener('resize', resize);

 // Game Launcher Logic
const gamesContainer = document.getElementById('games-container');
const allGamesContainer = document.getElementById('all-games-container');
const galleryWrapper = document.getElementById('gallery-wrapper');
const searchInput = document.getElementById('game-search');
const suggestionsContainer = document.getElementById('search-suggestions');

// Fold the former auto-scrolling games into the regular square game library.
if (gamesContainer && allGamesContainer && galleryWrapper) {
    const featuredGames = Array.from(gamesContainer.querySelectorAll(':scope > .game-launcher'));
    featuredGames.forEach(game => {
        const title = (game.querySelector('.game-title')?.textContent || 'Game').trim();
        const image = game.querySelector('img');
        const cover = image?.getAttribute('src') || game.style.backgroundImage.match(/url\(["']?(.*?)["']?\)/)?.[1];
        game.className = 'game-launcher cover-only';
        game.removeAttribute('style');
        if (cover) game.style.setProperty('--card-image', `url("${cover}")`);
        const label = document.createElement('div');
        label.className = 'cover-label';
        label.textContent = title;
        game.replaceChildren(label);
    });
    allGamesContainer.prepend(...featuredGames);
    galleryWrapper.remove();
}

// Rank the complete library: major titles first, then recognizable franchises,
// then increasingly niche entries. Every game receives a score.
if (allGamesContainer) {
    const headlineGames = [
        'Minecraft 1.12.2', 'Geometry Dash Lite', 'Terraria', 'Subway Surfers: San Francisco',
        'Friday Night Funkin\'', 'Plants Vs. Zombies 2', 'Happy Wheels', 'Stumble Guys',
        '1v1LOL', 'BuildNow GG', 'Undertale', 'Deltarune', 'Cuphead', 'Hollow Knight',
        'Cookie Clicker', 'Flappy Bird', 'Five Nights at Freddy\'s 2', 'Buckshot Roulette',
        'Baldi\'s Basics', 'Slime Rancher', 'Crossy Road', 'Candy Crush', '2048',
        'Bad Piggies', 'Tomb of the Mask', 'Doki Doki Literature Club', 'ULTRAKILL',
        'Celeste', 'Binding of Isaac: Wrath of the Lamb', 'OMORI',
        'R.E.P.O', 'Blockblast', 'Hotline Miami', 'Fallout', 'GTA', 'DOOM Hacx',
        '2DOOM', 'Granny', 'Bendy and the Ink Machine', 'Balatro', 'Backrooms',
        'Banjo Kazooie', 'Kingdom Hearts: Chain of Memories', 'Castlevania: Dawn of Sorrow',
        'Golden Eye 007', 'Gran Turismo', 'F-ZERO X', 'Command & Conquer', 'Contra 3',
        'Ultimate Flash Sonic', 'Cat Mario', 'Fire Boy and Water Girl', 'Impossible Quiz',
        'Impossible Quiz 2', 'Fancy Pants Adventure', 'Earn to Die', 'Earn to Die 2',
        'Basketball Stars', 'Basketball Legends', '8 Ball Pool', 'Backyard Baseball',
        'Bad Time Simulator', 'Crazy Cattle 3D', 'Steal A Brainrot', 'That\'s Not My Neighbor',
        'A Dance of Fire and Ice', 'osu! (Web)', 'Melon Playground', 'Going Balls',
        'Attack Hole', 'Count Masters', 'Eggy Car', 'Home Sheep Home', 'Interactive Buddy',
        'Gun Mayhem', 'Gun Mayhem 2', 'Gun Mayhem REDUX', 'Awesome Tanks', 'Awesome Tanks 2',
        'Cover Orange', 'Factory Balls', 'Riddle School 5', 'Cactus McCoy', 'Cactus McCoy 2',
        'Epic Battle Fantasy 5', 'Fancy Pants Adventure 2', 'Fancy Pants Adventure 3',
        'Achievement Unlocked', 'Achievement Unlocked 2', 'Achievement Unlocked 3',
        'Jetpack Joyride', 'Kirby Super Star', 'Kirby 64: The Crystal Shards',
        'LEGO Star Wars: The Complete Saga', 'Ice Climber', 'Killer Instinct',
        'Mario & Luigi: Bowser\'s Inside Story', 'Kingdom Hearts 358/2 Days',
        'Pokémon Inclement Emerald', 'Jelly Drift'
    ].map(title => title.toLowerCase());
    const headlineRank = new Map(headlineGames.map((title, index) => [title, index]));
    const franchiseRanks = [
        ['fnf', 180], ['five nights', 200], ['baldi', 220], ['geometry dash', 230],
        ['backrooms', 240], ['sonic', 250], ['pokemon', 255], ['mario', 260],
        ['kingdom hearts', 265], ['kirby', 268], ['final fantasy', 270], ['lego', 275],
        ['ace combat', 280], ['banjo', 290], ['backyard', 300], ['basket', 310],
        ['cover orange', 320], ['clear vision', 330], ['factory balls', 340],
        ['feed us', 350], ['hobo', 360], ['gun mayhem', 370], ['awesome tanks', 380],
        ['fancy pants', 390], ['earn to die', 400], ['earth taken', 410],
        ['effing', 420], ['endless war', 430], ['floodrunner', 440], ['3 pandas', 450],
        ['achievement unlocked', 460], ['cactus mccoy', 470], ['basketball', 480],
        ['football', 490], ['baseball', 500], ['soccer', 510], ['8 ball', 520],
        ['cover orange', 530], ['into space', 540]
    ];

    function popularityScore(title, originalIndex) {
        const normalized = title.toLowerCase();
        const exact = headlineRank.get(normalized);
        if (exact !== undefined) return exact;
        const franchise = franchiseRanks.find(([phrase]) => normalized.includes(phrase));
        if (franchise) return franchise[1] + originalIndex / 1000;
        // Remaining titles still receive a stable score instead of being ignored.
        return 1000 + originalIndex;
    }

    const games = Array.from(allGamesContainer.querySelectorAll(':scope > .game-launcher'));
    games
        .map((game, originalIndex) => ({
            game,
            originalIndex,
            popularity: popularityScore(getGameTitleFromLauncher(game), originalIndex)
        }))
        .sort((a, b) => a.popularity - b.popularity || a.originalIndex - b.originalIndex)
        .forEach(({ game }) => allGamesContainer.appendChild(game));
    // Keep the imported CDN library together immediately after Backrooms.
    const backrooms = allGamesContainer.querySelector('[data-url="clbackrooms.html"]');
    if (backrooms) {
        backrooms.after(...allGamesContainer.querySelectorAll('[data-source="tglsc"]'));
    }
}
// Retain all game records for search; none are displayed as browsing cards.
const visibleGameFiles = new Set();
document.querySelectorAll('.game-launcher[data-url]').forEach(launcher => {
    launcher.classList.toggle('search-only', !visibleGameFiles.has(launcher.dataset.url));
});
const dockSearchOverlay = document.getElementById('dock-search-overlay');
const dockSearchInput = document.getElementById('dock-search-input');
const dockSearchResults = document.getElementById('dock-search-results');

function updateDockSearch() {
    const query = dockSearchInput.value.trim().toLowerCase();
    dockSearchResults.replaceChildren();
    if (!query) { dockSearchResults.style.display = 'none'; return; }

    const matches = Array.from(document.querySelectorAll('.game-launcher[data-url]:not([data-clone="true"])'))
        .map(launcher => ({ launcher, title: getGameTitleFromLauncher(launcher) }))
        .filter(game => game.title && game.title.toLowerCase().includes(query))
        .sort((a, b) => a.title.localeCompare(b.title))
        .slice(0, 10);

    matches.forEach(game => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'search-suggestion-item';
        button.textContent = game.title;
        button.addEventListener('click', () => {
            dockSearchOverlay.hidden = true;
            dockSearchResults.style.display = 'none';
            game.launcher.click();
        });
        dockSearchResults.appendChild(button);
    });
    dockSearchResults.style.display = matches.length ? 'block' : 'none';
}

document.querySelectorAll('.dock-search').forEach(button => {
    button.addEventListener('click', event => {
        event.preventDefault();
        if (window.parent !== window) {
            window.parent.postMessage({ type: 'kermit-search' }, parentMessageOrigin);
            dockSearchOverlay.hidden = true;
            return;
        }
        dockSearchOverlay.hidden = !dockSearchOverlay.hidden;
        if (!dockSearchOverlay.hidden) dockSearchInput.focus();
    });
});
dockSearchInput?.addEventListener('input', updateDockSearch);
dockSearchOverlay?.querySelector('.search-backdrop')?.addEventListener('click', () => {
    dockSearchOverlay.hidden = true;
    dockSearchResults.style.display = 'none';
});
document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !dockSearchOverlay.hidden) {
        dockSearchOverlay.hidden = true;
        dockSearchResults.style.display = 'none';
    }
});

const requestedGame = new URLSearchParams(location.search).get('launch');
if (requestedGame) {
    requestAnimationFrame(() => {
        const launcher = Array.from(document.querySelectorAll('.game-launcher[data-url]'))
            .find(item => item.dataset.url === requestedGame);
        launcher?.click();
    });
}

// Duplicate items for infinite scroll
const originalItems = Array.from(gamesContainer.children);
originalItems.forEach(item => {
    const clone = item.cloneNode(true);
    clone.dataset.clone = "true"; // mark this as a cloned item (not original)
    gamesContainer.appendChild(clone);
});

 // Auto Scroll Logic
let autoScrollSpeed = 1; // Pixels per frame

function loop() {
    gamesContainer.scrollLeft += autoScrollSpeed;

    // Seamless reset
    // If we've scrolled past half the width (approx one set of items)
    if (gamesContainer.scrollLeft >= gamesContainer.scrollWidth / 2) {
        gamesContainer.scrollLeft -= gamesContainer.scrollWidth / 2;
    }

    requestAnimationFrame(loop);
}

// Start loop
loop();

// Event Delegation for Game Launchers (handles originals and clones)
gamesContainer.addEventListener('click', handleModernLauncherClick);

if (allGamesContainer) {
    allGamesContainer.addEventListener('click', handleModernLauncherClick);
}

function handleModernLauncherClick(e) {
    const launcher = e.target.closest('.game-launcher');
    if (!launcher || !launcher.dataset.url) return;
    openGamePlayer(launcher);
}

function getLauncherCover(launcher) {
    if (launcher.dataset.lazyCover) return launcher.dataset.lazyCover;
    const image = launcher.querySelector('img')?.getAttribute('src');
    if (image) return `url("${image}")`;
    return launcher.style.getPropertyValue('--card-image').trim();
}

function openGamePlayer(initialLauncher) {
    document.querySelector('.game-player-page')?.remove();
    const page = document.createElement('section');
    page.className = 'game-player-page';
    page.setAttribute('aria-label', 'Game player');
    page.innerHTML = `
        <header class="player-topbar">
            <button class="player-back" type="button" aria-label="Back to games">&#8592;</button>
            <div class="player-brand"><span>K</span><strong>Kermit Web</strong></div>
            <div class="player-top-actions">
                <button class="player-icon-button player-reload" type="button" aria-label="Reload game">&#8635;</button>
                <button class="player-icon-button player-fullscreen" type="button" aria-label="Fullscreen game">&#x26F6;</button>
                <button class="player-icon-button player-download" type="button" aria-label="Download game HTML">
                    <img src="download_24dp_FFFFFF_FILL0_wght400_GRAD0_opsz24.svg" alt="">
                </button>
            </div>
        </header>
        <main class="player-content">
            <div class="player-stage-shell">
                <div class="player-stage">
                    <div class="player-frame-loader" role="status" aria-live="polite">
                        <div class="player-loader-cover"></div>
                        <div class="player-loader-bottom">
                            <strong class="player-loader-title">Game</strong>
                            <p>Opening game…</p>
                            <div class="player-loader-track" role="progressbar" aria-label="Opening game"><div class="player-loader-fill"></div></div>
                            <button class="player-loader-skip" type="button">Show game</button>
                        </div>
                    </div>
                    <iframe class="player-game-frame" title="Game" allow="fullscreen; autoplay; gamepad; clipboard-read; clipboard-write" allowfullscreen></iframe>
                </div>
                <div class="player-info-bar">
                    <div>
                        <h1 class="player-game-title">Game</h1>
                        <p>Play instantly on Kermit Web</p>
                    </div>
                    <div class="player-status"><span></span> Ready to play</div>
                </div>
            </div>
            <section class="player-related-section" aria-labelledby="related-games-title">
                <div class="player-section-heading">
                    <h2 id="related-games-title">More games like this</h2>
                    <button class="player-browse-all" type="button">Browse all games</button>
                </div>
                <div class="player-related-grid"></div>
            </section>
        </main>`;

    const frame = page.querySelector('.player-game-frame');
    const frameLoader = page.querySelector('.player-frame-loader');
    const titleElement = page.querySelector('.player-game-title');
    const relatedGrid = page.querySelector('.player-related-grid');
    let activeLauncher = initialLauncher;
    const stopEmulatorSaves = window.attachEmulatorSaves?.(page, frame, () => ({url:activeLauncher.dataset.url,title:getGameTitleFromLauncher(activeLauncher) || 'Game'}));
    let loadingStarted = 0;
    let revealTimer;
    let finishTimer;
    let fitTimers = [];
    const fitGameToStage = () => {
        if (!page.isConnected) return;
        frame.style.width = '100%';
        frame.style.height = '100%';
        frame.style.transform = '';
        try {
            const doc = frame.contentDocument;
            if (!doc?.body) return;
            const stage = frame.parentElement;
            const width = stage.clientWidth;
            const height = stage.clientHeight;
            if (!width || !height) return;
            const contentWidth = Math.max(width, doc.documentElement.scrollWidth, doc.body.scrollWidth);
            const contentHeight = Math.max(height, doc.documentElement.scrollHeight, doc.body.scrollHeight);
            if (contentWidth > width + 2 || contentHeight > height + 2) {
                const scale = Math.min(width / contentWidth, height / contentHeight);
                frame.style.width = `${contentWidth}px`;
                frame.style.height = `${contentHeight}px`;
                frame.style.transformOrigin = 'top left';
                frame.style.transform = `translate(${(width - contentWidth * scale) / 2}px, ${(height - contentHeight * scale) / 2}px) scale(${scale})`;
            }
        } catch { /* Cross-origin games manage their own internal layout. */ }
    };
    const fitObserver = new ResizeObserver(fitGameToStage);
    fitObserver.observe(frame.parentElement);
    const clearLoaderTimers = () => {
        clearTimeout(revealTimer);
        clearTimeout(finishTimer);
    };
    const finishLoading = () => {
        clearLoaderTimers();
        frameLoader.classList.add('is-ready');
        finishTimer = setTimeout(() => frameLoader.classList.add('is-hidden'), 300);
    };
    page.querySelector('.player-loader-skip').addEventListener('click', finishLoading);

    const closePlayer = () => {
        stopEmulatorSaves?.();
        fitObserver.disconnect();
        fitTimers.forEach(clearTimeout);
        clearLoaderTimers();
        frame.onload = null;
        frame.src = 'about:blank';
        page.classList.add('is-closing');
        document.body.classList.remove('game-player-open');
        window.setTimeout(() => page.remove(), 260);
        document.removeEventListener('keydown', handlePlayerKeydown);
    };

    const handlePlayerKeydown = event => {
        if (event.key === 'Escape') closePlayer();
    };

    const loadLauncher = launcher => {
        fitTimers.forEach(clearTimeout);
        frame.style.width = '100%';
        frame.style.height = '100%';
        frame.style.transform = '';
        activeLauncher = launcher;
        const title = getGameTitleFromLauncher(launcher) || 'Game';
        clearLoaderTimers();
        loadingStarted = performance.now();
        frameLoader.classList.remove('is-hidden', 'is-ready', 'is-slow');
        page.querySelector('.player-loader-title').textContent = title;
        page.querySelector('.player-loader-cover').style.backgroundImage = getLauncherCover(launcher) || 'none';
        revealTimer = setTimeout(() => frameLoader.classList.add('is-slow'), 10000);
        titleElement.textContent = title;
        frame.title = title;
        frame.src = launcher.dataset.url.split(/[?#]/)[0].toLowerCase() === 'balatro.html'
            ? 'balatro.html?v=20261015-save-ready-2' : launcher.dataset.url;
        page.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const allLaunchers = Array.from(document.querySelectorAll(
        '#games-container .game-launcher:not([data-clone="true"]), #all-games-container .game-launcher'
    ));
    const relatedLaunchers = allLaunchers
        .filter(launcher => visibleGameFiles.has(launcher.dataset.url) && launcher.dataset.url !== initialLauncher.dataset.url)
        .slice(0, 8);

    relatedLaunchers.forEach(launcher => {
        const title = getGameTitleFromLauncher(launcher) || 'Game';
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'player-related-card';
        card.setAttribute('aria-label', `Play ${title}`);
        const cover = getLauncherCover(launcher);
        if (cover && !launcher.classList.contains('no-cover')) {
            card.style.backgroundImage = cover;
        } else {
            card.classList.add('no-cover');
        }
        const label = document.createElement('span');
        label.textContent = title;
        card.appendChild(label);
        card.addEventListener('click', () => loadLauncher(launcher));
        relatedGrid.appendChild(card);
    });

    frame.onload = () => {
        fitTimers.forEach(clearTimeout);
        fitTimers = [0, 500, 2000, 5000].map(delay => setTimeout(fitGameToStage, delay));
        clearTimeout(finishTimer);
        finishTimer = setTimeout(finishLoading, Math.max(0, 900 - (performance.now() - loadingStarted)));
    };
    page.querySelector('.player-back').addEventListener('click', closePlayer);
    page.querySelector('.player-browse-all').addEventListener('click', closePlayer);
    page.querySelector('.player-reload').addEventListener('click', () => {
        loadLauncher(activeLauncher);
    });
    page.querySelector('.player-fullscreen').addEventListener('click', () => {
        const stage = page.querySelector('.player-stage');
        if (document.fullscreenElement) {
            document.exitFullscreen?.();
        } else {
            stage.requestFullscreen?.();
        }
    });
    page.querySelector('.player-download').addEventListener('click', () => {
        const url = activeLauncher.dataset.url;
        const title = getGameTitleFromLauncher(activeLauncher) || 'Game';
        const fullUrl = new URL(url, window.location.href).href;
        const safeName = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'game';
        const escapedTitle = title.replace(/[&<>"']/g, character => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[character]);
        const htmlContent = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>${escapedTitle}</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body,iframe{margin:0;width:100%;height:100%;border:0;background:#000}</style></head><body><iframe src="${fullUrl}" allowfullscreen></iframe></body></html>`;
        const blobUrl = URL.createObjectURL(new Blob([htmlContent], { type: 'text/html' }));
        const anchor = document.createElement('a');
        anchor.href = blobUrl;
        anchor.download = `${safeName}.html`;
        anchor.click();
        window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1500);
    });

    document.body.appendChild(page);
    document.body.classList.add('game-player-open');
    document.addEventListener('keydown', handlePlayerKeydown);
    requestAnimationFrame(() => page.classList.add('is-visible'));
    loadLauncher(initialLauncher);
}

function handleLauncherClick(e) {
    const launcher = e.target.closest('.game-launcher');
    if (!launcher) return;

    const url = launcher.dataset.url;
    if (!url) return;

    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.allowFullscreen = true;

    iframe.style.position = 'fixed';
    iframe.style.top = '2%';
    iframe.style.left = '2%';
    iframe.style.width = '96%';
    iframe.style.height = '96%';
    iframe.style.border = 'none';
    iframe.style.zIndex = '1000';
    iframe.style.borderRadius = '12px';
    iframe.style.boxShadow = '0 0 30px rgba(0, 0, 0, 0.7)';
    iframe.style.backgroundColor = '#111827';

    const gameTitle = getGameTitleFromLauncher(launcher) || 'Game';

    // Create close button (X)
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.setAttribute('aria-label', 'Close game');
    closeBtn.style.position = 'fixed';
    closeBtn.style.top = '1.2%';
    closeBtn.style.right = '2.5%';
    closeBtn.style.width = '32px';
    closeBtn.style.height = '32px';
    closeBtn.style.borderRadius = '50%';
    closeBtn.style.border = 'none';
    closeBtn.style.background = 'rgba(10,10,15,0.9)';
    closeBtn.style.color = '#f5f5f5';
    closeBtn.style.fontSize = '18px';
    closeBtn.style.lineHeight = '32px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.zIndex = '1001';
    closeBtn.style.display = 'flex';
    closeBtn.style.alignItems = 'center';
    closeBtn.style.justifyContent = 'center';
    closeBtn.style.boxShadow = '0 0 10px rgba(0,0,0,0.8)';
    closeBtn.style.transition = 'transform 0.15s ease, box-shadow 0.15s ease';

    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.transform = 'scale(1.08) rotate(6deg)';
        closeBtn.style.boxShadow = '0 0 14px rgba(0,0,0,0.95)';
    });

    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.transform = 'scale(1) rotate(0deg)';
        closeBtn.style.boxShadow = '0 0 10px rgba(0,0,0,0.8)';
    });

    closeBtn.addEventListener('mousedown', () => {
        closeBtn.style.transform = 'scale(0.92) rotate(-4deg)';
    });

    closeBtn.addEventListener('mouseup', () => {
        closeBtn.style.transform = 'scale(1.08) rotate(6deg)';
    });

    closeBtn.addEventListener('click', () => {
        iframe.remove();
        closeBtn.remove();
        downloadBtn.remove();
        if (galleryWrapper) {
            galleryWrapper.style.display = '';
        }
        if (allGamesContainer) {
            allGamesContainer.style.display = '';
        }
    });

    // Create download button
    const downloadBtn = document.createElement('button');
    downloadBtn.setAttribute('aria-label', 'Download game HTML');
    downloadBtn.style.position = 'fixed';
    downloadBtn.style.top = '1.2%';
    downloadBtn.style.right = '5.5%';
    downloadBtn.style.width = '32px';
    downloadBtn.style.height = '32px';
    downloadBtn.style.borderRadius = '50%';
    downloadBtn.style.border = 'none';
    downloadBtn.style.background = 'rgba(10,10,15,0.9)';
    downloadBtn.style.cursor = 'pointer';
    downloadBtn.style.zIndex = '1001';
    downloadBtn.style.display = 'flex';
    downloadBtn.style.alignItems = 'center';
    downloadBtn.style.justifyContent = 'center';
    downloadBtn.style.boxShadow = '0 0 10px rgba(0,0,0,0.8)';
    downloadBtn.style.transition = 'transform 0.15s ease, box-shadow 0.15s ease';

    const downloadIcon = document.createElement('img');
    downloadIcon.src = 'download_24dp_FFFFFF_FILL0_wght400_GRAD0_opsz24.svg';
    downloadIcon.alt = 'Download';
    downloadIcon.style.width = '18px';
    downloadIcon.style.height = '18px';
    downloadIcon.style.pointerEvents = 'none';
    downloadBtn.appendChild(downloadIcon);

    downloadBtn.addEventListener('mouseenter', () => {
        downloadBtn.style.transform = 'scale(1.08)';
        downloadBtn.style.boxShadow = '0 0 14px rgba(0,0,0,0.95)';
    });

    downloadBtn.addEventListener('mouseleave', () => {
        downloadBtn.style.transform = 'scale(1)';
        downloadBtn.style.boxShadow = '0 0 10px rgba(0,0,0,0.8)';
    });

    downloadBtn.addEventListener('mousedown', () => {
        downloadBtn.style.transform = 'scale(0.92)';
    });

    downloadBtn.addEventListener('mouseup', () => {
        downloadBtn.style.transform = 'scale(1.08)';
    });

    downloadBtn.addEventListener('click', () => {
        const fullUrl = new URL(url, window.location.href).href;
        const safeName = gameTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'game';
        const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${gameTitle}</title>
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<style>
html,body{margin:0;height:100%;background:#000;}
iframe{border:0;width:100%;height:100%;}
</style>
</head>
<body>
<iframe src="${fullUrl}" allowfullscreen></iframe>
</body>
</html>`;
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `${safeName || 'game'}.html`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            URL.revokeObjectURL(blobUrl);
            a.remove();
        }, 1500);
    });

    document.body.appendChild(iframe);
    document.body.appendChild(closeBtn);
    document.body.appendChild(downloadBtn);

    if (galleryWrapper) {
        galleryWrapper.style.display = 'none';
    }
    if (allGamesContainer) {
        allGamesContainer.style.display = 'none';
    }
}

 // Hover tooltip for game names
const gameTooltip = document.createElement('div');
gameTooltip.id = 'game-tooltip';
gameTooltip.style.display = 'none';
document.body.appendChild(gameTooltip);

function positionTooltip(e) {
    const offsetX = 14; // to the right of cursor
    const offsetY = -10; // slightly above cursor
    let x = e.clientX + offsetX;
    let y = e.clientY + offsetY;

    const tooltipRect = gameTooltip.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (x + tooltipRect.width > vw) {
        x = vw - tooltipRect.width - 8;
    }
    if (y < 0) {
        y = 0;
    } else if (y + tooltipRect.height > vh) {
        y = vh - tooltipRect.height - 8;
    }

    gameTooltip.style.left = x + 'px';
    gameTooltip.style.top = y + 'px';
}

function getGameTitleFromLauncher(launcher) {
    if (!launcher) return '';

    const overlayTitle = launcher.querySelector('.game-title');
    if (overlayTitle && overlayTitle.textContent.trim()) {
        return overlayTitle.textContent.trim();
    }

    const coverLabel = launcher.querySelector('.cover-label');
    if (coverLabel && coverLabel.textContent.trim()) {
        return coverLabel.textContent.trim();
    }

    return '';
}

function showGameTooltip(e, launcher) {
    const titleText = getGameTitleFromLauncher(launcher);
    if (!titleText) return;

    gameTooltip.textContent = titleText;
    gameTooltip.style.display = 'block';
    positionTooltip(e);
}

function hideGameTooltip() {
    gameTooltip.style.display = 'none';
}

function handleLauncherHover(event) {
    const type = event.type;
    const launcher = event.target.closest('.game-launcher');
    if (!launcher) return;

    if (type === 'mouseover') {
        showGameTooltip(event, launcher);
    } else if (type === 'mouseout') {
        if (!event.relatedTarget || !launcher.contains(event.relatedTarget)) {
            hideGameTooltip();
        }
    }
}

document.addEventListener('mousemove', (e) => {
    if (gameTooltip.style.display === 'block') {
        positionTooltip(e);
    }
});

if (gamesContainer) {
    gamesContainer.addEventListener('mouseover', handleLauncherHover);
    gamesContainer.addEventListener('mouseout', handleLauncherHover);
}
if (allGamesContainer) {
    allGamesContainer.addEventListener('mouseover', handleLauncherHover);
    allGamesContainer.addEventListener('mouseout', handleLauncherHover);
}

const gameMetaEl = document.getElementById('game-meta');

function initGameMeta() {
    if (!gameMetaEl) return;

    const uniqueLaunchers = Array.from(document.querySelectorAll('#games-container .game-launcher:not([data-clone="true"]), #all-games-container .game-launcher'));
    const gameCount = uniqueLaunchers.length;

    function updateTime() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        gameMetaEl.textContent = `${gameCount} games • ${timeStr}`;
    }

    updateTime();
    setInterval(updateTime, 1000);
}

initGameMeta();

// Search bar + suggestions logic
if (searchInput && suggestionsContainer) {
    const searchableLaunchers = Array.from(document.querySelectorAll('.game-launcher:not([data-clone="true"])'));

    function updateSuggestions(query) {
        const q = query.trim().toLowerCase();
        suggestionsContainer.innerHTML = '';

        if (!q) {
            suggestionsContainer.style.display = 'none';
            // Reset visibility of all launchers when query cleared
            searchableLaunchers.forEach(l => {
                l.style.display = '';
            });
            return;
        }

        const matches = searchableLaunchers
            .map(launcher => ({
                launcher,
                title: getGameTitleFromLauncher(launcher)
            }))
            .filter(item => item.title && item.title.toLowerCase().includes(q))
            .sort((a, b) => a.title.localeCompare(b.title, 'en', { sensitivity: 'base' }))
            .slice(0, 6);

        searchableLaunchers.forEach(launcher => {
            launcher.style.display = getGameTitleFromLauncher(launcher).toLowerCase().includes(q) ? '' : 'none';
        });

        if (matches.length === 0) {
            suggestionsContainer.style.display = 'none';
            return;
        }

        matches.forEach(({ launcher, title }) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'search-suggestion-item';
            btn.textContent = title;
            btn.addEventListener('click', () => {
                suggestionsContainer.style.display = 'none';
                searchInput.blur();
                // Launch the game
                launcher.click();
            });
            suggestionsContainer.appendChild(btn);
        });

        suggestionsContainer.style.display = 'block';
    }

    searchInput.addEventListener('input', (e) => {
        updateSuggestions(e.target.value);
    });

    // Hide suggestions shortly after blur (allows click)
    searchInput.addEventListener('blur', () => {
        setTimeout(() => {
            suggestionsContainer.style.display = 'none';
        }, 150);
    });

    // Keep suggestions open when interacting with them
    suggestionsContainer.addEventListener('mousedown', (e) => {
        e.preventDefault();
    });
}

// Start the optional particle layer only when its canvas exists.
if (canvas) {
    resize();
    animate();
}

// Keep the loading screen up just long enough to cover the initial grid setup,
// then fade it away. The fallback ensures it can never trap the user.
const gamesLoadingScreen = document.getElementById('games-page-loader');
// Grid interaction is ready independently of image and media downloads.
const reportCatalogReady = () => {
    if (window.parent === window) return;
    document.querySelectorAll('.dock, .page-dock').forEach(dock => { dock.style.display = 'none'; });
    window.parent.postMessage({type:'kermit-games-ready'}, location.origin);
};
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', reportCatalogReady, {once:true});
else reportCatalogReady();
if (gamesLoadingScreen) {
    let loadingScreenDismissed = false;
    const dismissGamesLoadingScreen = () => {
        if (loadingScreenDismissed) return;
        loadingScreenDismissed = true;
        gamesLoadingScreen.hidden = true;
        window.setTimeout(() => gamesLoadingScreen.remove(), 700);
    };

    requestAnimationFrame(() => {
        requestAnimationFrame(() => window.setTimeout(dismissGamesLoadingScreen, 450));
    });
    window.setTimeout(dismissGamesLoadingScreen, 3000);
}
