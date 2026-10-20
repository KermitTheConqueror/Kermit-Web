// Catalog snapshot from https://glseries.net/api/cdn, 2026-10-18.
// Games and artwork remain hosted by TGLSC; existing local entries take priority.
(() => {
  const rows = `The Final Earth 2
Tuner Racer
Top Driver
Top Driver 2
Block Tech: Epic Sandbox|block-tech
PolyTrack V0.6.2|0.6.2|polytrack
Indian Truck Driving
Slope|slopenew|slope
Ultimate Car Driving Simulator
Sky Riders
Optric
Granny Prison Escape
Granny Forest Escape
Granny's Classroom Nightmare|granny-classroom-nightmare
Shoot Granny
Granny
Granny 2
Granny 3
Granny 4
Crazy Bikes!
Crazy Cars!
Zombie Derby: Pixel Survival
SpookyTrack
Block Blast
YoHoHo.io
Funny Shooter 2
Ducklings.io
Idle Ants
Raft Survival
Grand Vegas Simulator
Sniper Shot: Bullet Time
House Of Hazards
House Painter
Sling Drift
Blacktop: Police Chase
Subway Surfers
Drive Mad
Skyblock 3D: Survival|skyblock-3d
Drag Racer V3
Rogue Within
Crossing The Pit
Breaking The Bank
Crazy Cattle 3D|crazy-cattle
Monster Tracks
Hide And Seek Pro
Revolution Idle X
Traffic Tour
Stunt Car Challenge 3
Drag Racing Rivals
Gladihoppers
Rise Higher
Bad Piggies
Burnout Drift Hilltop
Drift Boss
Drift Hunters
Drift Hunters Pro
Cubefield
Cluster Rush
Happy Wheels
Getaway Shootout
Pako Highway
Cat Brick Breaker|cat-brick
GunNight.io
Heist.io
BitLife
Skibidi 1v100
Death Run 3D
Rocket Soccer Derby
Tunnel Rush
Choppy Orc
Astro Survivors
Roper
Tomb Of The Mask
Big Tower Tiny Square
FNAF 3|fnaf3
Swingo
Run 3
Frying Nemo
Neon Swing
Dune!
Sketchbook
Free Rider Jumps
Fear Response
4x4 Offroad|4x4
Merge Round Racers
Ragdoll Archers
Grow A Garden Single Player|gag2|growagarden-single
Rallypoint
Nova Craft|novacraft
Burrito Bison
Wobbly Boxing
Bee Swarm Simulator
Retro Garage
CarX Drift
Drive Zone
RaceMax
Cool Cars Highway
Crazy City Racing
Dream Car
Among Rescue
Pixel Speedrun
Traffic Racer|traffic-racer-release2|traffic-racer
Super Crew
BLOODMONEY!
Mello
Scary Teacher 3D
Midnight Drive
Snow Plow
Harvest Simulator
xx142-b2.exe|xx142-b2.exe
Tanuki Sunset
Yandere Simulator
Baldi's Basics|baldis-basics
Bodycam
Drift Zero
DriveOff
Escape Road
Escape Road 2
Escape Road 3
Horror Tale
Horror Tale 2: Samantha|horror-tale-2
Horror Tale 3: The Witch|horror-tale-3
Merge & Construct|merge-construct
Snow Rider 3D
Feral Frontier
Bridge Constructor
Criminalz
Decks of Dexterity
Alternate World
Havendock
4WD Only Up!
Will it Crush?
Grid Architect: GPU Tycoon|grid-architect
The Long Drive
Boxes & Mechanisms|boxes-and-mechanisms
Kiosk
Raftopia
Sky Balance
Find The Pets
Racing Limits
Tiny Towers
Fullspeed Racing
Townscaper
WebGL Fluid
WebGL Water
Little Alchemy
Little Alchemy 2
Aviasali
Space Waves
Spy Highway
Fly for Fly
Kick The Buddy
Punch The Trump
Plants vs. Zombies
Deal Or No Deal
Five Nights at Epstein's|fnae
The Visitor
The Visitor: Massacre
Engine Roar
Go To Bed
Farm Simulator: Evo
Coach Bus Simulator
Plague Inc
My Water Park
Drag Sim 2018
Driving School 2016
Speed Legends
Bills Must Be Paid
Glowets
Deadly Descent
Basketball Stars
Drag Racer
Speed Racing Pro 3
Madalin Stunt Cars 2
Madalin Stunt Cars 3
Banana Poker
Brotato
Stickman Rebirth
Labubu Cart Ride
Fortress Merge
Bus Simulator: EVO
Talking Tom Gold Run
Jetpack Joyride
Big Bubbles
Extreme Car Driving Simulator
Infinity Loop
Stealth Master
Bee Factory Lite
Prison Escape 2
Geometry Dash|2.2-gd|geometry-dash
Robo Cleaner Simulator
Power Wash Cleanup
Among Us
How To Fish`.split('\n');
  const container = document.querySelector('#all-games-container');
  if (!container) return;
  const normalize = s => s.toLowerCase().replace(/five nights at freddy'?s/g,'fnaf').replace(/\bv?\d+\.\d+(?:\.\d+)?\b/g,'').replace(/[^a-z0-9]/g,'');
  const existing = new Set(Array.from(container.querySelectorAll('.cover-label'), e => normalize(e.textContent)));
  const skipped = [];
  const revealCover = card => {
    card.style.setProperty('--card-image', card.dataset.lazyCover);
  };
  const coverObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      revealCover(entry.target);
      coverObserver.unobserve(entry.target);
    }
  }, {rootMargin:'300px 0px'}) : null;
  let added = 0;
  for (const row of rows) {
    const [title, customSlug, customImage] = row.split('|');
    if (existing.has(normalize(title))) { skipped.push(title); continue; }
    const slug = customSlug || title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
    const url = `https://glseries.net/assets/applications/content/${slug}/`;
    const card = document.createElement('div');
    card.className = 'game-launcher cover-only';
    card.dataset.url = url;
    card.dataset.source = 'tglsc';
    card.setAttribute('aria-label',`Play ${title}`);
    card.setAttribute('role','button');
    card.tabIndex = 0;
    card.dataset.lazyCover = `url("https://glseries.net/assets/data/bundles/li.ico/${customImage || slug}.png")`;
    card.style.setProperty('--card-image','none');
    const label = document.createElement('div');
    label.className = 'cover-label'; label.textContent = title;
    card.append(label); container.append(card);
    if (coverObserver) coverObserver.observe(card);
    else revealCover(card);
    existing.add(normalize(title)); added++;
  }
  window.KERMIT_TGLSC_IMPORT = {total:rows.length, added, skipped};
})();
