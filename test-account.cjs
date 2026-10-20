const { chromium } = require('C:/Users/xavie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({channel: 'msedge', headless: true});
  try {
    const page = await browser.newPage();
    await page.route('**/firebase-app.js', r => r.fulfill({contentType:'text/javascript', body:'export const initializeApp=()=>({});'}));
    await page.route('**/firebase-auth.js', r => r.fulfill({contentType:'text/javascript', body:`
      export const initializeAuth=()=>({}), browserSessionPersistence={}, browserPopupRedirectResolver={};
      export class GoogleAuthProvider {setCustomParameters(){}}
      let callback;
      export const onAuthStateChanged=(a,c)=>{callback=c;c({displayName:'Test Player',email:'test@example.test'});};
      export const signOut=async()=>callback(null);
      export const signInWithPopup=async()=>{};
    `}));
    await page.goto('http://127.0.0.1:8000/index.html');
    await page.locator('.dock-account').click();
    const frame = page.frameLocator('.account-panel iframe');
    await frame.locator('#signout').waitFor();
    if (!(await frame.locator('#profile').innerText()).includes('Test Player')) throw Error('Missing profile');
    await page.locator('.account-close').click();
    await page.locator('.dock-account').click();
    if (!(await frame.locator('#signout').isVisible())) throw Error('Lost signed-in UI');
    await frame.locator('#signout').click();
    if (!(await frame.locator('#signin').isVisible())) throw Error('Sign-out failed');
    console.log('PASS: mocked signed-in profile, reopen, sign-out.');
  } finally {await browser.close();}
})();
