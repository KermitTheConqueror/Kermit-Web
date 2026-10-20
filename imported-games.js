(() => {
    const games = [
        ["clmachrider.html", "Mach Rider"],
        ["clmadden93.html", "Madden NFL '93"],
        ["clmadden94.html", "Madden NFL '94"],
        ["clmadden95.html", "Madden NFL '95"],
        ["clmadden96.html", "Madden NFL '96"],
        ["clmadden99.html", "Madden NFL '99"],
        ["clmaddenfootball.html", "John Madden Football"],
        ["clmaddenfootball64.html", "Madden Football 64"],
        ["clmaddennfl.html", "Madden NFL"],
        ["clmaddennfl2000.html", "Madden NFL 2000"],
        ["clmaddennfl2001.html", "Madden NFL 2001"],
        ["clmaddennfl2002.html", "Madden NFL 2002"],
        ["clmaddy98.html", "Madden NFL '98"],
        ["clmajorasmask.html", "The Legend of Zelda: Majora's Mask"],
        ["clMario Party Advance.html", "Mario Party Advance"],
        ["clmario3.html", "Super Mario Bros. 3"],
        ["clmarioandluigisuperstarsaga.html", "Mario & Luigi: Superstar Saga"],
        ["clmariobrosnes.html", "Mario Bros. (NES)"],
        ["clmariobuilder64 (2).html", "Mario Builder 64"],
        ["clmariogolf.html", "Mario Golf"],
        ["clMarioisMissingDoneRight.html", "Mario Is Missing: Done Right"],
        ["clmariokart64.html", "Mario Kart 64"],
        ["clmariokartds.html", "Mario Kart DS"],
        ["clmariokartsupercircuit.html", "Mario Kart: Super Circuit"],
        ["clmariomakersnes.html", "Mario Maker (SNES)"],
        ["clmariopaint.html", "Mario Paint"],
        ["clmarioparty.html", "Mario Party"],
        ["clmarioparty2.html", "Mario Party 2"],
        ["clmarioparty3.html", "Mario Party 3"],
        ["clmariopartyds.html", "Mario Party DS"],
        ["clmariosmysterymeat.html", "Mario's Mystery Meat"],
        ["clmariotennis.html", "Mario Tennis"],
        ["clmariotennisgb.html", "Mario Tennis (Game Boy)"],
        ["clMarvelSuperHeroesArcade.html", "Marvel Super Heroes (Arcade)"],
        ["clMarvelVsCapcomPS1.html", "Marvel vs. Capcom (PS1)"],
        ["clMarvelVsStreetFighter.html", "Marvel Super Heroes vs. Street Fighter"],
        ["clmarvelvsstreetfighterjp.html", "Marvel Super Heroes vs. Street Fighter (Japan)"],
        ["clmauimallard.html", "Maui Mallard"],
        ["clmaxpayne.html", "Max Payne"],
        ["clmcraerally.html", "Colin McRae Rally"],
        ["clmeatboy.html", "Meat Boy"],
        ["clmedalofhonor (2).html", "Medal of Honor"],
        ["clmedievil.html", "MediEvil"],
        ["clmegaman.html", "Mega Man"],
        ["clmegaman2.html", "Mega Man 2"],
        ["clmegaman2gba.html", "Mega Man 2 (GBA)"],
        ["clmegaman3.html", "Mega Man 3"],
        ["clmegaman4.html", "Mega Man 4"],
        ["clmegaman5.html", "Mega Man 5"],
        ["clmegaman5gb.html", "Mega Man 5 (Game Boy)"],
        ["clmegaman6.html", "Mega Man 6"],
        ["clmegaman7.html", "Mega Man 7"],
        ["clmegaman8.html", "Mega Man 8"],
        ["clmegamanbattlechipchallenge.html", "Mega Man Battle Chip Challenge"],
        ["clmegamanbn5tc.html", "Mega Man Battle Network 5: Team Colonel"],
        ["clmegamanbn5tp.html", "Mega Man Battle Network 5: Team ProtoMan"],
        ["clmegamanbn6cf.html", "Mega Man Battle Network 6: Cybeast Falzar"],
        ["clmegamanbn6cg.html", "Mega Man Battle Network 6: Cybeast Gregar"],
        ["clmegamanlegends.html", "Mega Man Legends"],
        ["clmegamanx.html", "Mega Man X"],
        ["clmegamanx2.html", "Mega Man X2"],
        ["clmegamanx3.html", "Mega Man X3"],
        ["clmegamanx4.html", "Mega Man X4"],
        ["clmegamanx5.html", "Mega Man X5"],
        ["clmegamanx6.html", "Mega Man X6"],
        ["clmegamanzero.html", "Mega Man Zero"],
        ["clmegamanzx.html", "Mega Man ZX"],
        ["clmeowuwu.html", "Meow UwU"],
        ["clmetalgear.html", "Metal Gear"],
        ["clmetalslug.html", "Metal Slug"],
        ["clmetalslug2.html", "Metal Slug 2"],
        ["clmetalslugadvance.html", "Metal Slug Advance"],
        ["clmetalslugmission1.html", "Metal Slug: 1st Mission"],
        ["clmetalslugmission2.html", "Metal Slug: 2nd Mission"],
        ["clmetroid.html", "Metroid"],
        ["clmetroid2.html", "Metroid II"],
        ["clmetroidfusion.html", "Metroid Fusion"],
        ["clmetroidprimehunters.html", "Metroid Prime Hunters"],
        ["clmetroidzeromission.html", "Metroid: Zero Mission"],
        ["clmickeymaniasnes.html", "Mickey Mania (SNES)"],
        ["clmicromages.html", "Micro Mages"],
        ["clmidwaysgreatesthitsn64.html", "Midway's Greatest Arcade Hits (N64)"],
        ["clmisslecommand.html", "Missile Command"],
        ["clmk4ampedup.html", "Mortal Kombat 4: Amped Up"],
        ["clmkmythologiesn64.html", "Mortal Kombat Mythologies: Sub-Zero (N64)"],
        ["clmktrilogyps1.html", "Mortal Kombat Trilogy (PS1)"],
        ["clmmbn3b.html", "Mega Man Battle Network 3: Blue"],
        ["clmmbn3w.html", "Mega Man Battle Network 3: White"],
        ["clmmbn4bm.html", "Mega Man Battle Network 4: Blue Moon"],
        ["clmmbn4rs.html", "Mega Man Battle Network 4: Red Sun"],
        ["clmmbnws.html", "Mega Man Battle Network: WonderSwan"],
        ["clmmsf2zxn.html", "Mega Man Star Force 2: Zerker x Ninja"],
        ["clmmsf2zxs.html", "Mega Man Star Force 2: Zerker x Saurian"],
        ["clmmsf3ba.html", "Mega Man Star Force 3: Black Ace"],
        ["clmmsf3rj.html", "Mega Man Star Force 3: Red Joker"],
        ["clmmsfd.html", "Mega Man Star Force: Dragon"],
        ["clmmsfl.html", "Mega Man Star Force: Leo"],
        ["clmmsfp.html", "Mega Man Star Force: Pegasus"],
        ["clmmwilywars.html", "Mega Man: The Wily Wars"],
        ["clmo64 (2).html", "Super Mario 64"],
        ["clmobiusrevolution.html", "Mobius Evolution"],
        ["clMoemon Emerald Vanilla+ (v110).html", "Moemon Emerald Vanilla+"],
        ["clmoneyrush.html", "Money Rush"],
        ["clmonstertracks.html", "Monster Tracks"],
        ["clmoonemeraldextremerandomizer.html", "Moon Emerald Extreme Randomizer"],
        ["clmortalkombat.html", "Mortal Kombat"],
        ["clmortalkombat2.html", "Mortal Kombat II"],
        ["clmortalkombat2a.html", "Mortal Kombat II (Arcade)"],
        ["clmortalkombat3.html", "Mortal Kombat 3"],
        ["clmortalkombat3a.html", "Mortal Kombat 3 (Arcade)"],
        ["clmortalkombat4.html", "Mortal Kombat 4"],
        ["clmortalkombata.html", "Mortal Kombat (Arcade)"],
        ["clmortalkombatadvance.html", "Mortal Kombat Advance"],
        ["clmortkom4.html", "Mortal Kombat 4 (Alternate)"],
        ["clmrdriller.html", "Mr. Driller"],
        ["clmrdriller2.html", "Mr. Driller 2"],
        ["clmspacman (1).html", "Ms. Pac-Man"],
        ["clmvpbaseball.html", "MVP Baseball"],
        ["clnarc.html", "NARC"],
        ["clNBAhangtime.html", "NBA Hangtime"],
        ["clNBAjam.html", "NBA Jam"],
        ["clnbajamTE.html", "NBA Jam Tournament Edition"],
        ["clnewersmbds.html", "Newer Super Mario Bros. DS"],
        ["clnewsupermariobros.html", "New Super Mario Bros."],
        ["clNewSuperMarioWorld2AroundtheWorld.html", "New Super Mario World 2: Around the World"],
        ["clnflblitz.html", "NFL Blitz"],
        ["clnfscarbonowncity.html", "Need for Speed: Carbon - Own the City"],
        ["clnfsmostwanted.html", "Need for Speed: Most Wanted"],
        ["clnfsporcheunleashed.html", "Need for Speed: Porsche Unleashed"],
        ["clnfsunderground.html", "Need for Speed: Underground"],
        ["clnfsunderground2.html", "Need for Speed: Underground 2"],
        ["clnhl98.html", "NHL 98"],
        ["clnhl2002.html", "NHL 2002"],
        ["clnhlhitz2003.html", "NHL Hitz 2003"],
        ["clNicktoonsFreezeFrameFrenzy.html", "Nicktoons: Freeze Frame Frenzy"],
        ["clnightfire.html", "007: Nightfire"],
        ["clnightshade.html", "Nightshade"],
        ["clnintendogslab.html", "Nintendogs: Labrador & Friends"],
        ["clnintendoworldcup.html", "Nintendo World Cup"],
        ["clnplus.html", "N+"],
        ["clnsmbuds.html", "New Super Mario Bros. U (DS)"],
        ["clnsmbwds.html", "New Super Mario Bros. Wii (DS)"],
        ["clnubbysnumberfactory.html", "Nubby's Number Factory"],
        ["clocarinaoftime.html", "The Legend of Zelda: Ocarina of Time"],
        ["clonepiece.html", "One Piece"],
        ["clOotMasterQuest.html", "The Legend of Zelda: Ocarina of Time - Master Quest"],
        ["clopposumcountry.html", "Opossum Country"],
        ["clordinarysonicromhack.html", "Ordinary Sonic ROM Hack"],
        ["clOutrunArcade.html", "OutRun (Arcade)"],
        ["clOutrunGenesis.html", "OutRun (Genesis)"],
        ["clovodimensions.html", "OvO Dimensions"]
    ];

    const container = document.getElementById('all-games-container');
    if (!container) return;

    const normalize = value => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
    const existingUrls = new Set(
        Array.from(container.querySelectorAll('.game-launcher[data-url]'), game => game.dataset.url.toLowerCase())
    );
    const existingTitles = new Set(
        Array.from(container.querySelectorAll('.cover-label'), label => normalize(label.textContent))
    );

    games.forEach(([file, title]) => {
        if (existingUrls.has(file.toLowerCase()) || existingTitles.has(normalize(title))) return;

        const launcher = document.createElement('div');
        const cover = window.KERMIT_GAME_COVERS?.[file.toLowerCase()];
        launcher.className = `game-launcher cover-only${cover ? '' : ' no-cover'}`;
        launcher.dataset.url = file;
        launcher.setAttribute('aria-label', `Play ${title}`);
        launcher.tabIndex = 0;
        if (cover) launcher.style.setProperty('--card-image', `url("${cover}")`);

        const label = document.createElement('div');
        label.className = 'cover-label';
        label.textContent = title;
        launcher.appendChild(label);
        container.appendChild(launcher);

        existingUrls.add(file.toLowerCase());
        existingTitles.add(normalize(title));
    });
})();
