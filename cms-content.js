// The public site reads content; all editing happens in authenticated Pages CMS.
(async () => {
  const page = document.body.dataset.category || 'home';
  try {
    const response = await fetch('/' + page + '-content.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Unable to load page content');
    const content = await response.json();
    if (page === 'connect') renderConnectPage(content);
    renderPageMusic(content);
    if (page === 'personal') renderLifeStagePhotos(content);
    if (page === 'home') renderHomePortrait(content);
    if (page === 'home') renderMeetVersions(content);

    for (const node of document.querySelectorAll('[data-setting]')) {
      const text = content.text?.[node.dataset.setting];
      if (typeof text === 'string') node.textContent = text;
    }
    const opacity = Number(content.opacity);
    if (Number.isFinite(opacity) && opacity >= 15 && opacity <= 100) document.documentElement.style.setProperty('--panel-alpha', String(opacity / 100));
    if (typeof content.background === 'string' && content.background.trim()) {
      const url = new URL(content.background, window.location.origin);
      if (url.protocol === 'https:' || url.protocol === 'http:') {
        const style = document.createElement('style');
        style.id = 'cms-background';
        style.textContent = 'body:before,body[data-category]:before{background-image:linear-gradient(#fbf5e84d,#fbf5e830),url(' + JSON.stringify(url.href) + ')}';
        document.head.append(style);
      }
    }
  } catch (error) {
    // HTML includes the last exported content, so the page remains readable.
    console.warn('Showing the saved page while online content is unavailable.', error);
  }
})();

function renderLifeStagePhotos(content) {
  const stages = { toddler: 'Toddler', kindergarten: 'Kindergarten', primary: 'Primary / Elementary School', 'high-school': 'High School', college: 'College', university: 'University' };
  const style = document.createElement('style');
  style.id = 'life-stage-photo-styles';
  style.textContent = '.life-stage-photos{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin:0 0 24px}.life-stage-photos a{display:block;min-width:0;padding:9px;background:rgb(255 250 240 / var(--panel-alpha,.55));border:1px solid #d9d3be;border-radius:5px}.life-stage-photos img{width:100%;height:auto;max-height:480px;aspect-ratio:4/3;object-fit:contain;display:block;background:#e3e9d54d;border-radius:2px}.life-stage-photos a:only-child{max-width:650px;grid-column:1/-1}.life-stage-photos a:focus-visible{outline:3px solid #b88636;outline-offset:4px}@media(max-width:620px){.life-stage-photos{grid-template-columns:1fr;gap:12px}}';
  document.getElementById('life-stage-photo-styles')?.remove();
  document.head.append(style);
  for (const [stage, label] of Object.entries(stages)) {
    const section = document.getElementById('life-' + stage);
    if (!section) continue;
    section.querySelector('.life-stage-photos')?.remove();
    const selected = content.stagePhotos?.[stage];
    const photos = Array.isArray(selected) ? selected : typeof selected === 'string' && selected ? [selected] : [];
    const gallery = document.createElement('div'); gallery.className = 'life-stage-photos';
    gallery.setAttribute('role', 'group'); gallery.setAttribute('aria-label', label + ' photographs');
    for (const [index, photo] of photos.entries()) {
      if (typeof photo !== 'string' || !photo.trim()) continue;
      let url; try { url = new URL(photo, window.location.origin); } catch { continue; }
      if (!['http:', 'https:'].includes(url.protocol)) continue;
      const link = document.createElement('a'); link.href = url.href; link.target = '_blank'; link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label', 'Open ' + label + ' photo ' + (index + 1));
      const image = document.createElement('img'); image.src = url.href; image.alt = label + ' memory, photo ' + (index + 1); image.loading = 'lazy'; image.decoding = 'async';
      link.append(image); gallery.append(link);
    }
    if (gallery.children.length) section.querySelector('[data-life-stage]')?.before(gallery);
  }
}

