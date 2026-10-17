const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const scenes = {
  personal: `<path d="M40 165Q160 30 380 95" class="route-line"/><g class="travel-plane"><path d="m0 0 26-9-9 10 8 10-9-4-5 8-2-13-9-2Z" fill="#b36f51"/></g><g transform="rotate(-9 125 135)"><rect x="62" y="84" width="100" height="128" rx="7" fill="#8c4d4c"/><rect x="70" y="92" width="84" height="112" rx="3" fill="none" stroke="#d6ba78"/><circle cx="112" cy="136" r="23" fill="none" stroke="#e7cf93"/><ellipse cx="112" cy="136" rx="10" ry="23" fill="none" stroke="#e7cf93"/><path d="M89 136h46m-42-12h38m-38 24h38" stroke="#e7cf93"/><text x="112" y="183" text-anchor="middle" fill="#f3dfac" font-size="11" letter-spacing="2">MY JOURNEY</text></g><g class="ticket-sway"><rect x="192" y="116" width="195" height="82" rx="7" fill="#fff6df" stroke="#bbaa81"/><path d="M327 116v82" stroke="#bbaa81" stroke-dasharray="4 4"/><text x="207" y="143" fill="#496850" font-size="19" font-family="Georgia">KUL → NYC</text><path d="M207 160h99m-99 8h75m-75 8h86" stroke="#c9bea2"/><path d="M341 138v40m5-40v40m7-40v40m4-40v40m8-40v40m5-40v40m4-40v40" stroke="#6d7d65"/></g><g transform="translate(276 35)"><path d="M0 17h45M8 17V5h25v12" stroke="#678568" stroke-width="3" fill="none"/><rect y="17" width="45" height="49" rx="6" fill="#b9c7a3" stroke="#678568"/><path d="M15 18v48m16-48v48" stroke="#678568"/><circle cx="9" cy="70" r="3" fill="#678568"/><circle cx="35" cy="70" r="3" fill="#678568"/></g>`,
  family: `<ellipse cx="222" cy="215" rx="156" ry="12" fill="#d3dec0"/><path d="M129 115 222 39l96 76" fill="#b8795c" stroke="#7f614d" stroke-width="3"/><path d="M145 112v98h155v-98" fill="#f2deb2" stroke="#af9870" stroke-width="2"/><rect x="203" y="143" width="39" height="67" rx="18" fill="#8f9d73"/><circle cx="232" cy="178" r="3" fill="#f6deb0"/><g class="home-window"><rect x="159" y="133" width="30" height="37" rx="3" fill="#f4c66a" stroke="#8b9168"/><path d="M174 134v36m-15-18h30" stroke="#8b9168"/></g><g class="home-window window-two"><rect x="256" y="133" width="30" height="37" rx="3" fill="#f4c66a" stroke="#8b9168"/><path d="M271 134v36m-15-18h30" stroke="#8b9168"/></g><path d="M106 210v-48m-12 15 12 9 14-17m-14 27-16-8" stroke="#688b5c" stroke-width="3" fill="none"/><circle cx="106" cy="149" r="19" fill="#a8bd87"/><path d="M341 210v-47m-12 17 12 9 14-17" stroke="#688b5c" stroke-width="3" fill="none"/><circle cx="341" cy="149" r="24" fill="#a8bd87"/><path class="home-heart" d="M221 88c-18-14-25-24-16-31 7-5 12 0 16 5 4-5 9-10 16-5 9 7 2 17-16 31Z" fill="#c98b7b"/><path d="M218 210 199 234h48l-12-24" fill="#ded4b6"/>`,
  friends: `<path d="M53 51Q220 100 389 49" stroke="#ae976f" fill="none" stroke-width="2"/><g class="friend-photo photo-one"><path d="M76 67h134v147H76Z" fill="#fffaf0" stroke="#d8cfb4"/><path d="M87 78h112v105H87Z" fill="#d6e3ce"/><circle cx="125" cy="113" r="14" fill="#c59470"/><path d="M104 163v-15q21-37 42 0v15" fill="#718b69"/><circle cx="165" cy="111" r="14" fill="#b58062"/><path d="M145 163v-15q20-35 40 0v15" fill="#cfaa78"/><path d="M118 192h55" stroke="#ad9d7c"/><path d="M140 61v21" stroke="#8e7554" stroke-width="6"/></g><g class="friend-photo photo-two"><path d="M239 63h131v147H239Z" fill="#fffaf0" stroke="#d8cfb4"/><path d="M250 75h109v105H250Z" fill="#dce8e5"/><circle cx="276" cy="110" r="13" fill="#e0b18a"/><circle cx="314" cy="105" r="14" fill="#a8755d"/><path d="M256 160v-12q20-34 40 0v12" fill="#b7806b"/><path d="M293 160v-12q21-38 42 0v12" fill="#78938c"/><path d="M275 191h55" stroke="#ad9d7c"/><path d="M303 64v20" stroke="#8e7554" stroke-width="6"/></g><g class="friend-sparkles" stroke="#c49e62" stroke-width="2"><path d="M218 33v14m-7-7h14M395 146v14m-7-7h14M45 157v14m-7-7h14"/></g>`,
  career: `<ellipse cx="224" cy="220" rx="164" ry="10" fill="#d1dcc7"/><g transform="rotate(-6 120 135)"><rect x="64" y="62" width="112" height="151" rx="12" fill="#6d8975" stroke="#496b56" stroke-width="2"/><rect x="78" y="77" width="84" height="34" rx="3" fill="#e4e8c9"/><text x="151" y="100" text-anchor="end" fill="#496b56" font-family="monospace" font-size="19">1,024.8</text><g fill="#e4e6cf"><rect class="calc-key key-one" x="79" y="126" width="20" height="17" rx="3"/><rect x="110" y="126" width="20" height="17" rx="3"/><rect x="141" y="126" width="20" height="17" rx="3"/><rect x="79" y="153" width="20" height="17" rx="3"/><rect class="calc-key key-two" x="110" y="153" width="20" height="17" rx="3"/><rect x="141" y="153" width="20" height="17" rx="3"/><rect x="79" y="180" width="20" height="17" rx="3"/><rect x="110" y="180" width="20" height="17" rx="3"/><rect class="calc-key key-three" x="141" y="180" width="20" height="17" rx="3"/></g></g><g><rect x="204" y="44" width="184" height="170" rx="5" fill="#fff8e5" stroke="#b6b695"/><text x="221" y="69" fill="#59705a" font-size="11" letter-spacing="1">VALUATION NOTES</text><path d="M224 157h143m-143 0V86" stroke="#99aa89" fill="none"/><g fill="#a4b995"><rect x="238" y="127" width="15" height="29"/><rect x="263" y="118" width="15" height="38"/><rect x="288" y="104" width="15" height="52"/><rect x="313" y="96" width="15" height="60"/><rect x="338" y="86" width="15" height="70"/></g><path class="valuation-line" d="m231 133 28-7 26-17 25 1 23-20 25-10" stroke="#b97b58" stroke-width="3" fill="none"/><text x="221" y="184" fill="#596b52" font-family="Georgia" font-size="13">PV = Σ CFₜ / (1 + i)ᵗ</text><text x="221" y="201" fill="#7a886b" font-size="9">Illustrative cash flows</text></g>`
};
function makeScene(category, small = false) {
  const box = document.createElement('div');
  box.className = 'chapter-animation' + (small ? ' chapter-animation-small' : '');
  box.setAttribute('aria-hidden', 'true');
  box.innerHTML = `<svg viewBox="0 0 440 250" xmlns="http://www.w3.org/2000/svg">${scenes[category]}</svg>`;
  return box;
}
for (const card of document.querySelectorAll('[data-section]')) {
  if (scenes[card.dataset.section]) card.querySelector('h3').before(makeScene(card.dataset.section, true));
}
const chapter = document.body.dataset.category;
if (scenes[chapter]) document.querySelector('.chapter-intro .intro').after(makeScene(chapter));
let paused = reducedMotion.matches;
try { paused = paused || localStorage.getItem('vivian-motion') === 'paused'; } catch {}
for (const scene of document.querySelectorAll('.hero, .chapter-intro')) {
  const sky = document.createElement('div');
  sky.className = 'world-sky'; sky.setAttribute('aria-hidden', 'true');
  for (const name of ['cloud', 'cloud', 'floating-leaf', 'floating-leaf']) {
    const part = document.createElement('span'); part.className = name; sky.append(part);
  }
  scene.prepend(sky);
}
const toggle = document.createElement('button');
toggle.className = 'motion-toggle'; toggle.type = 'button';
function update() {
  document.documentElement.dataset.motion = paused ? 'paused' : 'playing';
  toggle.textContent = paused ? 'Play scenery' : 'Pause scenery';
  toggle.setAttribute('aria-label', paused ? 'Play decorative scenery animations' : 'Pause decorative scenery animations');
}
toggle.addEventListener('click', () => {
  paused = !paused; update();
  try { localStorage.setItem('vivian-motion', paused ? 'paused' : 'playing'); } catch {}
});
reducedMotion.addEventListener('change', event => { if (event.matches) { paused = true; update(); } });
update(); document.body.append(toggle);

