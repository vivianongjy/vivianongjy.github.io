function formatPostDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return '';
  const date = new Date(value + 'T12:00:00');
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
const journal = document.querySelector('#journal-posts');
const category = document.body.dataset.category;
function element(tag, text, className) {
  const el = document.createElement(tag);
  if (text) el.textContent = text;
  if (className) el.className = className;
  return el;
}
async function loadJournal() {
  try {
    const response = await fetch('/posts.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Unable to load posts');
    const posts = (await response.json()).filter(post => !category || (post.category || 'personal') === category).map(post => ({ ...post, images: Array.isArray(post.images) ? post.images : [] })).sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')) || String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
    if (!journal) {
      for (const card of document.querySelectorAll('[data-section]')) {
        const items = posts.filter(post => (post.category || 'personal') === card.dataset.section);
        card.querySelector('.section-count').textContent = items.length ? `${items.length} ${items.length === 1 ? 'post' : 'posts'}` : 'Stories coming soon';
        if (items.length) card.querySelector('.section-latest').textContent = 'Latest: ' + items[0].title;
      }
      return;
    }
    journal.replaceChildren();
    const stages = new Map([...document.querySelectorAll('[data-life-stage]')].map(node => [node.dataset.lifeStage, node]));
    for (const target of stages.values()) target.replaceChildren(element('p', 'Memories to come.', 'journal-empty'));
    if (stages.size && !posts.some(post => !stages.has(post.lifeStage))) journal.append(element('p', 'More personal stories coming soon.', 'journal-empty'));
    if (!posts.length) {
      journal.append(element('p', 'No posts here yet. New stories coming soon.', 'journal-empty'));
      return;
    }
    for (const post of posts) {
      const article = element('article', '', 'journal-card');
      if (post.images.length) {
        const photos = element('div', '', 'journal-photos');
        for (const [index, src] of post.images.entries()) {
          const link = element('a'); link.href = src; link.target = '_blank'; link.rel = 'noopener';
          link.setAttribute('aria-label', `Open photo ${index + 1} from ${post.title}`);
          const img = element('img'); img.src = src; img.alt = `${post.title}${post.location ? ' — ' + post.location : ''}, photo ${index + 1}`; img.loading = 'lazy';
          link.append(img); photos.append(link);
        }
        article.append(photos);
      }
      const body = element('div', '', 'journal-card-body');
      body.append(element('p', [post.location, formatPostDate(post.date)].filter(Boolean).join(' · '), 'journal-meta'));
      body.append(element('h3', post.title));
      if (post.caption) body.append(element('p', post.caption, 'journal-caption'));
      const target = stages.get(post.lifeStage) || journal;
      target.querySelector('.journal-empty')?.remove();
      article.append(body); target.append(article);
    }
  } catch {
    if (journal) journal.replaceChildren(element('p', 'Stories are taking a moment to load. Please refresh to try again.', 'journal-empty'));
    for (const target of document.querySelectorAll('[data-life-stage]')) target.replaceChildren(element('p', 'Please refresh to load these memories.', 'journal-empty'));
  }
}
loadJournal();