function renderHomePortrait(content) {
  const about = document.querySelector('#about');
  if (!about) return;
  let column = about.querySelector('.about-portrait-column');
  column?.querySelector('.about-portrait')?.remove();
  if (typeof content.portrait !== 'string' || !content.portrait.trim()) return;
  let url; try { url = new URL(content.portrait, location.origin); } catch { return; }
  if (!['http:', 'https:'].includes(url.protocol)) return;
  if (!column) {
    const label = about.querySelector(':scope > .section-number');
    if (!label) return;
    column = document.createElement('div'); column.className = 'about-portrait-column';
    label.before(column); column.append(label);
  }
  const figure = document.createElement('figure'); figure.className = 'about-portrait';
  const image = document.createElement('img'); image.src = url.href; image.alt = content.portraitAlt || 'Vivian Ong'; image.loading = 'lazy'; image.decoding = 'async';
  figure.append(image); column.append(figure);
  if (!document.getElementById('about-portrait-style')) {
    const style = document.createElement('style'); style.id = 'about-portrait-style';
    style.textContent = '.about-portrait{max-width:260px;margin:28px 0 0;padding:10px;background:rgb(255 250 240 / var(--panel-alpha,.55));border:1px solid #d9d3be;border-radius:4px;box-shadow:2px 5px 18px #314b3512}.about-portrait img{display:block;width:100%;height:auto;max-height:none;object-fit:contain;border-radius:2px}.about-portrait-column{min-width:0}@media(max-width:620px){.about-portrait{max-width:240px;margin-top:24px}}';
    document.head.append(style);
  }
}

function renderHeroPortrait(content) {
  const visual = document.querySelector('.hero .visual');
  if (!visual) return;
  visual.querySelector('.hero-portrait')?.remove();
  const source = content.heroPortrait || content.portrait;
  if (typeof source !== 'string' || !source.trim()) return;
  let url; try { url = new URL(source, location.origin); } catch { return; }
  if (!['http:', 'https:'].includes(url.protocol)) return;
  const figure = document.createElement('figure'); figure.className = 'hero-portrait';
  const image = document.createElement('img'); image.src = url.href; image.alt = content.heroPortraitAlt || content.portraitAlt || 'Vivian Ong'; image.decoding = 'async'; image.fetchPriority = 'high'; image.width = 220; image.height = 220;
  figure.append(image); visual.prepend(figure); visual.removeAttribute('role'); visual.removeAttribute('aria-label');
  if (!document.getElementById('hero-portrait-style')) {
    const style = document.createElement('style'); style.id = 'hero-portrait-style';
    style.textContent = '.hero .hero-portrait{position:absolute;left:-18px;top:100px;width:220px;height:220px;aspect-ratio:1;margin:0;overflow:hidden;border:6px solid #fff9e8;border-radius:50%;background:#e3e9d5;box-shadow:0 8px 28px #304a3526;z-index:1}.hero .hero-portrait img{display:block;width:100%;height:100%;object-fit:cover;object-position:center 35%;border-radius:50%}@media(max-width:900px){.hero .hero-portrait{left:0;top:110px;width:180px;height:180px}}@media(max-width:620px){.hero .visual:has(.hero-portrait){height:420px}.hero .hero-portrait{left:12px;top:95px;width:170px;height:170px}}';
    document.head.append(style);
  }
}

