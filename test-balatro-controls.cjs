const {chromium}=require('C:/Users/xavie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
  const page=await browser.newPage({viewport:{width:1280,height:720}});
  await page.route('https://**/*',r=>r.abort());
  await page.route('**/balatro.html',r=>r.fulfill({contentType:'text/html',body:'<body>Loading test</body>'}));
  await page.goto('http://127.0.0.1:8000/games.html',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>openGamePlayer(document.querySelector('[data-url="balatro.html"]')));
  const save=page.locator('[data-action="save"]');
  await page.waitForTimeout(1500);
  assert.equal(await save.isVisible(),false);
  assert.equal(await page.locator('details.emulator-saves').isVisible(),false);
  console.log('PASS: Balatro save controls and save help are hidden.');
 } finally {await browser.close();}
})();
