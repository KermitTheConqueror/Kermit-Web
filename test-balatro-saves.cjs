const {chromium} = require('C:/Users/xavie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({channel:'msedge',headless:true});
  try {
    const page = await browser.newPage();
    // Same real engine/IDBFS, without waiting for the external game archive.
    await page.route('**/balatro-save-test.html', route => route.fulfill({contentType:'text/html',body:`
      <script src="balatro-love.js"></script><script src="balatro-saves.js"></script>
      <canvas id="canvas"></canvas><script>
      window.Module={noInitialRun:true,canvas:document.getElementById('canvas')};
      Love(Module);
      </script>`}));
    page.on('pageerror', e => console.log('PAGE:',e.message));
    await page.goto('http://127.0.0.1:8000/balatro-save-test.html', {timeout:120000});
    await page.waitForFunction(() => window.KermitBalatroSaves?.ready(), null, {timeout:180000});
    console.log('Real Balatro runtime ready.');
    assert.equal(await page.evaluate(() => {
      window.KermitBalatroRuntime = Module;
      const calledRun = Module.calledRun;
      Module.calledRun = false;
      const ready = KermitBalatroSaves.ready();
      Module.calledRun = calledRun;
      return ready;
    }), true, 'Save readiness must use the save mount, not calledRun.');
    const backup = await page.evaluate(async () => {
      const FS = Module.KermitFS;
      FS.mkdirTree('/home/web_user/love/kermit-test');
      FS.writeFile('/home/web_user/love/kermit-test/roundtrip',new Uint8Array([4,8,15,16,23,42]));
      return Array.from(await KermitBalatroSaves.getState());
    });
    await page.evaluate(() => Module.KermitFS.writeFile('/home/web_user/love/kermit-test/roundtrip',new Uint8Array([0])));
    const restarted = page.waitForEvent('domcontentloaded');
    await page.evaluate(async backup => {
      try {
        await KermitBalatroSaves.loadState(new TextEncoder().encode(JSON.stringify({format:'kermit-balatro-files',version:1,files:[{path:'../escape',data:'AA=='}]})));
        throw Error('Traversal accepted');
      } catch(e) {if (!e.message.includes('path')) throw e;}
      await KermitBalatroSaves.loadState(new Uint8Array(backup));
    }, backup);
    await restarted;
    await page.waitForFunction(() => window.KermitBalatroSaves?.ready(), null, {timeout:180000});
    assert.deepEqual(await page.evaluate(() => Array.from(Module.KermitFS.readFile('/home/web_user/love/kermit-test/roundtrip'))),[4,8,15,16,23,42]);
    console.log('PASS: actual Balatro engine save files restored across restart; invalid path rejected. Isolated test browser only.');
  } finally {await browser.close();}
})();