function renderMeetVersions(content) {
  const visual = document.querySelector('.hero .visual');
  if (!visual) return;
  visual.querySelector('.hero-portrait')?.remove();
  visual.querySelector('.meet-versions')?.remove();
  document.querySelector('#meet-version-dialog')?.remove();
  visual.removeAttribute('role'); visual.removeAttribute('aria-label');
  const section = document.createElement('section'); section.className = 'meet-versions';
  const question = document.createElement('h2'); question.textContent = 'which version of me did you meet when you first got to know me?';
  section.append(question);
  const grid = document.createElement('div'); grid.className = 'meet-grid'; section.append(grid);
  const dialog = document.createElement('dialog'); dialog.id = 'meet-version-dialog'; dialog.setAttribute('aria-labelledby', 'meet-version-title');
  const close = document.createElement('button'); close.type = 'button'; close.textContent = 'Close ×'; close.className = 'meet-close'; close.onclick = () => dialog.close();
  const title = document.createElement('h2'); title.id = 'meet-version-title';
  const photo = document.createElement('img'); photo.className = 'meet-full-photo';
  const message = document.createElement('p'); message.className = 'meet-message';
  dialog.append(close, title, photo, message); document.body.append(dialog);
  dialog.addEventListener('click', event => { const r = dialog.getBoundingClientRect(); if (event.target === dialog && (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom)) dialog.close(); });
  let trigger; dialog.addEventListener('close', () => trigger?.focus());
  const safePhoto = value => { if (typeof value !== 'string' || !value.trim()) return ''; try { const url = new URL(value, location.origin); return ['http:', 'https:'].includes(url.protocol) ? url.href : ''; } catch { return ''; } };
  for (let index = 0; index < 4; index++) {
    const version = content.meetVersions?.[index] || {};
    const label = typeof version.label === 'string' && version.label.trim() ? version.label : 'Version ' + (index + 1);
    const source = safePhoto(version.photo);
    const button = document.createElement('button'); button.type = 'button'; button.className = 'meet-version'; button.setAttribute('aria-haspopup', 'dialog');
    const circle = document.createElement('span'); circle.className = 'meet-circle';
    if (source) { const image = document.createElement('img'); image.src = source; image.alt = ''; image.width = 112; image.height = 112; circle.append(image); }
    else { circle.textContent = String(index + 1).padStart(2, '0'); circle.setAttribute('aria-hidden', 'true'); }
    const caption = document.createElement('span'); caption.textContent = label;
    button.append(circle, caption); grid.append(button);
    button.onclick = () => { trigger = button; title.textContent = label; message.textContent = typeof version.message === 'string' && version.message.trim() ? version.message : 'A little more about this version of me, coming soon.'; photo.hidden = !source; if (source) { photo.src = source; photo.alt = label; } else photo.removeAttribute('src'); dialog.showModal(); };
  }
  visual.prepend(section);
  if (!document.getElementById('meet-versions-style')) {
    const style = document.createElement('style'); style.id = 'meet-versions-style';
    style.textContent = '.hero .visual:has(.meet-versions){height:560px;display:block;width:100%;max-width:none}.hero .visual:has(.meet-versions):before{display:none}.meet-versions{position:relative;z-index:1;padding:12px 8px}.meet-versions h2{font:28px/1.2 Caveat,cursive;letter-spacing:0;text-align:center;margin:0 auto 22px;max-width:360px}.meet-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px 12px;max-width:330px;margin:auto}.meet-version{font:13px/1.4 inherit;color:#2f493c;background:none;border:0;padding:0;cursor:pointer;display:flex;align-items:center;flex-direction:column;gap:9px;overflow-wrap:anywhere}.meet-circle{width:112px;height:112px;border-radius:50%;border:5px solid #fff9e8;background:#e0e8d7;box-shadow:0 6px 20px #304a3526;overflow:hidden;display:grid;place-items:center;font:32px Georgia,serif;transition:transform .2s}.meet-circle img{width:100%;height:100%;object-fit:cover;display:block}.meet-version:hover .meet-circle{transform:translateY(-3px)}.meet-version:focus-visible{outline:3px solid #315d43;outline-offset:5px;border-radius:8px}.visual:has(.meet-versions) .travel-note{position:absolute;bottom:0;right:0}#meet-version-dialog{box-sizing:border-box;width:min(460px,90vw);max-height:85dvh;overflow:auto;background:#fff9ed;color:#2f493c;border:1px solid #b9c7ab;border-radius:20px;padding:26px;box-shadow:0 20px 80px #20352455}#meet-version-dialog::backdrop{background:#20352488}#meet-version-dialog h2{font-size:28px;margin:18px 0}.meet-close{display:block;margin-left:auto;border:1px solid #9eaf93;background:#edf2e4;border-radius:20px;padding:8px 14px;cursor:pointer;color:inherit}.meet-full-photo{display:block;max-width:100%;max-height:300px;width:auto;height:auto;margin:auto;object-fit:contain;border-radius:8px}.meet-full-photo[hidden]{display:none}.meet-message{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.7}@media(max-width:620px){.hero .visual:has(.meet-versions){height:580px}.meet-versions{padding:0}.meet-versions h2{font-size:26px}.meet-circle{width:106px;height:106px}}';
    document.head.append(style);
  }
}

