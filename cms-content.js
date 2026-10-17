// Public pages read saved content; owner changes are authenticated through GitHub.
(async () => {
  const page = document.body.dataset.category || 'home';
  try {
    const response = await fetch('/' + page + '-content.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Unable to load page content');
    const content = await response.json();
    window.vivianPageDesignContent = content;
    if (page === 'personal') renderLifeStagePhotos(content);
    if (page === 'connect') renderConnectPage(content);
    renderPageMusic(content);
    if (page === 'home') renderHomePortrait(content);
    if (page === 'home') renderMeetVersions(content);

    for (const node of document.querySelectorAll('[data-setting]')) {
      const text = content.text?.[node.dataset.setting];
      if (typeof text === 'string') node.textContent = text;
    }
    const opacity = Number(content.opacity);
    if (Number.isFinite(opacity) && opacity >= 15 && opacity <= 100) document.documentElement.style.setProperty('--panel-alpha', String(opacity / 100));
    if (typeof content.background === 'string' && content.background.trim()) {
      const url = new URL(content.background.replace(/^\/(world|personal|family|friends|career)-background\.png$/, '/$1-background.jpg'), window.location.origin);
      if (url.protocol === 'https:' || url.protocol === 'http:') {
        const style = document.createElement('style');
        style.id = 'cms-background';
        style.textContent = 'body:before,body[data-category]:before{background-image:linear-gradient(#fbf5e84d,#fbf5e830),url(' + JSON.stringify(url.href) + ')}';
        document.head.append(style);
      }
    }
    applyPageDesign(content);
  } catch (error) {
    // HTML includes the last exported content, so the page remains readable.
    console.warn('Showing the saved page while online content is unavailable.', error);
  }
})();

