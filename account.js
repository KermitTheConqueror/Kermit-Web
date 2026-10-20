(() => {
  const buttons = document.querySelectorAll('.dock-account');
  if (!buttons.length) return;
  const panel = document.createElement('dialog');
  panel.className = 'account-panel';
  panel.setAttribute('aria-label', 'Your Kermit Web account');
  panel.innerHTML = `<button class="account-close" type="button" aria-label="Close account">×</button>
    <iframe title="Kermit Web secure account" style="width:100%;height:440px;max-height:75dvh;border:0;display:block;border-radius:12px"></iframe>`;
  document.body.append(panel);
  const frame = panel.querySelector('iframe');
  function showAccount() {
    if (!frame.hasAttribute('src') && ['http://localhost:8000', 'http://127.0.0.1:8000'].includes(location.origin)) frame.src = 'http://localhost:8001/?embedded=1';
    if (!frame.hasAttribute('src') && !panel.querySelector('p')) {
      frame.hidden = true;
      const message = document.createElement('p');
      message.textContent = 'Account hosting is not configured for this address. Use the local development server.';
      panel.append(message);
    }
    if (!panel.open) panel.showModal();
  }
  let opener;
  buttons.forEach(button => button.addEventListener('click', () => {
    if (window.parent !== window && typeof window.parent.openKermitAccount === 'function') {window.parent.openKermitAccount();return;}
    opener=button;showAccount();
  }));
  window.openKermitAccount=()=>{opener=buttons[0];showAccount();};
  panel.querySelector('.account-close').addEventListener('click',()=>panel.close());
  panel.addEventListener('click',event=>{if(event.target!==panel)return;const r=panel.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)panel.close();});
  panel.addEventListener('close',()=>opener?.focus());
})();
