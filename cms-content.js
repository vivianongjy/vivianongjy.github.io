// The public site reads content; all editing happens in authenticated Pages CMS.
(async () => {
  const page = document.body.dataset.category || 'home';
  try {
    const response = await fetch('/' + page + '-content.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Unable to load page content');
    const content = await response.json();
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
