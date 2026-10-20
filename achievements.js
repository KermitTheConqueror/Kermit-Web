(() => {
  const key = 'kermit.achievement.joker.v1';
  let unlocked = false;
  try { unlocked = localStorage.getItem(key) === 'true'; } catch {}
  window.isJokerUnlocked = () => unlocked;
  window.unlockJoker = () => {
    if (unlocked) return;
    unlocked = true;
    try { localStorage.setItem(key, 'true'); } catch {}
    document.querySelector('.screen-joker')?.removeAttribute('hidden');
    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.setAttribute('role', 'status');
    toast.innerHTML = '<img src="featured-art/balatro-character.png" alt=""><div><small>ACHIEVEMENT UNLOCKED</small><strong>First Hand</strong><span>You opened Balatro! Joker card unlocked.</span></div>';
    document.body.append(toast);
    setTimeout(() => toast.remove(), 6500);
  };
  window.addEventListener('storage', event => {
    if (event.key !== key) return;
    unlocked = event.newValue === 'true';
    const joker = document.querySelector('.screen-joker');
    if (joker) joker.hidden = !unlocked;
  });
})();
