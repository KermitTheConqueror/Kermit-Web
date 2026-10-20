const {chromium}=require('C:/Users/xavie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
const page=await browser.newPage({viewport:{width:1360,height:900}});
await page.goto('http://127.0.0.1:8000/index.html#movies');
const movie=page.frameLocator('#movies-frame');
await movie.locator('.movie-hero').waitFor();
assert.equal(await movie.locator('header').count(),0);
assert.equal(await movie.locator('body').evaluate(el=>getComputedStyle(el).backgroundColor),'rgba(0, 0, 0, 0)');
await page.screenshot({path:'movie-layout-check.png'});
await page.setViewportSize({width:390,height:844});
assert.equal(await movie.locator('html').evaluate(el=>el.scrollWidth<=innerWidth),true);
console.log('PASS: no top bar, transparent shared background, responsive movie layout.');
}finally{await browser.close();}})();