// Accept song links, never user-supplied iframe HTML.
function musicEmbed(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  let url; try { url = new URL(value.trim()); } catch { return null; }
  if (url.protocol !== 'https:' || url.username || url.password) return null;
  if (url.hostname === 'open.spotify.com') {
    const match = url.pathname.match(/^\/(?:intl-[a-z]+\/)?(?:embed\/)?track\/([A-Za-z0-9]{22})\/?$/);
    return match ? { src: 'https://open.spotify.com/embed/track/' + match[1], provider: 'Spotify', link: 'https://open.spotify.com/track/' + match[1] } : null;
  }
  let id;
  if (url.hostname === 'youtu.be') id = url.pathname.slice(1);
  else if (['youtube.com','www.youtube.com','m.youtube.com','www.youtube-nocookie.com'].includes(url.hostname)) {
    id = url.pathname === '/watch' ? url.searchParams.get('v') : url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)\/?$/)?.[1];
  }
  return /^[A-Za-z0-9_-]{11}$/.test(id || '') ? { src: 'https://www.youtube-nocookie.com/embed/' + id, provider: 'YouTube', link: 'https://www.youtube.com/watch?v=' + id } : null;
}
function renderPageMusic(content) {
  document.getElementById('page-music')?.remove();
  document.getElementById('page-music-style')?.remove();
  const embed = musicEmbed(content.text?.['music-url']);
  if (!embed) return;
  const anchor = document.querySelector('.hero .eyebrow, .chapter-intro .eyebrow'); if (!anchor) return;
  const section = document.createElement('div'); section.id = 'page-music';
  const button = document.createElement('button'); button.type = 'button'; button.className = 'music-toggle'; button.textContent = '▶ play me!'; button.setAttribute('aria-expanded','false'); button.setAttribute('aria-controls','music-mini-player');
  const panel = document.createElement('div'); panel.id = 'music-mini-player'; panel.hidden = true; panel.setAttribute('role','region');
  const title = content.text?.['music-title']?.trim() || 'A song for this chapter'; panel.setAttribute('aria-label',title); button.title = title;
  const heading = document.createElement('p'); heading.className = 'music-mini-title'; heading.textContent = title;
  const close = document.createElement('button'); close.type = 'button'; close.className = 'music-mini-close'; close.textContent = 'Close ×';
  const link = document.createElement('a'); link.href = embed.link; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = 'Open in ' + embed.provider + ' ↗';
  panel.append(heading,close,link); section.append(button,panel); anchor.before(section);
  let frame, spotifyController, requested = false;
  function setOpen(open) {
    panel.hidden = !open; button.setAttribute('aria-expanded',String(open));
  }
  const hint = document.createElement('p'); hint.className = 'music-play-hint'; hint.textContent = 'If the song does not start, press play in the player below.';
  panel.insertBefore(hint,link);
  function makeFrame(autoplay) {
    frame = document.createElement('iframe'); frame.src = embed.src + (embed.provider === 'YouTube' ? '?autoplay=' + (autoplay ? '1' : '0') + '&playsinline=1' : ''); frame.title = title + ' — ' + embed.provider; frame.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture'; frame.allowFullscreen = true; frame.referrerPolicy = 'strict-origin-when-cross-origin'; frame.height = embed.provider === 'Spotify' ? '152' : '200'; panel.insertBefore(frame,hint);
  }
  button.onclick = () => {
    setOpen(true);
    if (spotifyController) { spotifyController.play(); return; }
    if (requested) { frame?.focus(); return; }
    requested = true;
    if (embed.provider === 'YouTube') { makeFrame(true); return; }
    const mount = document.createElement('div'); panel.insertBefore(mount,hint);
    const fallback = () => { if (!section.isConnected || spotifyController || frame) return; mount.remove(); makeFrame(false); };
    const timeout = setTimeout(fallback, 10000);
    loadSpotifyEmbedApi().then(api => {
      if (!section.isConnected || frame) return;
      api.createController(mount, { uri: 'spotify:track:' + embed.link.split('/').pop(), width: '100%', height:152 }, controller => {
        if (!section.isConnected) { controller.destroy?.(); return; }
        clearTimeout(timeout); spotifyController = controller;
        controller.addListener('ready', () => { try { controller.play(); } catch { /* Native player stays available. */ } });
        try { controller.play(); } catch { /* The ready event retries once initialized. */ }
      });
    }).catch(() => { clearTimeout(timeout); fallback(); });
  };
  close.onclick = () => { setOpen(false); button.focus(); };
  section.addEventListener('keydown',event => { if(event.key === 'Escape') { setOpen(false); button.focus(); } });
  const style = document.createElement('style'); style.id = 'page-music-style';
  style.textContent = '#page-music{box-sizing:border-box;position:relative;z-index:4;width:100%;padding:0;margin:0 0 18px;display:block}.music-toggle{font:13px/1.2 system-ui,sans-serif;color:#315d43;background:#fff9edd9;border:1px solid #b9c7ab;border-radius:24px;padding:10px 15px;min-height:40px;cursor:pointer;box-shadow:0 2px 8px #304a3510}.music-toggle:focus-visible,.music-mini-close:focus-visible{outline:3px solid #315d43;outline-offset:3px}#music-mini-player{box-sizing:border-box;position:relative;margin-top:10px;width:340px;max-width:100%;padding:16px;background:#fff9ed;border:1px solid #bcc9af;border-radius:16px;box-shadow:0 10px 35px #304a3533}#music-mini-player[hidden]{display:none}.music-mini-title{font:16px/1.5 Georgia,serif;color:#315d43;margin:0 55px 16px 0;overflow-wrap:anywhere}.music-mini-close{position:absolute;right:12px;top:12px;border:0;background:none;color:#315d43;font-size:12px;cursor:pointer}#music-mini-player iframe{display:block;border:0;border-radius:10px;width:100%;margin:0 0 12px}#music-mini-player a{font-size:12px;color:#315d43}.music-play-hint{font:12px/1.5 system-ui,sans-serif;color:#596b5e;margin:8px 0}'; document.head.append(style);
}

