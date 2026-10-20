const {chromium}=require('C:/Users/xavie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
  const page=await browser.newPage();
  await page.goto('http://127.0.0.1:8000/index.html');
  await page.getByRole('link',{name:'Movies',exact:true}).click();
  assert.equal(new URL(page.url()).pathname,'/movies.html');
  await page.waitForFunction(()=>document.querySelector('video').readyState>=2);
  await page.locator('.movie').first().waitFor({timeout:25000});
  assert.equal(await page.locator('video').evaluate(v=>getComputedStyle(v).filter),'brightness(0.5)');
  await page.setViewportSize({width:390,height:844});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.getByRole('link',{name:'Home',exact:true}).click();
  assert.equal(new URL(page.url()).pathname,'/index.html');
  console.log('PASS: integrated Movies navigation, live catalog, video background and mobile width.');
 }finally{await browser.close();}
})();
