(() => {
  const MAX = 64 * 1024 * 1024;
  let database;
  function db() {
    return database ||= new Promise((resolve, reject) => {
      const request = indexedDB.open('kermit-emulator-states-v1', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('states', {keyPath:'id'});
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {database = null; reject(request.error);};
    });
  }
  async function store(mode, action) {
    const database = await db();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('states', mode);
      const request = action(tx.objectStore('states'));
      tx.oncomplete = () => resolve(request.result);
      tx.onerror = tx.onabort = () => reject(tx.error || Error('Storage failed'));
    });
  }
  window.attachEmulatorSaves = (page, frame, getGame) => {
    const guides = {
      'Minecraft 1.12.2.html': 'Use the game’s Save and Quit option before closing your world. If the world menu offers Export, use it to keep a world file. Kermit Web cannot make an instant emulator-style snapshot of this game.',
      'Hollow Knight.html': 'Use the game’s own save/checkpoint system before closing it. Kermit Web does not yet have a verified backup or restore adapter for this Unity game.',
      'Undertale.html': 'Use a SAVE point inside the game. This game runs on another website, so browser security prevents Kermit Web from exporting or restoring its save data.',
      'DELTARUNE.html': 'Use a SAVE point inside the game. This game runs on another website, so browser security prevents Kermit Web from exporting or restoring its save data.',
      '1v1lol-reloaded.html': 'This is an online multiplayer game. Kermit Web cannot save or restore a live match or access the embedded website’s player data.',
      'Binding of Issac_ Wrath of the Lamb.html': 'This Flash version does not expose an emulator save-state interface to Kermit Web. Use any save options provided by the game; an in-progress run cannot be backed up here yet.',
      'Candy Crush.html': 'Use any progress-saving options provided inside this version of the game. Kermit Web does not yet have a verified backup or restore adapter for it.',
      'clmarioandluigisuperstarsaga.html': 'Start the emulator, then use Save and Load below. There are three browser slots. Export backup downloads a file; Import backup puts that file into your selected slot.',
      'clpokemonemerald.html': 'Start the emulator, then use Save and Load below. There are three browser slots. Export backup downloads a file; Import backup puts that file into your selected slot.'
    };
    const help = document.createElement('details');
    help.className = 'emulator-saves';
    const heading = document.createElement('summary');
    heading.textContent = 'Game saves — options and help';
    const guidance = document.createElement('p');
    guidance.style.maxWidth = '80ch';
    help.append(heading, guidance);
    page.querySelector('.player-info-bar').after(help);
    function updateHelp() {
      const file = decodeURIComponent(new URL(getGame().url, location.href).pathname.split('/').pop());
      help.hidden = !guides[file];
      guidance.textContent = guides[file] || '';
    }
    updateHelp();
    const bar = document.createElement('div');
    bar.className = 'emulator-saves';
    bar.hidden = true;
    bar.innerHTML = '<label>Save slot <select aria-label="Emulator save slot"><option value="1">1</option><option value="2">2</option><option value="3">3</option></select></label><button data-action="save">Save</button><button data-action="load">Load</button><button data-action="export">Export backup</button><button data-action="import">Import backup</button><input type="file" accept=".kwsave,application/json" hidden><span role="status">Local saves — not cloud synced</span>';
    page.querySelector('.player-info-bar').after(bar);
    const status = bar.querySelector('[role=status]');
    const slot = bar.querySelector('select');
    const input = bar.querySelector('input');
    let current, busy = false;
    function detect() {
      if (!page.isConnected) {clearInterval(timer); return;}
      updateHelp();
      const path = new URL(getGame().url, location.href).pathname;
      const isBalatro = decodeURIComponent(path).split('/').pop().toLowerCase() === 'balatro.html';
      if (isBalatro) {current = null; bar.hidden = true; help.hidden = true; return;}
      function waitingForBalatro() {
        current = null;
        bar.hidden = !isBalatro;
        bar.querySelectorAll('button').forEach(button => button.disabled = true);
        if (isBalatro) status.textContent = 'Balatro is loading. Save controls will unlock when its save system is ready.';
      }
      try {
        const win = frame.contentWindow;
        const emulator = win.EJS_emulator;
        const balatro = win.KermitBalatroSaves;
        const manager = balatro || emulator?.gameManager;
        const core = balatro ? 'balatro-files-v1' : String(win.EJS_core || emulator?.config?.system || 'unknown');
        // Ignore stale emulator instances during navigation to another game.
        if (win.location.pathname !== path) {waitingForBalatro(); return;}
        const supported = manager && typeof manager.getState === 'function' && typeof manager.loadState === 'function';
        const capable = supported && (!balatro || balatro.ready()) && (!manager.functions?.supportsStates || manager.functions.supportsStates());
        current = capable ? {manager, path, core, title:getGame().title} : null;
        bar.hidden = !isBalatro && !supported && !win.EJS_core;
        bar.querySelectorAll('button').forEach(button => button.disabled = busy || !current);
        if (!current && !busy) status.textContent = isBalatro ? 'Wait for Balatro to finish loading.' : supported ? 'This emulator core does not support save states.' : 'Start the emulator to use save slots.';
      } catch {waitingForBalatro();}
    }
    function context() {
      detect();
      if (!current) throw Error('Start the emulator first.');
      return {...current, slot:slot.value, id:JSON.stringify([current.path,current.core,slot.value])};
    }
    function stillCurrent(ctx) {
      return page.isConnected && current?.manager === ctx.manager && new URL(getGame().url,location.href).pathname === ctx.path;
    }
    async function run(action) {
      if (busy) return;
      const ctx = context();
      busy = true; detect();
      try {await action(ctx);} catch (error) {status.textContent = 'Save error: ' + (error.message || 'Storage unavailable');}
      finally {busy = false; detect();}
    }
    async function read(ctx) {
      const record = await store('readonly', s => s.get(ctx.id));
      if (!record) throw Error('This slot is empty. Save your game first.');
      return record;
    }
    function download(record, title) {
      let binary = '';
      for (let i=0;i<record.bytes.length;i+=32768) binary += String.fromCharCode(...record.bytes.subarray(i,i+32768));
      const data = {format:'kermit-emulator-save',version:1,path:record.path,core:record.core,savedAt:record.savedAt,data:btoa(binary)};
      const url = URL.createObjectURL(new Blob([JSON.stringify(data)],{type:'application/json'}));
      const a = document.createElement('a'); a.href=url;
      a.download=`${title.replace(/[^a-z0-9]+/gi,'-')}-${new Date().toISOString().replace(/[:.]/g,'-')}.kwsave`;
      a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
      status.textContent = 'Backup exported. Use Import backup to restore it later.';
    }
    bar.addEventListener('click', event => {
      const action = event.target.dataset.action;
      if (!action || !current || busy) return;
      if (action === 'import') {input.value = ''; input.click(); return;}
      run(async ctx => {
        if (action === 'save') {
          const state = await ctx.manager.getState();
          const bytes = ArrayBuffer.isView(state) ? new Uint8Array(state.buffer,state.byteOffset,state.byteLength).slice() : new Uint8Array(state);
          if (!bytes.length || bytes.length > MAX) throw Error('The emulator returned an empty or oversized state.');
          if (!stillCurrent(ctx)) throw Error('Game changed before saving.');
          await store('readwrite', s => s.put({id:ctx.id,path:ctx.path,core:ctx.core,slot:ctx.slot,title:ctx.title,savedAt:Date.now(),bytes}));
          status.textContent = `Saved slot ${ctx.slot} in this browser at ${new Date().toLocaleTimeString()}.`;
        } else if (action === 'load') {
          const record = await read(ctx);
          if (!stillCurrent(ctx)) return;
          if (!confirm(ctx.core === 'balatro-files-v1' ? 'Restore this Balatro save and restart the game? Current progress will be replaced.' : 'Load this slot? Current unsaved progress will be replaced.')) return;
          await ctx.manager.loadState(record.bytes);
          status.textContent = `Loaded slot ${ctx.slot}.`;
        } else if (action === 'export') {
          const record = await read(ctx);
          download(record, ctx.title);
        }
      }).catch(error => {status.textContent=error.message;});
    });
    input.addEventListener('change', () => {
      const file = input.files[0]; if (!file) return;
      run(async ctx => {
        if (file.size > MAX * 1.4) throw Error('Backup is too large.');
        const data = JSON.parse(await file.text());
        if (data.format !== 'kermit-emulator-save' || data.version !== 1 || data.path !== ctx.path || data.core !== ctx.core || typeof data.data !== 'string') throw Error('This backup is not for this game and emulator core.');
        const binary = atob(data.data);
        if (!binary.length || binary.length > MAX) throw Error('Invalid backup size.');
        if (!stillCurrent(ctx)) return;
        if (!confirm(`Import into slot ${ctx.slot}? Any save already in that slot will be replaced. The running game will not change until you press Load.`)) return;
        const bytes = Uint8Array.from(binary, c=>c.charCodeAt(0));
        await store('readwrite', s=>s.put({id:ctx.id,path:ctx.path,core:ctx.core,slot:ctx.slot,title:ctx.title,savedAt:Date.now(),bytes}));
        status.textContent = `Imported slot ${ctx.slot}. Press Load to resume it.`;
      }).catch(error=>{status.textContent=error.message;});
    });
    const timer = setInterval(detect, 1000);
    frame.addEventListener('load', () => {current=null;status.textContent='Local saves — not cloud synced';detect();});
    return () => clearInterval(timer);
  };
})();