function loadSpotifyEmbedApi() {
  if (window.vivianSpotifyEmbedApi) return window.vivianSpotifyEmbedApi;
  window.vivianSpotifyEmbedApi = new Promise((resolve,reject) => {
    const previous = window.onSpotifyIframeApiReady;
    window.onSpotifyIframeApiReady = api => { resolve(api); if (typeof previous === 'function') previous(api); };
    const script = document.createElement('script'); script.src = 'https://open.spotify.com/embed/iframe-api/v1'; script.onerror = () => reject(new Error('Spotify player could not load')); document.head.append(script);
  });
  return window.vivianSpotifyEmbedApi;
}

function renderConnectPage(content, container = document.querySelector('#contact-groups')) {
  if (!container) return;
  container.replaceChildren();
  const icons = {
    instagram:'<rect x="4" y="4" width="24" height="24" rx="7" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="16" cy="16" r="6" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="24" cy="8.5" r="1.6"/>',
    linkedin:'<rect x="3" y="3" width="26" height="26" rx="4"/><text x="7" y="24" fill="white" font-family="Arial,sans-serif" font-size="23" font-weight="bold">in</text>',
    gmail:'<path d="M3 25V8l13 10L29 8v17" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><path d="m3 8 13 10L29 8" fill="none" stroke="#b34b40" stroke-width="4"/>',
    phone:'<path d="m9 4 5 7-4 4c2 4 3 5 7 7l4-4 7 5c-2 6-5 7-10 4C10 23 5 18 3 10 2 6 5 4 9 4Z"/>',
    facebook:'<circle cx="16" cy="16" r="14"/><text x="11" y="29" fill="white" font-family="Arial,sans-serif" font-size="29" font-weight="bold">f</text>',
    snapchat:'<path d="M10 13c-2-10 14-10 12 0 0 3 1 4 5 6-1 2-3 2-4 3l-1 3-4-1-2 1-2-1-4 1-1-3c-1-1-3-1-4-3 4-2 5-3 5-6Z" fill="none" stroke="currentColor" stroke-width="2"/>',
    other:'<path d="m13 10 3-3c7-7 16 2 9 9l-3 3M19 22l-3 3C9 32 0 23 7 16l3-3m1 8 10-10" fill="none" stroke="currentColor" stroke-width="3"/>'
  };
  for (const group of Array.isArray(content.groups) ? content.groups : []) {
    const section = document.createElement('section'); section.className = 'contact-group';
    const heading = document.createElement('h2'); heading.textContent = group.title || 'Connect with me'; section.append(heading);
    const grid = document.createElement('div'); grid.className = 'contact-grid'; section.append(grid);
    for (const item of Array.isArray(group.links) ? group.links : []) {
      if (item.visible === false) continue;
      let url; try { url = new URL(item.url); if (!['https:','http:','mailto:','tel:'].includes(url.protocol) || url.username || url.password) url = null; } catch { url = null; }
      const card = document.createElement(url ? 'a' : 'div'); card.className = 'contact-circle-card';
      if (url) { card.href = url.href; if (['https:','http:'].includes(url.protocol)) { card.target = '_blank'; card.rel = 'noopener noreferrer'; } }
      const circle = document.createElement('span'); circle.className = 'contact-logo'; circle.dataset.app = item.app || 'other'; circle.setAttribute('aria-hidden','true');
      let logo; try { if(item.logo) { const u = new URL(item.logo,location.origin); if(['https:','http:'].includes(u.protocol)) logo = u.href; } } catch {}
      if (logo) { const image=document.createElement('img');image.src=logo;image.alt='';image.width=40;image.height=40;circle.append(image); }
      else { const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 32 32');svg.innerHTML=icons[item.app] || icons.other;circle.append(svg); }
      const label=document.createElement('strong');label.textContent=item.label || item.app || 'Connect';
      const detail=document.createElement('span');detail.className='contact-detail';detail.textContent=item.detail || '';
      card.append(circle,label,detail);
      if(!url){const soon=document.createElement('small');soon.textContent='Link coming soon';card.append(soon);}
      grid.append(card);
    }
    container.append(section);
  }
}
// All existing navigation and home callouts lead to the dedicated page.
for (const link of document.querySelectorAll('a')) {
  if (/let[’']s connect/i.test(link.textContent) || ['#connect','/#connect'].includes(link.getAttribute('href'))) link.setAttribute('href','/connect.html');
}

async function renderHomeConnect() {
  if (document.body.dataset.category) return;
  const section = document.querySelector('#connect'); if (!section) return;
  try {
    const response = await fetch('/connect-content.json', { cache:'no-store' });
    if (!response.ok) throw new Error('Unable to load contact links');
    const content = await response.json();
    if (!Array.isArray(content.groups)) return;
    const container = document.createElement('div'); container.id = 'home-contact-groups';
    renderConnectPage(content, container);
    const previous = section.querySelector('.socials, #home-contact-groups');
    if (previous) previous.replaceWith(container); else section.append(container);
    const intro = section.querySelector('p'); if (intro) intro.textContent = 'Find me around the internet, or send a little hello.';
    let more = section.querySelector('.all-contact-links');
    if (!more) { more = document.createElement('a'); more.className = 'all-contact-links'; more.href = '/connect.html'; more.textContent = 'Let’s connect ↗'; section.append(more); }
    if (!document.getElementById('home-connect-style')) {
      const style = document.createElement('style'); style.id = 'home-connect-style'; style.textContent = ".contact-group{padding:28px;margin:24px 0 36px;border:1px solid var(--line);border-radius:16px;background:var(--panel-cream,#fff9ed8c)}.contact-group h2{font-size:28px}.contact-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:24px}.contact-circle-card{display:flex;flex-direction:column;align-items:center;text-align:center;gap:10px;text-decoration:none;padding:12px 4px;color:#315d43;min-width:0}.contact-logo{display:grid;place-items:center;width:90px;height:90px;border-radius:50%;background:#fffaf0;border:1px solid #b8c8ac;box-shadow:0 4px 14px #304a3515;transition:transform .2s}.contact-logo svg,.contact-logo img{width:40px;height:40px;object-fit:contain;fill:currentColor}.contact-logo[data-app=instagram]{color:#b54e79}.contact-logo[data-app=linkedin],.contact-logo[data-app=facebook]{color:#246398}.contact-logo[data-app=snapchat]{background:#fff5a2;color:#25352b}.contact-circle-card[href]:hover .contact-logo{transform:translateY(-4px)}.contact-detail{font-size:13px;overflow-wrap:anywhere;max-width:100%}.contact-circle-card small{font-size:11px;color:var(--muted)}@media(max-width:620px){.contact-group{padding:22px 16px}.contact-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:20px 10px}.contact-logo{width:78px;height:78px}}#connect:has(#home-contact-groups){display:block}#home-contact-groups{margin-top:24px}#home-contact-groups .contact-group{padding:18px 0;margin:18px 0;background:transparent;border:0;border-radius:0}#home-contact-groups h2{font-size:21px;margin-bottom:18px}#home-contact-groups .contact-grid{grid-template-columns:repeat(auto-fit,minmax(140px,1fr))}#home-contact-groups .contact-logo{width:70px;height:70px}#home-contact-groups .contact-logo svg,#home-contact-groups .contact-logo img{width:32px;height:32px}#connect .all-contact-links{display:inline-block;margin-top:12px;font-size:14px}@media(max-width:620px){#home-contact-groups .contact-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}"; document.head.append(style);
    }
  } catch (error) { console.warn('Showing saved homepage contact links.', error); }
}
renderHomeConnect();
