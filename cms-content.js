// The public site reads content; all editing happens in authenticated Pages CMS.
(async () => {
  const page = document.body.dataset.category || 'home';
  try {
    const response = await fetch('/' + page + '-content.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Unable to load page content');
    const content = await response.json();
    if (page === 'home') renderHomePortrait(content);
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
