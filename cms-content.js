// The public site reads content; all editing happens in authenticated Pages CMS.
(async () => {
  const page = document.body.dataset.category || 'home';
  try {
    const response = await fetch('/' + page + '-content.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Unable to load page content');
    const content = await response.json();
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
