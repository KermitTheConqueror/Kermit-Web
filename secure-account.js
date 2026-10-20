import { firebaseConfig } from './firebase-config.js';
const status = document.querySelector('#status');
const login = document.querySelector('#signin');
const logout = document.querySelector('#signout');
const profile = document.querySelector('#profile');
// Never initialize authentication on the games origin, even if this file is opened there.
if (window.top !== window.self) document.body.classList.add('embedded');
if (location.origin !== 'http://localhost:8001') {
  status.textContent = 'Open the secure account page at http://localhost:8001/.';
} else {
  try {
    const [{ initializeApp }, authSdk] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js')
    ]);
    const { initializeAuth, browserSessionPersistence, browserPopupRedirectResolver, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } = authSdk;
    const auth = initializeAuth(initializeApp(firebaseConfig), { persistence: browserSessionPersistence, popupRedirectResolver: browserPopupRedirectResolver });
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const showError = error => {
      const messages = {
        'auth/unauthorized-domain': 'This local account address needs approval in Firebase: Authentication → Settings → Authorized domains → add localhost.',
        'auth/popup-blocked': 'Allow pop-ups for localhost, then try again. Chrome is recommended for Google sign-in.',
        'auth/popup-closed-by-user': 'Sign-in cancelled. You can try again.',
        'auth/network-request-failed': 'Could not reach Google. Check your connection and try again.',
        'auth/operation-not-allowed': 'Google sign-in is not enabled in Firebase.'
      };
      status.textContent = messages[error.code] || 'Sign-in failed. Try this account page in Chrome. (' + (error.code || 'connection error') + ')';
    };
    onAuthStateChanged(auth, user => {
      profile.textContent = user ? `Signed in as ${user.displayName || 'player'}${user.email ? ' — ' + user.email : ''}` : 'Sign in or create an account with Google.';
      login.hidden = !!user; logout.hidden = !user;
      login.disabled = false;
      status.textContent = user ? 'You are signed in to Kermit Web.' : 'Ready to sign in.';
    }, showError);
    login.addEventListener('click', async () => {
      login.disabled = true; status.textContent = 'Complete sign-in in the Google window.';
      try { await signInWithPopup(auth, provider); } catch (error) { showError(error); }
      finally { login.disabled = false; }
    });
    logout.addEventListener('click', async () => {
      logout.disabled = true;
      try { await signOut(auth); } catch (error) { showError(error); }
      finally { logout.disabled = false; }
    });
  } catch (error) { console.error('Account initialization failed:', error.code || error.message); status.textContent = 'Could not load Google sign-in. Check your connection and reload this page.'; }
}