function renderHomePortrait(content) {
  const about = document.querySelector('#about');
  if (!about) return;
  let column = about.querySelector('.about-portrait-column');
  column?.querySelector('.about-portrait')?.remove();
  if (typeof content.portrait !== 'string' || !content.portrait.trim()) return;
  let url; try { url = new URL(content.portrait, location.origin); } catch { return; }
  if (!(['http:', 'https:'].includes(url.protocol) || isInlinePreviewUrl(url))) return;
  if (!column) {
    const label = about.querySelector(':scope > .section-number');
    if (!label) return;
    column = document.createElement('div'); column.className = 'about-portrait-column';
    label.before(column); column.append(label);
  }
  const figure = document.createElement('figure'); figure.className = 'about-portrait';
  const image = document.createElement('img'); image.src = fastDisplayImage(url.href); image.alt = content.portraitAlt || 'Vivian Ong'; image.loading = 'lazy'; image.decoding = 'async';
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
  if (!(['http:', 'https:'].includes(url.protocol) || isInlinePreviewUrl(url))) return;
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
  const safePhoto = value => { if (typeof value !== 'string' || !value.trim()) return ''; try { const url = new URL(value, location.origin); return (['http:', 'https:'].includes(url.protocol) || isInlinePreviewUrl(url)) ? url.href : ''; } catch { return ''; } };
  for (let index = 0; index < 4; index++) {
    const version = content.meetVersions?.[index] || {};
    const label = typeof version.label === 'string' && version.label.trim() ? version.label : 'Version ' + (index + 1);
    const source = safePhoto(version.photo);
    const button = document.createElement('button'); button.type = 'button'; button.className = 'meet-version'; button.setAttribute('aria-haspopup', 'dialog');
    const circle = document.createElement('span'); circle.className = 'meet-circle';
    if (source) { const image = document.createElement('img'); image.src = fastDisplayImage(source); image.decoding = 'async'; image.alt = ''; image.width = 112; image.height = 112; circle.append(image); }
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
      let logo; try { if(item.logo) { const u = new URL(item.logo,location.origin); if(['https:','http:'].includes(u.protocol) || isInlinePreviewUrl(u)) logo = u.href; } } catch {}
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
    window.vivianContactDesignContent=content;
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

function fastDisplayImage(source) {
 const images = {"/uploads/img2027original.jpeg":"/fast-portrait-1.jpg","/uploads/1746454297686.jpeg":"/fast-portrait-2.jpg","/uploads/img0627original-2.jpg":"/fast-portrait-3.jpg","/uploads/img5927.jpg":"/fast-portrait-4.jpg","/uploads/img5928-2.jpg":"/fast-portrait-5.jpg"};
 try { const url = new URL(source,location.origin); return url.origin === location.origin && images[url.pathname] ? images[url.pathname] : source; } catch { return source; }
}

// The owner editor authenticates against GitHub; this link grants no editing access.
if (!document.querySelector('a[data-owner-editor]')) {
 const footer = document.querySelector('footer');
 if (footer) { const link = document.createElement('a'); link.href='/edit.html'; link.textContent='Owner sign-in'; link.dataset.ownerEditor=''; footer.append(link); }
}

function isInlinePreviewUrl(url) { return document.documentElement.hasAttribute('data-inline-editing') && url.protocol === 'blob:' && url.origin === location.origin; }

// Editor code and styles load only when the owner requests Edit mode.
(() => {
 document.querySelectorAll('a[data-owner-editor],a[href="/edit.html"],a[href="/edit"]').forEach(el=>{if(el.closest('footer'))el.remove();});
 const footer=document.querySelector('footer'); if(document.querySelector('[data-inline-entry]'))return;
 if(footer){const copyright=document.createElement('span');copyright.textContent='© 2026 Vivian Ong';const note=document.createElement('span');note.className='footer-note';note.textContent='From Malaysia, with love. Based in NYC.';footer.replaceChildren(copyright,note);}
 const style=document.createElement('style');style.id='floating-owner-style';style.textContent='.owner-edit-floating{position:fixed;right:18px;bottom:64px;z-index:6;font:12px "DM Sans",system-ui,sans-serif;border:1px solid #b4c0a4;background:#fffaf0ed;color:#3c593f;box-shadow:0 3px 15px #314b351a;border-radius:30px;padding:10px 15px;min-height:38px;cursor:pointer}.owner-edit-floating:focus-visible{outline:3px solid #b88636;outline-offset:3px}footer{justify-content:space-between;gap:16px}footer .footer-note{margin-left:auto;text-align:right;justify-content:flex-end}html[data-inline-editing] .owner-edit-floating{display:none}@media(max-width:620px){.owner-edit-floating{right:12px;bottom:58px;font-size:11px}}';document.head.append(style);
 const entry=document.createElement('button');entry.type='button';entry.textContent='Owner edit';entry.dataset.inlineEntry='';entry.className='inline-edit-entry owner-edit-floating';
 let loaded=false;
 entry.onclick=()=>{
   if(loaded){document.dispatchEvent(new Event('vivian-open-inline-editor'));return;}
   if(!document.querySelector('link[data-inline-editor-style]')){const style=document.createElement('link');style.rel='stylesheet';style.href='/inline-editor.css';style.dataset.inlineEditorStyle='';document.head.append(style);}
   entry.disabled=true;const script=document.createElement('script');script.src='/inline-editor.js?v=20261017-photo-upload-fix';script.onload=()=>{loaded=true;entry.disabled=false;};script.onerror=()=>{entry.disabled=false;script.remove();alert('The page editor could not load. Refresh and try again.');};document.head.append(script);
 };document.body.append(entry);
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
      if (!(['http:', 'https:'].includes(url.protocol) || isInlinePreviewUrl(url))) continue;
      const link = document.createElement('a'); link.href = url.href; link.target = '_blank'; link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label', 'Open ' + label + ' photo ' + (index + 1));
      const image = document.createElement('img'); image.src = url.href; image.alt = label + ' memory, photo ' + (index + 1); image.loading = 'lazy'; image.decoding = 'async';
      link.append(image); gallery.append(link);
    }
    if (gallery.children.length) section.querySelector('[data-life-stage]')?.before(gallery);
  }
}


// Saved page appearance uses validated values, never custom HTML or arbitrary CSS.
function designNumber(value,min,max,fallback){const n=Number(value);return value!==''&&Number.isFinite(n)?Math.max(min,Math.min(max,n)):fallback;}
function designColor(value){return typeof value==='string'&&/^#[0-9a-f]{6}$/i.test(value)?value:null;}
function designLink(value){if(typeof value!=='string')return null;if(value.startsWith('#'))return value;try{const u=new URL(value,location.origin);return ['https:','http:','mailto:','tel:'].includes(u.protocol)&&!u.username&&!u.password?u.href:null;}catch{return null;}}
function registerDesignElements(){
 const candidates=document.querySelectorAll('[data-setting],header,footer,main em,main a,main li,main section,header .brand,header nav a,header span,footer a,main strong,main small,main span,main h1,main h2,main h3,main p,main .eyebrow,.section-number,.fact small,.fact strong,.travel-note span,.travel-note small,.caption span,footer>span,main a.button,.back-link,.life-stage-nav a,.chapter-nav a,.section-count,.section-card-top>span,main>section,.facts,.section-grid,.meet-grid,.hero .visual,.about-portrait,.travel-note,.life-stage,.contact-group,.contact-grid,main svg text,#page-music .music-toggle');
 function path(el){if(el.id)return 'id:'+el.id;if(el.dataset.setting)return 'text:'+el.dataset.setting;if(el.dataset.section)return 'chapter:'+el.dataset.section;const parts=[];let current=el;while(current&&current!==document.body){const peers=[...(current.parentElement?.children||[])].filter(node=>node.tagName===current.tagName&&!node.matches('.inline-owner'));parts.unshift(current.tagName.toLowerCase()+':'+(peers.indexOf(current)+1));current=current.parentElement;}return parts.join('/');}
 for(const el of candidates){if(el.closest('.inline-owner,.journal-card,.contact-circle-card,.meet-version,.world-sky')||el.classList.contains('section-latest')||el.id==='year')continue;
 if(!el.dataset.designKey)el.dataset.designKey=path(el);
 const textCandidate=el.matches('a,span,h1,h2,h3,p,small,strong,.eyebrow,.section-number,.travel-note span,.travel-note small,.caption span,footer>span,.section-count,.section-card-top>span,svg text,.music-toggle');
 if(textCandidate&&el.textContent.trim()&&!el.parentElement?.closest('[data-setting]')&&!el.dataset.setting&&!el.querySelector('[data-setting]')&&!el.querySelector('img,svg,button,iframe')&&!el.matches('.contact-group h2')){el.dataset.setting='visual.'+el.dataset.designKey;el.dataset.designText='';}
 }
 return [...document.querySelectorAll('[data-design-key]')].filter(el=>!el.closest('.inline-owner'));
}
function applyPageDesign(content){
 if(!content||typeof content!=='object')return;renderDeckObjects(content);registerDesignElements();
 for(const el of document.querySelectorAll('[data-setting]')){const value=content.text?.[el.dataset.setting];if(typeof value==='string'&&el.textContent!==value)el.textContent=value;}
 const a=content.appearance||{},hero=a.heroCircles||{},contacts=a.contactCircles||{};
 const width=designNumber(a.pageWidth,720,1800,1280),gap=designNumber(a.sectionGap,8,100,28),font=designNumber(a.baseFontSize,12,24,16),align=['left','center','right'].includes(a.textAlign)?a.textAlign:'left';
 let css='body{font-size:'+font+'px}header,main,footer{max-width:'+width+'px}main>.about,main>.journal,main>.connect{scroll-margin-top:30px}.section-grid{gap:'+gap+'px}';
 if(a.textAlign)css+='main h1,main h2,main p{ text-align:'+align+'}';
 const accent=designColor(a.accentColor);if(accent)css+=':root{--green:'+accent+'}.button{background:'+accent+'}';
 const panel=designColor(a.panelColor);if(panel){const rgb=[1,3,5].map(i=>parseInt(panel.slice(i,i+2),16)).join(' ');css+=':root{--panel-cream:rgb('+rgb+' / var(--panel-alpha,.55))}';}
 function circles(settings,target,grid,circle){const columns=designNumber(settings.columns,1,6,target==='hero'?2:4),mobile=designNumber(settings.mobileColumns,1,4,2),size=designNumber(settings.size,48,220,target==='hero'?112:90),spacing=designNumber(settings.gap,0,64,20),justify=['left','center','right'].includes(settings.align)?settings.align:'center',fit=settings.fit==='contain'?'contain':'cover';const margin=justify==='left'?'0 auto 0 0':justify==='right'?'0 0 0 auto':'0 auto';return grid+'{display:grid;grid-template-columns:repeat('+Math.round(columns)+',minmax(0,1fr));gap:'+spacing+'px;max-width:'+((size+spacing)*columns-spacing)+'px;width:100%;margin:'+margin+'}'+circle+'{width:min('+size+'px,100%);height:auto;aspect-ratio:1;justify-self:center}'+circle.split(',').map(s=>s+' img').join(',')+'{object-fit:'+fit+'}@media(max-width:620px){'+grid+'{grid-template-columns:repeat('+Math.round(mobile)+',minmax(0,1fr));max-width:'+((size+spacing)*mobile-spacing)+'px}}';}
 if(a.heroCircles)css+=circles(hero,'hero','.hero .meet-grid','.hero .meet-circle');
 if(a.contactCircles)css+=circles(contacts,'contacts','.contact-grid,#home-contact-groups .contact-grid','.contact-logo,#home-contact-groups .contact-logo');
 if(a.heroCircles){const columns=designNumber(hero.columns,1,6,2),mobile=designNumber(hero.mobileColumns,1,4,2),size=designNumber(hero.size,48,220,112),spacing=designNumber(hero.gap,0,64,20);const height=Math.ceil(4/columns)*(size+spacing+35)+200,mobileHeight=Math.ceil(4/mobile)*(size+spacing+35)+200;css+='.hero .visual:has(.meet-versions){height:'+Math.max(490,height)+'px}@media(max-width:620px){.hero .visual:has(.meet-versions){height:'+Math.max(460,mobileHeight)+'px}}';}
 const x=designNumber(a.backgroundX,0,100,50),y=designNumber(a.backgroundY,0,100,50),sizing=a.backgroundSize==='contain'?'contain':'cover';if(a.backgroundX!==undefined||a.backgroundY!==undefined||a.backgroundSize)css+='body:before,body[data-category]:before{background-position:'+x+'% '+y+'%;background-size:'+sizing+';background-repeat:no-repeat}';
 if(a.backgroundWash!==undefined&&typeof content.background==='string'&&content.background){let u;try{u=new URL(content.background.replace(/^\/(world|personal|family|friends|career)-background\.png$/,'/$1-background.jpg'),location.origin);}catch{}if(u&&(['http:','https:'].includes(u.protocol)||(document.documentElement.hasAttribute('data-inline-editing')&&u.protocol==='blob:'))){const wash=designNumber(a.backgroundWash,0,85,25)/100;css+='body:before,body[data-category]:before{background-image:linear-gradient(rgb(251 245 232 / '+wash+'),rgb(251 245 232 / '+wash+')),url('+JSON.stringify(u.href)+')}';}}
 if(a.hideScenery)css+='.world-sky,.chapter-animation{display:none!important}';
 for(const el of document.querySelectorAll('[data-design-key]')){const settings=a.elements?.[el.dataset.designKey]||{};const rules=[];const n=(name,min,max,suffix='px')=>{if(settings[name]!==undefined&&settings[name]!==''){const value=designNumber(settings[name],min,max,null);if(value!==null)rules.push(name.replace(/[A-Z]/g,m=>'-'+m.toLowerCase())+':'+value+suffix);}};n('fontSize',9,120);n('marginTop',0,160);n('marginBottom',0,160);n('padding',0,100);n('borderRadius',0,120);n('maxWidth',60,1800);n('lineHeight',.8,3,'');const color=designColor(settings.color),background=designColor(settings.backgroundColor);if(color)rules.push('color:'+color);if(background)rules.push('background-color:'+background);if(['left','center','right'].includes(settings.textAlign))rules.push('text-align:'+settings.textAlign);if(settings.hidden)rules.push('display:none!important');if(rules.length)css+='[data-design-key='+JSON.stringify(el.dataset.designKey)+']{'+rules.map(rule=>rule.includes('!important')?rule:rule+'!important').join(';')+'}';if(el.matches('a')){if(!el.dataset.designOriginalHref)el.dataset.designOriginalHref=el.getAttribute('href')||'';el.setAttribute('href',designLink(settings.href)||el.dataset.designOriginalHref);}}
 let style=document.getElementById('saved-page-design');if(!style){style=document.createElement('style');style.id='saved-page-design';document.head.append(style);}if(style.textContent!==css)style.textContent=css;
 if(Array.isArray(a.sectionOrder)){const main=document.querySelector('main');const sections=[...(main?.children||[])].filter(el=>el.matches('section'));const order=[...a.sectionOrder.map(key=>sections.find(el=>el.dataset.designKey===key)).filter(Boolean),...sections.filter(el=>!a.sectionOrder.includes(el.dataset.designKey))];if(order.some((el,index)=>el!==sections[index])){const markers=sections.map(el=>{const marker=document.createComment('section');el.replaceWith(marker);return marker;});markers.forEach((marker,index)=>marker.replaceWith(order[index]));}}
 applyDirectPositions(content);
}
function registerDirectPositions(content){
 registerDesignElements();
 document.querySelectorAll('[data-deck-id]').forEach(el=>el.dataset.positionKey='object:'+el.dataset.deckId);
 document.querySelectorAll('[data-inline-text],[data-setting]').forEach(el=>{if(el.closest('.inline-owner,[data-deck-id]')||el.namespaceURI!=='http://www.w3.org/1999/xhtml')return;el.dataset.positionKey??='text:'+el.dataset.setting;});
 document.querySelectorAll('.meet-version').forEach((el,index)=>el.dataset.positionKey='portrait:'+index);
 const contactData=document.body.dataset.category==='connect'?content:window.vivianContactDesignContent;
 const containers=document.querySelectorAll('#contact-groups,#home-contact-groups');
 containers.forEach(container=>container.querySelectorAll('.contact-group').forEach((group,gi)=>{const source=contactData?.groups?.[gi]?.links||[];const visible=source.map((link,index)=>({link,index})).filter(v=>v.link.visible!==false);group.querySelectorAll('.contact-circle-card').forEach((el,index)=>el.dataset.positionKey='contact:'+gi+':'+(visible[index]?.index??index));}));
 document.querySelectorAll('.section-card,.journal-card,.travel-note,.about-portrait,.contact-group,.life-stage,main>section,.life-stage-photos a').forEach(el=>{if(el.classList.contains('journal-card')&&(el.dataset.inlinePost||el.dataset.postId))el.dataset.positionKey='memory:'+(el.dataset.inlinePost||el.dataset.postId);else if(el.dataset.designKey)el.dataset.positionKey='box:'+el.dataset.designKey;});
 return [...document.querySelectorAll('[data-position-key]')].filter(el=>!el.closest('.inline-owner'));
}
function applyDirectPositions(content){
 applyDeckTransforms(content);
 const small=matchMedia('(max-width:620px)').matches,mode=small?'mobile':'desktop';
 for(const el of registerDirectPositions(content)){
  const point=content.appearance?.positions?.[mode]?.[el.dataset.positionKey];
  if(!point){el.style.removeProperty('translate');if(!document.documentElement.hasAttribute('data-inline-editing')&&!content.appearance?.transforms?.[el.dataset.positionKey]&&el.hasAttribute('data-owner-transform-display')){el.style.removeProperty('display');el.removeAttribute('data-owner-transform-display');}continue;}
  if(getComputedStyle(el).display==='inline'){el.style.display='inline-block';el.dataset.ownerTransformDisplay='';}
  const width=Math.max(1,directPositionBoundary(el).getBoundingClientRect().width),x=designNumber(point.xPercent,-100,100,0)*width/100,y=designNumber(point.y,-2400,2400,0);
  el.style.translate='0px 0px';const boundary=directPositionBoundary(el).getBoundingClientRect(),r=el.getBoundingClientRect();const safeX=Math.max(boundary.left-r.left,Math.min(boundary.right-r.right,x)),safeY=Math.max(boundary.top-r.top,Math.min(boundary.bottom-r.bottom,y));el.style.translate=safeX+'px '+safeY+'px';
 }
}
function directPositionBoundary(el){
 if(el.matches('[data-deck-id]'))return el.parentElement;
 if(el.matches('[data-setting]'))return el.closest('main>section')||el.parentElement;
 if(el.matches('.meet-version'))return el.closest('.visual')||el.parentElement;
 if(el.matches('.contact-circle-card'))return el.closest('.contact-group')||el.parentElement;
 if(el.matches('.section-card,.journal-card,.travel-note,.about-portrait,.contact-group,.life-stage'))return el.closest('main')||el.parentElement;
 
 return el.parentElement;
}

let directResizePending=false;window.addEventListener('resize',()=>{if(directResizePending||document.documentElement.hasAttribute('data-inline-editing'))return;directResizePending=true;requestAnimationFrame(()=>{directResizePending=false;if(window.vivianPageDesignContent)applyDirectPositions(window.vivianPageDesignContent);});});

function renderDeckObjects(content){
 const objects=Array.isArray(content.appearance?.objects)?content.appearance.objects:[],mode=matchMedia('(max-width:620px)').matches?'mobile':'desktop';
 document.querySelectorAll('[data-deck-base-height]').forEach(host=>host.style.minHeight=host.dataset.deckBaseHeight+'px');
 document.querySelectorAll('[data-deck-id]').forEach(el=>{if(!objects.some(object=>object.id===el.dataset.deckId))el.remove();});
 for(const object of objects){if(typeof object.id!=='string'||!/^[a-zA-Z0-9-]{1,80}$/.test(object.id))continue;const host=[...document.querySelectorAll('main>section')].find(el=>el.dataset.designKey===object.host)||document.querySelector('main>section')||document.querySelector('main');if(!host)continue;if(getComputedStyle(host).position==='static')host.style.position='relative';let el=document.querySelector('[data-deck-id="'+object.id+'"]');const source=content.text?.['deck:'+object.id]??object.text??'';const signature=JSON.stringify([object.type,source,object.src,object.alt]);if(!el){el=document.createElement('div');el.className='deck-object';el.dataset.deckId=object.id;el.dataset.designKey='object:'+object.id;el.dataset.positionKey='object:'+object.id;host.append(el);}else if(el.parentElement!==host)host.append(el);
 if(el.dataset.deckSignature!==signature){el.replaceChildren();if(object.type==='image'){let url;try{url=new URL(object.src,location.origin);}catch{}if(url&&(['http:','https:'].includes(url.protocol)||(document.documentElement.hasAttribute('data-inline-editing')&&url.protocol==='blob:'))){const image=document.createElement('img');image.src=url.href;image.alt=object.alt||'Added picture';image.draggable=false;el.append(image);}}else{const text=document.createElement('p');text.dataset.setting='deck:'+object.id;text.className=object.type==='emoji'?'deck-emoji':'deck-text';text.textContent=source;el.append(text);}el.dataset.deckSignature=signature;}
 const box=object[mode]||{},width=designNumber(box.width,40,1200,object.type==='emoji'?90:240),x=designNumber(box.xPercent,0,90,5),y=designNumber(box.y,0,2400,100);el.style.width='min('+width+'px,90%)';el.style.left=x+'%';el.style.top=y+'px';const needed=y+Math.max(el.offsetHeight,el.offsetWidth,object.type==='image'?180:60)+40;const baseline=Number(host.dataset.deckBaseHeight)||host.offsetHeight;if(!host.dataset.deckBaseHeight)host.dataset.deckBaseHeight=baseline;host.style.minHeight=Math.max(baseline,needed,parseFloat(host.style.minHeight)||0)+'px';
 }
 if(!document.getElementById('deck-object-styles')){const style=document.createElement('style');style.id='deck-object-styles';style.textContent='.deck-object{position:absolute;z-index:3;box-sizing:border-box;padding:10px;overflow-wrap:anywhere;max-width:90%}.deck-object p{margin:0;white-space:pre-wrap}.deck-object .deck-text{font-size:20px;line-height:1.5;font-family:inherit;color:inherit}.deck-object .deck-emoji{font:56px/1.2 system-ui,sans-serif}.deck-object img{display:block;width:100%;height:auto;object-fit:contain}';document.head.append(style);}
}
function applyDeckTransforms(content){for(const el of document.querySelectorAll('[data-position-key]')){const value=content.appearance?.transforms?.[el.dataset.positionKey];if(value){if(getComputedStyle(el).display==='inline'){el.style.display='inline-block';el.dataset.ownerTransformDisplay='';}el.style.rotate=designNumber(value.rotation,-180,180,0)+'deg';el.style.transform='none';}else if(el.hasAttribute('data-owner-rotation')){el.style.removeProperty('rotate');el.style.removeProperty('transform');}el.toggleAttribute('data-owner-rotation',Boolean(value));}}

// Refresh saved design after asynchronous galleries or contacts render.
let designRefreshPending=false;
new MutationObserver(records=>{if(document.documentElement.hasAttribute('data-inline-editing')||designRefreshPending||!window.vivianPageDesignContent)return;if(!records.some(record=>record.type==='childList'&&[...record.addedNodes].some(node=>node.nodeType===1&&!node.closest?.('.inline-owner')&&node.tagName!=='STYLE')))return;designRefreshPending=true;requestAnimationFrame(()=>{designRefreshPending=false;applyPageDesign(window.vivianPageDesignContent);});}).observe(document.body,{childList:true,subtree:true});