// Decorative animations only run when visible. Honor the existing pause control.
if ('IntersectionObserver' in window) {
 const observer = new IntersectionObserver(entries => { for (const entry of entries) entry.target.toggleAttribute('data-offscreen',!entry.isIntersecting); },{rootMargin:'80px'});
 document.querySelectorAll('.chapter-animation,.world-sky').forEach(scene=>observer.observe(scene));
}
function updatePageVisibility(){document.documentElement.toggleAttribute('data-page-hidden',document.hidden);}
document.addEventListener('visibilitychange',updatePageVisibility);updatePageVisibility();

// Visitor appearance preference is separate from owner editing and shared content.
(() => {
 const root=document.documentElement,key='vivian-color-theme';
 const system=window.matchMedia('(prefers-color-scheme: dark)');
 let chosen=null;try{const saved=localStorage.getItem(key);if(saved==='dark'||saved==='light')chosen=saved;}catch{}
 const control=document.createElement('button');control.type='button';control.className='theme-toggle';
 function apply(theme){root.dataset.colorTheme=theme;control.textContent=theme==='dark'?'☀ Light mode':'☾ Dark mode';control.setAttribute('aria-label',theme==='dark'?'Switch to light mode':'Switch to dark mode');control.setAttribute('aria-pressed',String(theme==='dark'));}
 control.addEventListener('click',()=>{chosen=root.dataset.colorTheme==='dark'?'light':'dark';apply(chosen);try{localStorage.setItem(key,chosen);}catch{}});
 system.addEventListener('change',event=>{if(!chosen)apply(event.matches?'dark':'light');});
 window.addEventListener('storage',event=>{if(event.key!==key)return;chosen=['dark','light'].includes(event.newValue)?event.newValue:null;apply(chosen||(system.matches?'dark':'light'));});
 apply(chosen||(system.matches?'dark':'light'));document.body.append(control);
})();

for(const nav of document.querySelectorAll('header nav,.chapter-nav')){if(nav.querySelector('a[href="/business.html"]'))continue;const career=[...nav.querySelectorAll('a')].find(a=>/\/career(?:\.html)?(?:#.*)?$/.test(a.getAttribute('href')||''));if(career){const link=document.createElement('a');link.href='/business.html';link.textContent='Buisness';if(document.body.dataset.category==='business')link.setAttribute('aria-current','page');career.after(link);}}
