const {chromium} = require('C:/Users/xavie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
(async()=>{
  const browser=await chromium.launch({channel:'msedge',headless:true});
  try {
    const page=await browser.newPage();
    await page.route('**/save-test-game.html', r=>r.fulfill({contentType:'text/html',body:`<script>window.EJS_core='gba';window.EJS_emulator={gameManager:{getState:()=>new Uint8Array([1,2,3,4]),loadState:bytes=>window.loaded=Array.from(bytes)}};</script>`}));
    await page.goto('http://127.0.0.1:8000/');
    await page.evaluate(()=>{document.body.innerHTML='<section id="test"><div class="player-info-bar"></div><iframe src="save-test-game.html"></iframe></section>';});
    await page.addScriptTag({url:'http://127.0.0.1:8000/emulator-saves.js'});
    await page.evaluate(()=>window.attachEmulatorSaves(document.querySelector('#test'),document.querySelector('iframe'),()=>({url:'save-test-game.html',title:'Test'})));
    const save=page.locator('[data-action=save]');
    await save.waitFor({state:'visible'});
    page.on('dialog', d=>d.accept());
    await save.click();
    await page.waitForFunction(()=>document.querySelector('[role=status]').textContent.startsWith('Saved slot 1'));
    const download=page.waitForEvent('download');
    await page.locator('[data-action=export]').click();
    const file=await download;
    assert.match(file.suggestedFilename(),/\.kwsave$/);
    await page.locator('input[type=file]').setInputFiles(await file.path());
    await page.waitForFunction(()=>document.querySelector('[role=status]').textContent.startsWith('Imported slot 1'));
    await page.locator('[data-action=load]').click();
    await page.waitForFunction(()=>document.querySelector('[role=status]').textContent === 'Loaded slot 1.');
    assert.deepEqual(await page.evaluate(()=>document.querySelector('iframe').contentWindow.loaded),[1,2,3,4]);
    await page.locator('input[type=file]').setInputFiles({name:'wrong.kwsave',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({format:'kermit-emulator-save',version:1,path:'/wrong.html',core:'gba',data:'AQ=='}))});
    await page.waitForFunction(()=>document.querySelector('[role=status]').textContent.includes('not for this game'));
    const featured = ['Minecraft 1.12.2.html','Hollow Knight.html','Undertale.html','DELTARUNE.html','1v1lol-reloaded.html','balatro.html','Binding of Issac_ Wrath of the Lamb.html','Candy Crush.html','clmarioandluigisuperstarsaga.html','clpokemonemerald.html'];
    for (const url of featured) {
      const help = await page.evaluate(url => {
        const section = document.createElement('section');
        section.innerHTML = '<div class="player-info-bar"></div><iframe></iframe>';
        document.body.append(section);
        const stop = window.attachEmulatorSaves(section,section.querySelector('iframe'),()=>({url,title:url}));
        const details = section.querySelector('details');
        const result = {visible:!details.hidden,text:details.textContent};
        stop(); section.remove(); return result;
      }, url);
      if (url === 'balatro.html') assert.equal(help.visible, false);
      else assert.ok(help.visible && help.text.length > 70, url);
    }
    await page.goto('http://127.0.0.1:8000/index.html');
    assert.equal(await page.locator('.dock-account').count(),0);
    console.log('PASS: browser slot save, backup export/import, load bytes, reject wrong game, account button remains removed.');
  } finally {await browser.close();}
})();
