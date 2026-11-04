// Curated browser games from Ultimate Game Stash. Existing titles take priority.
(() => {
 const games=[["cldrivemady.html","Drive Mad"],["cldriftboss.html","Drift Boss"],["cldrifthuntersmerge.html","Drift Hunters"],["clescaperoad.html","Escape Road"],["clcrazycars.html","Crazy Cars"],["clcrazymotorcycle.html","Crazy Motorcycle"],["clcrazyplanelanding.html","Crazy Plane Landing"],["clblazedrifter.html","Blaze Drifter"],["clblumgiracers.html","Blumgi Racers"],["clbouncymotors.html","Bouncy Motors"],["clblockydemolitionderby.html","Blocky Demolition Derby"],["clcardrawing.html","Car Drawing"],["clcarkingarena.html","Car King Arena"],["clcarrampvspolicechase.html","Car Ramp Vs Police Chase"],["cldeadlydescent.html","Deadly Descent"],["cldemolitionderbycrashracing.html","Demolition Derby Crash Racing"],["cleggycar.html","Eggy Car"],["clhighwayracer2.html","Highway Racer"],["clhoverracerdrive.html","Hover Racer Drive"],["cl234playergame.html","2-3-4 Player Games"],["clarcheryworldtour.html","Archery World Tour"],["clarcadevolley.html","Arcade Volley"],["clasmallworldcup.html","A Small World Cup"],["clbaseballbros.html","Baseball Bros"],["clbouncybasketball.html","Bouncy Basketball"],["clboxingrandom.html","Boxing Random"],["clfootballbros.html","Football Bros"],["clfootballlegends.html","Football Legends"],["clgetawayshootout.html","Getaway Shootout"],["clgetontop.html","Get On Top"],["clgolfbattle.html","Golf Battle"],["clhouseofhazards.html","House of Hazards"],["cl10minutestildawn.html","10 Minutes Till Dawn"],["clbaconmaydie.html","Bacon May Die"],["clballblast.html","Ball Blast"],["clbearsus.html","Bearsus"],["clbitplanes.html","Bit Planes"],["clblockpost.html","Blockpost"],["clbouncemasters.html","Bouncemasters"],["clburritobisonlaunchalibre.html","Burrito Bison Launcha Libre"],["clcannonballs3d.html","Cannon Balls 3D"],["clcastlewarsmodern.html","Castle Wars Modern"],["clcheesechompers3d.html","Cheese Chompers 3D"],["clgladdihoppers.html","Gladihoppers"],["clgun-spin.html","Gun Spin"],["clfortzone.html","Fortzone Battle Royale"],["clbigflappytowertinysquare.html","Big Flappy Tower Tiny Square"],["clbigicetowertinysquare.html","Big Ice Tower Tiny Square"],["clbigneontowertinysquare.html","Big Neon Tower Tiny Square"],["clbtts.html","Big Tower Tiny Square"],["clbtts2.html","Big Tower Tiny Square 2"],["clblumgirocket.html","Blumgi Rocket"],["clcatslovecake2.html","Cats Love Cake 2"],["clchoppyorc.html","Choppy Orc"],["clclusterrush.html","Cluster Rush"],["clcrossyroad.html","Crossy Road"],["cldadish.html","Dadish"],["cldeepestsword.html","Deepest Sword"],["cldoodlejumpgoober.html","Doodle Jump"],["cldreadheadparkour.html","Dreadhead Parkour"],["cleugeneslife.html","Eugene’s Life"],["clfireblob.html","Fireblob"],["clgeometryvibes.html","Geometry Vibes"],["clhelixjump.html","Helix Jump"],["cl20smallmazes.html","20 Small Mazes"],["clantarttycoon.html","Ant Art Tycoon"],["clbabeltower.html","Babel Tower"],["clblockthepig.html","Block the Pig"],["clbobtherobber2.html","Bob the Robber 2"],["clbobtherobber5.html","Bob the Robber 5"],["clcapybaraclicker.html","Capybara Clicker"],["clcellmachine.html","Cell Machine"],["clchessclassic.html","Chess Classic"],["clCircloO2.html","CircloO 2"],["clcookieclicker.html","Cookie Clicker"],["clcuttherope.html","Cut the Rope"],["cldogeminer2.html","Doge Miner 2"],["clfinalearth2.html","Final Earth 2"],["clgrowmi.html","Growmi"]];
 games.push(['sms.html','Super Mario Sunshine'],['castle.html','Castle Crashers']);
 games.push(['pokerogue.html','PokeRogue']);
 games.push(['md.html','Meowdoku']);
 // Publisher embeds for the titles in KermitTheConqueror/Crazy-Games.
 const publisherGames=[
  ["8-ball-pool-billiards-multiplayer","8 Ball Pool: Billiards Multiplayer"],
  ["bloxity-io","Bloxity.io"],
  ["bodycamera-shooter","BodyCamera Shooter"],
  ["chicken-strike-hfm","Chicken Strike"],
  ["gun-maker","Gun Maker"],
  ["hazmob-fps-online-shooter","Hazmob FPS: Online Shooter"],
  ["hexanaut-io","Hexanaut.io"],
  ["leek-factory-tycoon","Leek Factory Tycoon"],
  ["the-machinegg","MachinEGG"],
  ["mine-shooter-2-noob-vs-mobs","Mine Shooter 2: Noob vs Mobs"],
  ["mini-golf-club","Mini Golf Club"],
  ["real-war-not-fake-sno","Real War Not Fake"],
  ["sky-riders-buk","Sky Riders"],
  ["smash-karts","Smash Karts"],
  ["space-waves","Space Waves"],
  ["streamer-rise","Streamer Rise"],
  ["veck-io","Veck.io"],
  ["bloxdhop-io","Bloxd.io"],
  ["clean-slate-pnn","Clean Slate"],
  ["piece-of-cake-merge-and-bake","Piece of Cake: Merge and Bake"],
  ["ragdoll-archers","Ragdoll Archers"],
  ["shellshockersio","Shell Shockers"],
  ["time-shooter","Time Shooter"],
 ];
 const publisherOnly=new Set(['gun-maker','bloxity-io','chicken-strike-hfm','the-machinegg','hazmob-fps-online-shooter','mine-shooter-2-noob-vs-mobs','real-war-not-fake-sno','veck-io','streamer-rise','clean-slate-pnn']);
 for(const [slug,title] of publisherGames)games.push(['https://www.crazygames.com/'+(publisherOnly.has(slug)?'game/':'embed/')+slug,title]);
 const container=document.querySelector('#all-games-container');if(!container)return;
 const normalize=s=>s.toLowerCase().replace(/[^a-z0-9]/g,'');
 const existing=new Set([...container.querySelectorAll('.cover-label')].map(e=>normalize(e.textContent)));
 for(const [file,title] of games){
  if(file === 'clbaseballbros.html') continue;
  if(existing.has(normalize(title)))continue;
  const card=document.createElement('div');card.className='game-launcher cover-only';
  card.dataset.url=file.startsWith('https://www.crazygames.com/')?file:'browser-games/'+file;card.dataset.source='curated-browser';
  card.setAttribute('aria-label','Play '+title);card.setAttribute('role','button');card.tabIndex=0;
  let hash=0;for(const c of title)hash=(hash*31+c.charCodeAt(0))>>>0;
  const hue=hash%360;
  card.style.setProperty('--card-image',`linear-gradient(145deg,hsl(${hue} 65% 37%),hsl(${(hue+45)%360} 60% 13%))`);
  const monogram=document.createElement('span');monogram.textContent=title.split(/\s+/).slice(0,2).map(s=>s[0]).join('');
  monogram.style.cssText='position:absolute;inset:12% 0 auto;text-align:center;font-size:clamp(36px,5vw,70px);font-weight:900;color:#ffffff55;pointer-events:none;z-index:1';
  const label=document.createElement('div');label.className='cover-label';label.textContent=title;
  card.append(monogram,label);container.append(card);existing.add(normalize(title));
  if(file.startsWith('https://www.crazygames.com/game/')){
   card.title='Open '+title+' on CrazyGames in a new tab';
   card.setAttribute('aria-label',card.title);
   label.append(document.createTextNode(' ↗'));
  }
 }
 const uploadedCovers={"clcookieclicker.html":"game-covers/cookieclicker-uploaded.webp","clcrossyroad.html":"game-covers/crossyroad-uploaded.jpg","cleggycar.html":"game-covers/eggycar-uploaded.jpg","clbouncybasketball.html":"game-covers/bouncybasketball-uploaded.jpg","clfootballbros.html":"game-covers/footballbros-uploaded.jpg","clfootballlegends.html":"game-covers/footballlegends-uploaded.jpg","clbasketbros.html":"game-covers/basketbros-uploaded.jpg","cldrivemady.html":"game-covers/drivemady-uploaded.jpg","cldriftboss.html":"game-covers/driftboss-uploaded.jpg","cldrifthuntersmerge.html":"game-covers/drifthuntersmerge-uploaded.jpg","clescaperoad.html":"game-covers/escaperoad-uploaded.jpg","clcrazycars.html":"game-covers/crazycars-uploaded.jpg","clcrazymotorcycle.html":"game-covers/crazymotorcycle-uploaded.jpg","clcrazyplanelanding.html":"game-covers/crazyplanelanding-uploaded.jpg","clblazedrifter.html":"game-covers/blazedrifter-uploaded.jpg","clblumgiracers.html":"game-covers/blumgiracers-uploaded.jpg","clbouncymotors.html":"game-covers/bouncymotors-uploaded.png","clblockydemolitionderby.html":"game-covers/blockydemolitionderby-uploaded.jpg","clcardrawing.html":"game-covers/cardrawing-uploaded.png","clcarkingarena.html":"game-covers/carkingarena-uploaded.jpg","clcarrampvspolicechase.html":"game-covers/carrampvspolicechase-uploaded.jpg","cldeadlydescent.html":"game-covers/deadlydescent-uploaded.jpg","cldemolitionderbycrashracing.html":"game-covers/demolitionderbycrashracing-uploaded.jpg","clhighwayracer2.html":"game-covers/highwayracer2-uploaded.jpg","clhoverracerdrive.html":"game-covers/hoverracerdrive-uploaded.jpg","cl234playergame.html":"game-covers/234playergame-uploaded.png"};
 Object.assign(uploadedCovers, {"clarcheryworldtour.html":"game-covers/archeryworldtour-uploaded.jpg","clarcadevolley.html":"game-covers/arcadevolley-uploaded.jpg","clasmallworldcup.html":"game-covers/asmallworldcup-uploaded.jpg","clboxingrandom.html":"game-covers/boxingrandom-uploaded.jpg","clgetawayshootout.html":"game-covers/getawayshootout-uploaded.jpg","clgetontop.html":"game-covers/getontop-uploaded.jpg","clgolfbattle.html":"game-covers/golfbattle-uploaded.jpg","clhouseofhazards.html":"game-covers/houseofhazards-uploaded.jpg","cl10minutestildawn.html":"game-covers/10minutestildawn-uploaded.webp","clbaconmaydie.html":"game-covers/baconmaydie-uploaded.jpg","clballblast.html":"game-covers/ballblast-uploaded.jpg","clbearsus.html":"game-covers/bearsus-uploaded.jpg","clbitplanes.html":"game-covers/bitplanes-uploaded.jpg","clblockpost.html":"game-covers/blockpost-uploaded.jpg","clbouncemasters.html":"game-covers/bouncemasters-uploaded.jpg","clburritobisonlaunchalibre.html":"game-covers/burritobisonlaunchalibre-uploaded.jpg","clcannonballs3d.html":"game-covers/cannonballs3d-uploaded.jpg","clcastlewarsmodern.html":"game-covers/castlewarsmodern-uploaded.jpg","clcheesechompers3d.html":"game-covers/cheesechompers3d-uploaded.jpg","clgladdihoppers.html":"game-covers/gladdihoppers-uploaded.jpg","clgun-spin.html":"game-covers/gun-spin-uploaded.jpg","clfortzone.html":"game-covers/fortzone-uploaded.jpg","clbigflappytowertinysquare.html":"game-covers/bigflappytowertinysquare-uploaded.jpg"});
 Object.assign(uploadedCovers, {"clbigicetowertinysquare.html":"game-covers/bigicetowertinysquare-uploaded.png","clbigneontowertinysquare.html":"game-covers/bigneontowertinysquare-uploaded.jpg","clbtts.html":"game-covers/btts-uploaded.jpg","clbtts2.html":"game-covers/btts2-uploaded.jpg","clblumgirocket.html":"game-covers/blumgirocket-uploaded.jpg","clcatslovecake2.html":"game-covers/catslovecake2-uploaded.jpg","clchoppyorc.html":"game-covers/choppyorc-uploaded.png","clclusterrush.html":"game-covers/clusterrush-uploaded.jpg","cldadish.html":"game-covers/dadish-uploaded.jpg","cldoodlejumpgoober.html":"game-covers/doodlejumpgoober-uploaded.png","cldreadheadparkour.html":"game-covers/dreadheadparkour-uploaded.jpg","cleugeneslife.html":"game-covers/eugeneslife-uploaded.jpg","clfireblob.html":"game-covers/fireblob-uploaded.jpg","clgeometryvibes.html":"game-covers/geometryvibes-uploaded.jpg","clhelixjump.html":"game-covers/helixjump-uploaded.jpg","cl20smallmazes.html":"game-covers/20smallmazes-uploaded.jpg","clantarttycoon.html":"game-covers/antarttycoon-uploaded.jpg","clbabeltower.html":"game-covers/babeltower-uploaded.jpg","clblockthepig.html":"game-covers/blockthepig-uploaded.jpg","clbobtherobber2.html":"game-covers/bobtherobber2-uploaded.jpg","clbobtherobber5.html":"game-covers/bobtherobber5-uploaded.jpg","clcapybaraclicker.html":"game-covers/capybaraclicker-uploaded.jpg","clcellmachine.html":"game-covers/cellmachine-uploaded.jpg","clchessclassic.html":"game-covers/chessclassic-uploaded.jpg","clCircloO2.html":"game-covers/CircloO2-uploaded.png","clcuttherope.html":"game-covers/cuttherope-uploaded.jpg","clfinalearth2.html":"game-covers/finalearth2-uploaded.jpg","clgrowmi.html":"game-covers/growmi-uploaded.jpg"});
 Object.assign(uploadedCovers, {"cldeepestsword.html":"game-covers/deepestsword-uploaded.png","cldogeminer2.html":"game-covers/dogeminer2-uploaded.jpg"});
 Object.assign(uploadedCovers, {'sms.html':'game-covers/super-mario-sunshine-uploaded.webp','castle.html':'game-covers/castle-crashers-uploaded.jpg'});
 Object.assign(uploadedCovers, {'pokerogue.html':'game-covers/pokerogue-uploaded.png'});
 Object.assign(uploadedCovers, {'md.html':'game-covers/meowdoku-uploaded.jpg'});
 // Publisher cards use the same slug for embedded and external launches.
 Object.assign(uploadedCovers,{
  'bloxity-io':'game-covers/crazy-games/bloxity-io.jpg',
  '8-ball-pool-billiards-multiplayer':'game-covers/crazy-games/8-ball-pool-billiards-multiplayer.png',
  'bodycamera-shooter':'game-covers/crazy-games/bodycamera-shooter.webp',
  'chicken-strike-hfm':'game-covers/crazy-games/chicken-strike-hfm.png',
  'gun-maker':'game-covers/crazy-games/gun-maker.png',
  'hexanaut-io':'game-covers/crazy-games/hexanaut-io.png',
  'leek-factory-tycoon':'game-covers/crazy-games/leek-factory-tycoon.png',
  'the-machinegg':'game-covers/crazy-games/the-machinegg.png',
  'mine-shooter-2-noob-vs-mobs':'game-covers/crazy-games/mine-shooter-2-noob-vs-mobs.png',
  'mini-golf-club':'game-covers/crazy-games/mini-golf-club.png',
  'real-war-not-fake-sno':'game-covers/crazy-games/real-war-not-fake-sno.png',
  'sky-riders-buk':'game-covers/crazy-games/sky-riders-buk.jpg',
  'smash-karts':'game-covers/crazy-games/smash-karts.png',
  'space-waves':'game-covers/crazy-games/space-waves.png',
  'streamer-rise':'game-covers/crazy-games/streamer-rise.png',
  'veck-io':'game-covers/crazy-games/veck-io.webp',
  'bloxdhop-io':'game-covers/crazy-games/bloxdhop-io.png',
  'clean-slate-pnn':'game-covers/crazy-games/clean-slate-pnn.png',
  'ragdoll-archers':'game-covers/crazy-games/ragdoll-archers.png',
  'time-shooter':'game-covers/crazy-games/time-shooter.png',
 });
 for (const card of container.querySelectorAll('.game-launcher[data-url]')) {
  const file=card.dataset.url.split('/').pop();
  const cover=uploadedCovers[file];
  if (!cover) continue;
  card.style.setProperty('--card-image', `url("${cover}")`);
  if(file==='pokerogue.html'){card.style.backgroundSize='cover';card.style.backgroundRepeat='no-repeat';card.style.backgroundPosition='center';}
  if (card.dataset.source === 'curated-browser') card.querySelector('span')?.remove();
 }
})();

