const {chromium}=require('C:/Users/xavie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
const page=await browser.newPage();await page.goto('http://127.0.0.1:8000/index.html');
await page.getByRole('link',{name:'Cloud Gaming',exact:true}).click();
const cloud=page.frameLocator('#cloud-frame');await cloud.locator('#start').click();
const remote=cloud.frameLocator('#cloud-host iframe');
await remote.locator('body').waitFor({timeout:25000});
console.log('Embedded public CloudMoon page:',(await remote.locator('body').innerText()).slice(0,1200));
await page.locator('body > .dock').getByRole('link',{name:'Home',exact:true}).click();
await page.getByRole('link',{name:'Cloud Gaming',exact:true}).click();
assert.equal(await cloud.locator('#cloud-host iframe').count(),1);
await cloud.locator('#stop').click();assert.equal(await cloud.locator('#cloud-host iframe').count(),0);
console.log('PASS: cloud tab, external embed, persistent navigation, disconnect. No game session or login tested.');
}finally{await browser.close();}})();
