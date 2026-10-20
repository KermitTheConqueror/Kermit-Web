const {chromium}=require('C:/Users/xavie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await browser.newPage();await page.goto('http://127.0.0.1:8000/index.html');
 await page.evaluate(()=>window.pageMarker=123);
 for(const name of ['Movies','Games','Home']){
  await page.locator('body > .dock').getByRole('link',{name,exact:true}).click();
  assert.equal(await page.evaluate(()=>window.pageMarker),123);
  assert.equal(new URL(page.url()).pathname,'/index.html');
  if(name!=='Home')await page.frameLocator(name==='Movies'?'#movies-frame':'#catalog-frame').locator('body').waitFor();
 }
 assert.equal(await page.locator('#catalog-shell').isHidden(),true);
 assert.equal(page.context().pages().length,1);
 const movies=page.frameLocator('#movies-frame');
 const games=page.frameLocator('#catalog-frame');
 await movies.locator('body').evaluate(()=>window.preservedMovieState='saved');
 await movies.locator('#query').evaluate(input=>{input.value='Toy Story';});
 await games.locator('body').evaluate(()=>window.preservedGameState='saved');
 for(const name of ['Movies','Games','Home','Movies'])await page.locator('body > .dock').getByRole('link',{name,exact:true}).click();
 assert.equal(await movies.locator('body').evaluate(()=>window.preservedMovieState),'saved');
 assert.equal(await games.locator('body').evaluate(()=>window.preservedGameState),'saved');
 assert.equal(await movies.locator('#query').inputValue(),'Toy Story');
 console.log('PASS: both page documents and movie search survive repeated switches.');
 console.log('PASS: Movies/Games/Home switch without top-page reload or extra tabs.');
}finally{await browser.close();}})();
