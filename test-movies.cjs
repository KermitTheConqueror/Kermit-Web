const {chromium}=require('C:/Users/xavie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 for(const url of ['/tmdb.json','/movies-server.cjs','/../kermit-private/tmdb.json'])assert.equal((await fetch('http://127.0.0.1:8002'+url)).status,404);
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
 const page=await browser.newPage();
 await page.route('**/api/movies?*',r=>r.fulfill({contentType:'application/json',body:JSON.stringify({page:1,total_pages:1,results:[{id:1,title:'Test Movie',overview:'A test description.',release_date:'2026-01-01',vote_average:7.5}]})}));
 await page.goto('http://127.0.0.1:8002/');
 await page.getByRole('button',{name:'Details for Test Movie'}).click();
 await page.getByRole('button',{name:'+ Add to watchlist'}).click();
 await page.getByRole('button',{name:'Close movie details'}).click();
 await page.getByRole('button',{name:'My watchlist'}).click();
 assert.equal(await page.locator('.movie').count(),1);
 await page.reload();await page.getByRole('button',{name:'My watchlist'}).click();
 assert.equal(await page.locator('.movie').count(),1);
 await page.getByRole('button',{name:'Details for Test Movie'}).click();
 await page.getByRole('button',{name:'Remove from watchlist'}).click();
 await page.getByRole('button',{name:'Close movie details'}).click();
 assert.equal(await page.locator('.movie').count(),0);
 await page.getByLabel('Search movies').fill('test');await page.getByRole('button',{name:'Search',exact:true}).click();
 await page.getByRole('button',{name:'Details for Test Movie'}).waitFor();
 await page.route('https://cinesrc.st/**',r=>r.fulfill({contentType:'text/html',body:'<p>Mock player</p>'}));
 assert.equal(await page.locator('#player-host iframe').count(),0);
 await page.getByRole('button',{name:'Details for Test Movie'}).click();
 await page.locator('#watch').click();
 assert.equal(await page.locator('#player-host iframe').getAttribute('src'),'https://cinesrc.st/embed/movie/1');
 assert.equal(await page.locator('#player-host iframe').getAttribute('sandbox'),'allow-scripts allow-same-origin allow-presentation');
 await page.locator('#player-reload').click();
 assert.equal(await page.locator('#player-host iframe').count(),1);
 await page.locator('#player-close').click();
 await page.waitForFunction(()=>!document.querySelector('#player-host iframe'));
 console.log('PASS: click-to-load CineSrc embed, sandbox, reload and close cleanup (mock playback).');
 console.log('PASS: search/details/watchlist persistence and removal; private configuration routes blocked. Mock catalog only.');
 }finally{await browser.close();}
})();
