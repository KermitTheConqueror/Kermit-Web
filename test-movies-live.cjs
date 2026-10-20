const {chromium}=require('C:/Users/xavie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const response=await fetch('http://127.0.0.1:8002/api/movies?q=Toy+Story');
 assert.equal(response.status,200);const data=await response.json();assert.ok(data.results.some(m=>m.title==='Toy Story'));
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:900}});
  await page.goto('http://127.0.0.1:8002/',{waitUntil:'domcontentloaded'});
  await page.locator('.movie').first().waitFor();
  assert.ok(await page.locator('.movie').count()>0);
  await page.getByLabel('Search movies').fill('Toy Story');await page.getByRole('button',{name:'Search',exact:true}).click();
  await page.getByRole('button',{name:'Details for Toy Story',exact:true}).click();
  await page.getByRole('button',{name:'+ Add to watchlist'}).click();
  await page.getByRole('button',{name:'Close movie details'}).click();
  await page.getByRole('button',{name:'My watchlist'}).click();
  assert.equal(await page.locator('.movie').count(),1);
  await page.reload({waitUntil:'domcontentloaded'});await page.getByRole('button',{name:'My watchlist'}).click();
  assert.equal(await page.locator('.movie').count(),1);
  await page.setViewportSize({width:390,height:844});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
  console.log('PASS: live TMDB results, Toy Story search, details, watchlist persistence, mobile width.');
 }finally{await browser.close();}
})();
