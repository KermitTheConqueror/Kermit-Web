// Keep the official session handshake; only replace the final page navigation.
document.addEventListener('DOMContentLoaded', () => {
  if (!window.App) return;
  const style = document.createElement('style');
  style.textContent = `
    #kermit-player{position:fixed;inset:0;width:100%;height:100dvh;max-width:none;max-height:none;margin:0;padding:0;border:0;background:#10141bed;color:white}
    #kermit-player[open]{display:flex;flex-direction:column}
    #kermit-player::backdrop{background:#070a10}
    .kp-toolbar{display:flex;align-items:center;gap:12px;padding:14px 20px;background:#101317;border-bottom:1px solid #ffffff15}
    .kp-toolbar strong{flex:1}.kp-toolbar button{background:#ffffff0d;border:1px solid #ffffff25;border-radius:10px;padding:10px 14px;color:white;cursor:pointer}
    .kp-toolbar button:focus-visible{outline:3px solid #b2e5ff}
    .kp-stage{flex:1;min-height:0;display:flex;flex-direction:column;margin:20px auto;width:calc(100% - 40px);max-width:1500px;border:1px solid #ffffff20;border-radius:16px;overflow:hidden;background:#000}
    .kp-stage iframe{width:100%;flex:1;min-height:0;border:0;background:#000}
    .kp-info{padding:14px 20px;background:#191d24}.kp-info p{font-size:12px;color:#abb7ca;margin:4px 0 0}
    @media(max-width:600px){.kp-stage{width:100%;margin:0;border-radius:0}.kp-toolbar{padding:10px;gap:8px}.kp-toolbar button{padding:8px}.kp-info{padding:10px}}
  `;
  document.head.append(style);
  const player = document.createElement('dialog');
  player.id = 'kermit-player';
  player.setAttribute('aria-label', 'Cloud game player');
  player.innerHTML = `<header class="kp-toolbar"><button type="button" data-back>← Back</button><strong>Kermit Web</strong><button type="button" data-reload aria-label="Reload game">↻ Reload</button><button type="button" data-fullscreen>Fullscreen</button></header><section class="kp-stage"><div class="kp-info"><strong data-title>Cloud Gaming</strong><p>Powered by CloudMoon</p><p data-status role="status"></p></div></section>`;
  document.body.append(player);
  let frame, previousFocus;
  const stage = player.querySelector('.kp-stage');
  player.querySelector('[data-back]').onclick = () => {
    if (confirm('Leave this game? Your cloud session may disconnect.')) player.close();
  };
  player.addEventListener('cancel', event => {
    event.preventDefault(); player.querySelector('[data-back]').click();
  });
  player.addEventListener('close', () => {
    frame?.remove(); frame = null; previousFocus?.focus();
  });
  player.querySelector('[data-reload]').onclick = () => {
    if (frame && confirm('Reload the game? This may reconnect your session.')) frame.src = new URL('play-261014.html', location.href).href;
  };
  player.querySelector('[data-fullscreen]').onclick = async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await player.requestFullscreen(); }
    catch { player.querySelector('[data-status]').textContent = 'Fullscreen is unavailable in this browser.'; }
  };
  window.App.launchGameAction = function(sid) {
    localStorage.setItem('cm_launch_data', JSON.stringify({sid, quality:'SD', timestamp:Date.now()}));
    previousFocus = document.activeElement;
    frame?.remove();
    frame = document.createElement('iframe');
    frame.title = 'CloudMoon game';
    frame.allow = 'fullscreen; autoplay; gamepad; clipboard-read; clipboard-write';
    frame.allowFullscreen = true;
    frame.src = new URL('play-261014.html', location.href).href;
    stage.prepend(frame);
    player.querySelector('[data-status]').textContent = '';
    if (!player.open) player.showModal();
  };
});
