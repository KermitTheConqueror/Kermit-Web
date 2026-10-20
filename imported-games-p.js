(() => {
    const games = [
        ["clpapermariopromode.html", "Paper Mario: Pro Mode"],
        ["clpapermariottyd.html", "Paper Mario: The Thousand-Year Door"],
        ["clparappatherapper.html", "PaRappa the Rapper"],
        ["clpartnersintime.html", "Mario & Luigi: Partners in Time"],
        ["clpeach.html", "Super Princess Peach"],
        ["clpepsiman.html", "Pepsiman"],
        ["clperfectdark.html", "Perfect Dark"],
        ["clpersona.html", "Persona"],
        ["clpersona2.html", "Persona 2"],
        ["clphantasystar.html", "Phantasy Star"],
        ["clphantasystar2.html", "Phantasy Star II"],
        ["clphantasystar4.html", "Phantasy Star IV"],
        ["clpheonixjusticeforall.html", "Phoenix Wright: Justice for All"],
        ["clpheonixrightaceattorny.html", "Phoenix Wright: Ace Attorney"],
        ["clpheonixtrialsandyear.html", "Phoenix Wright: Trials and Tribulations"],
        ["clpinballnes.html", "Pinball (NES)"],
        ["clpitfall.html", "Pitfall!"],
        ["clpkmnarutoans.html", "Pokémon Naruto Advanced Ninja Showdown"],
        ["clplantsvszombiesnds.html", "Plants vs. Zombies (Nintendo DS)"],
        ["clpokeaestheticred.html", "Pokémon Aesthetic Red"],
        ["clPokeAmbrosia.html", "Pokémon Ambrosia"],
        ["clpokebattlefact.html", "Pokémon Battle Factory"],
        ["clpokeblack.html", "Pokémon Black"],
        ["clpokeblack2html.html", "Pokémon Black 2"],
        ["clpokeblazeblack2redux.html", "Pokémon Blaze Black 2 Redux"],
        ["clpokeblue.html", "Pokémon Blue"],
        ["clpokecrystaladvanceredux.html", "Pokémon Crystal Advance Redux"],
        ["clpokediamond.html", "Pokémon Diamond"],
        ["clpokeemeraldextendedcut.html", "Pokémon Emerald: Extended Cut"],
        ["clpokeemeraldimperium.html", "Pokémon Emerald Imperium"],
        ["clpokeemeraldlegacy.html", "Pokémon Emerald Legacy"],
        ["clpokeemeraldrandom.html", "Pokémon Emerald Randomized"],
        ["clpokeemeraldrogue.html", "Pokémon Emerald Rogue"],
        ["clpokeflora.html", "Pokémon Flora Sky"],
        ["clpokefrlgplus.html", "Pokémon FireRed & LeafGreen Plus"],
        ["clPokeFusion3.html", "Pokémon Fusion 3"],
        ["clpokegaia.html", "Pokémon Gaia"],
        ["clpokeheartgold.html", "Pokémon HeartGold"],
        ["clpokemoncrystal.html", "Pokémon Crystal"],
        ["clpokemonemerald.html", "Pokémon Emerald"],
        ["clpokemonfirered.html", "Pokémon FireRed"],
        ["clpokemongold.html", "Pokémon Gold"],
        ["clpokemonleafgreen.html", "Pokémon LeafGreen"],
        ["clpokemonmysterydungeon.html", "Pokémon Mystery Dungeon"],
        ["clpokemonruby.html", "Pokémon Ruby"],
        ["clpokemonsapphire.html", "Pokémon Sapphire"],
        ["clpokemonsilver.html", "Pokémon Silver"],
        ["clpokemonsmred.html", "Pokémon SM Red"],
        ["clpokemonsnap.html", "Pokémon Snap"],
        ["clpokemonsors.html", "Pokémon SORS"],
        ["clpokemonsors2.html", "Pokémon SORS 2"],
        ["clpokemonstadium.html", "Pokémon Stadium"],
        ["clpokemonstadium2.html", "Pokémon Stadium 2"],
        ["clPokémonstunningsteel.html", "Pokémon Stunning Steel"],
        ["clpokemonultimatefusion.html", "Pokémon Ultimate Fusion"],
        ["clpokemonunbound.html", "Pokémon Unbound"],
        ["clpokemoonemerald.html", "Pokémon Moon Emerald"],
        ["clpokemoongalaxy.html", "Pokémon Moon Galaxy"],
        ["clpokemysteryexplorersofsky.html", "Pokémon Mystery Dungeon: Explorers of Sky"],
        ["clpokenameless.html", "Pokémon Nameless"],
        ["clpokepearl.html", "Pokémon Pearl"],
        ["clpokepicross.html", "Pokémon Picross"],
        ["clpokeplatinum.html", "Pokémon Platinum"],
        ["clpokeplatinumrandomized.html", "Pokémon Platinum Randomized"],
        ["clpokepureblue.html", "Pokémon Pure Blue"],
        ["clpokepuregreen.html", "Pokémon Pure Green"],
        ["clpokepurered.html", "Pokémon Pure Red"],
        ["clpokered.html", "Pokémon Red"],
        ["clpokerenegadeplat.html", "Pokémon Renegade Platinum"],
        ["clpokerowe.html", "Pokémon R.O.W.E."],
        ["clpokerunandbun.html", "Pokémon Run & Bun"],
        ["clpokescorchedsilver.html", "Pokémon Scorched Silver"],
        ["clpokescrambledscarlet.html", "Pokémon Scrambled Scarlet"],
        ["clpokesoulsilver.html", "Pokémon SoulSilver"],
        ["clpokesunsky.html", "Pokémon Sun Sky"],
        ["clpoketcg1.html", "Pokémon Trading Card Game"],
        ["clpoketcg2.html", "Pokémon Trading Card Game 2"],
        ["clPokeThetaEmeraldEX.html", "Pokémon Theta Emerald EX"],
        ["clpoketoomanytypes2.html", "Pokémon Too Many Types 2"],
        ["clpokeultraviolet.html", "Pokémon Ultra Violet"],
        ["clpokevega.html", "Pokémon Vega"],
        ["clpokevoltwhite2redux.html", "Pokémon Volt White 2 Redux"],
        ["clpokevoyager.html", "Pokémon Voyager"],
        ["clpokewhite.html", "Pokémon White"],
        ["clpokewhite2.html", "Pokémon White 2"],
        ["clpokeyellow.html", "Pokémon Yellow"],
        ["clportal.html", "Portal"],
        ["clportraitofruin.html", "Castlevania: Portrait of Ruin"],
        ["clpowerslave.html", "PowerSlave"],
        ["clprofessorlaytonandthecuriousvillage.html", "Professor Layton and the Curious Village"],
        ["clprowrestling.html", "Pro Wrestling"],
        ["clpuckman.html", "Puck Man"],
        ["clpunchout.html", "Punch-Out!!"],
        ["clpuyopuyofever.html", "Puyo Puyo Fever"],
        ["clpyrotoad.html", "Pyrotoad"],
        ["clpacman.html", "Pac-Man"],
        ["clpacmanworldg.html", "Pac-Man World (GBA)"],
        ["clpapermario.html", "Paper Mario"],
        ["clPaperMarioDSE.html", "Paper Mario DSE"],
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
        title = title.replace(/Pokémon/g, 'Pokemon');
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
