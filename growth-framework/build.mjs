// Builds the static site into dist/. Run: node build.mjs
// Each article gets its own URL (/articles/<slug>) with its own title, description and share image.
import { mkdirSync, writeFileSync, readFileSync, rmSync, cpSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { POSTS } from './src/posts.mjs';
import { FOUNDATIONS } from './src/foundations.mjs';

const SITE = 'https://thegrowthframework.live';
const NAME = 'The Growth Framework';
const IG = 'https://www.instagram.com/the_growth_frame_work/';
const HANDLE = '@the_growth_frame_work';
const CONTACT = 'https://ig.me/m/the_growth_frame_work'; // opens an Instagram message
const OUT = 'dist';
// Email sign-up (Supabase). Both values are public by design: the key can only ADD rows to the
// subscribers table (see supabase/subscribers.sql). Leave empty to hide the form.
const SIGNUP = { url: 'https://aibiwpuuslqjzkhzddph.supabase.co', key: 'sb_publishable_e68hLJbVfvZlwlmfbG-6LA_NTSffny_' };

const COLORS = { Mind: 'mind', Body: 'body-p', Money: 'money' };
// Breaking Patterns: articles on behaviour, mistakes, decision-making, FOMO and discipline.
const PATTERNS = ['panic-selling-after-a-market-fall', 'procrastination-is-a-mood-problem', 'fomo-buying-after-the-run', 'sunk-cost-trap', 'discipline-vs-motivation', 'how-habits-form', 'decision-journal', 'crypto-and-psx-risk', 'one-page-trade-plan'];
// Success Stories series, in publishing order (Part 1 first). Add new stories to the end.
const STORIES = ['careem-from-karachi-to-uber', 'airbnb-air-mattresses-to-global', 'jack-dorsey-twitter-square-block', 'elon-musk-risk-and-failure', 'cz-binance-fast-growth-and-rules', 'jensen-huang-nvidia-long-bets', 'jeff-bezos-amazon-long-term'];
const storyPart = slug => STORIES.indexOf(slug) + 1;
// AI & Skills: real use cases and evidence about AI at work, not hype.
const AI_SKILLS = ['why-ai-skills-matter-for-the-future', 'what-research-says-about-ai-at-work', 'how-this-website-was-built-with-ai', 'earning-with-ai-skills-pakistan', 'spotting-fake-ai-claims'];
// Home page picks. FEATURED is the lead story. MOST_READ is hand-picked until real view counts are available.
const FEATURED = 'why-one-framework';
const MOST_READ = ['five-numbers-before-a-psx-stock', 'inflation-explained', 'protein-pakistani-plate', 'how-habits-form', 'gold-in-pakistan-basics'];
const PSX = ['psx-daily-brief-7-october-2026', 'psx-alpha-sector-map-september-2026', 'psx-alpha-company-dossiers-september-2026', 'psx-largest-companies-september-2026', 'dividend-reinvestment-calculator-psx', 'what-is-psx-alpha', 'five-numbers-before-a-psx-stock', 'index-is-not-your-portfolio', 'crypto-and-psx-risk', 'one-page-trade-plan'];
// Topic links on the pillar cards. Each one points at a real page.
const PILLARS = {
  Mind: { key: 'mind', line: 'Discipline, focus and habits that hold up on low days.', topics: [
    ['Discipline beats motivation', 'https://www.instagram.com/p/Dd9UwNLDPtd/'],
    ['Focus blocks and deep work', '/articles/one-focused-block'],
    ['Decision journals and weekly reviews', '/articles/decision-journal']] },
  Body: { key: 'body', line: 'Simple training, sleep and food you can keep for life.', topics: [
    ['Strength training at home', '/articles/strength-twice-a-week'],
    ['Daily walking', '/articles/walk-every-day'],
    ['Sleep, food and longevity', '/articles/longevity-basics']] },
  Money: { key: 'money', line: 'Rules before moods: risk, investing and PSX research.', topics: [
    ['Risk management', '/articles/crypto-and-psx-risk'],
    ['PSX Alpha research', '/psx'],
    ['Long-term planning', '/articles/longevity-and-money']] },
};
const SOCIAL = [
  { n: 'Instagram', h: HANDLE, u: IG, k: 'IG', bg: 'linear-gradient(135deg,#f58529,#dd2a7b,#8134af)' },
  { n: 'Pinterest', h: HANDLE, u: 'https://www.pinterest.com/the_growth_frame_work/', k: 'P', bg: '#e60023' },
  { n: 'Facebook', h: HANDLE, u: 'https://www.facebook.com/the_growth_frame_work', k: 'f', bg: '#1877f2' },
  { n: 'LinkedIn', h: 'Muhammad Waseem Raja', u: 'https://www.linkedin.com/in/muhammad-waseem-raja-848a25323/', k: 'in', bg: '#0a66c2' },
];
const NAV = [['/mind', 'Mind'], ['/body', 'Body'], ['/money', 'Money'], ['/patterns', 'Patterns'], ['/stories', 'Stories'], ['/ai', 'AI & Skills'], ['/psx', 'PSX'], ['/guides', 'Guides'], ['/about', 'About']];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const fmt = d => { const p = d.split('-'); return (+p[2]) + ' ' + MONTHS[p[1] - 1] + ' ' + p[0]; };
const url = path => SITE + (path === '/' ? '/' : path);
const ext = href => href.startsWith('http') ? " target='_blank' rel='noopener'" : '';
const count = name => POSTS.filter(p => p.pillar === name).length;
const postUrl = p => '/articles/' + p.slug;

// Fingerprint assets so browsers pick up changes straight away.
const css = readFileSync('src/styles.css', 'utf8');
const js = readFileSync('src/site.js', 'utf8');
const ver = s => createHash('sha1').update(s).digest('hex').slice(0, 8);
const CSS_HREF = '/assets/styles.css?v=' + ver(css);
const JS_SRC = '/assets/site.js?v=' + ver(js);

function layout({ path, title, description, og = 'default', type = 'website', jsonld, head = '', body }) {
  const full = path === '/' ? title : title + ' · ' + NAME;
  const navHtml = NAV.map(([h, t]) => `<a href="${h}"${path === h || (h !== '/' && path.startsWith(h + '/')) ? ' aria-current="page"' : ''}>${t}</a>`).join('');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(full)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url(path)}">
<meta property="og:site_name" content="${NAME}">
<meta property="og:type" content="${type}">
<meta property="og:title" content="${esc(full)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url(path)}">
<meta property="og:image" content="${SITE}/og/${og}.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="en_PK">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0c0d10">
<link rel="alternate" type="application/rss+xml" title="${NAME}" href="/feed.xml">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%230c0d10'/%3E%3Ccircle cx='22' cy='38' r='9' fill='%23a082ff'/%3E%3Ccircle cx='32' cy='24' r='9' fill='%233ddc84'/%3E%3Ccircle cx='42' cy='38' r='9' fill='%23ffc454'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&family=JetBrains+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="${CSS_HREF}">
<script>document.documentElement.classList.add('js');try{var t=localStorage.getItem('tgf-theme');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}</script>
${head}${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>\n` : ''}</head>
<body>
<header class="top">
  <div class="wrap">
    <a class="brand" href="/" aria-label="${NAME} home"><span class="dots" aria-hidden="true"><i style="background:var(--mind)"></i><i style="background:var(--body)"></i><i style="background:var(--money)"></i></span>${NAME}</a>
    <button class="iconbtn menubtn" id="menuBtn" aria-expanded="false" aria-controls="nav">Menu</button>
    <nav class="nav" id="nav" aria-label="Main">
      ${navHtml}
      <button class="iconbtn" id="themeBtn" type="button" aria-label="Switch light or dark theme">Theme</button>
    </nav>
    <a class="igbtn" href="${IG}" target="_blank" rel="noopener">IG <span>Follow</span></a>
  </div>
</header>
<main id="app">
${body}
</main>
<footer>
  <div class="wrap">
    <div class="fsimple">
      <a class="brand" href="/"><span class="dots" aria-hidden="true"><i style="background:var(--mind)"></i><i style="background:var(--body)"></i><i style="background:var(--money)"></i></span>${NAME}</a>
      <p class="ftag">Mind · Body · Money</p>
      <nav class="flinks" aria-label="Footer"><a href="/about">About</a><a href="/articles">Articles</a><a href="/guides">Guides</a><a href="${CONTACT}" target="_blank" rel="noopener">Contact</a></nav>
      <p class="fplace">Pakistan &amp; South Asia</p>
    </div>
    <p class="fine">© <span id="yr">${new Date().getFullYear()}</span> ${NAME} · Educational content only. Not medical or financial advice.</p>
  </div>
</footer>
<script src="${JS_SRC}" defer></script>
</body>
</html>
`;
}

function shareBar(u0, text, label) {
  const u = encodeURIComponent(u0), x = encodeURIComponent(text);
  return `<div class='share'><b>${label}</b>` +
    `<a href='https://www.facebook.com/sharer/sharer.php?u=${u}' target='_blank' rel='noopener'>Facebook</a>` +
    `<a href='https://www.linkedin.com/sharing/share-offsite/?url=${u}' target='_blank' rel='noopener'>LinkedIn</a>` +
    `<a href='https://pinterest.com/pin/create/button/?url=${u}&amp;description=${x}' target='_blank' rel='noopener'>Pinterest</a>` +
    `<a href='https://wa.me/?text=${x}%20${u}' target='_blank' rel='noopener'>WhatsApp</a></div>`;
}

const chip = p => `<span class='chip'><i></i>${p}</span>`;
const metaLine = p => `<span class='meta'><time datetime='${p.date}'>${fmt(p.date)}</time> · ${p.read} min read</span>`;
const card = p => `<a class='card ${COLORS[p.pillar]}' href='${postUrl(p)}' data-pillar='${p.pillar}'>${chip(p.pillar)}<h3>${esc(p.title)}</h3><p>${esc(p.lede)}</p>${metaLine(p)}</a>`;
const feature = p => `<a class='feature ${COLORS[p.pillar]}' href='${postUrl(p)}'>${chip(p.pillar)}<h3>${esc(p.title)}</h3><p>${esc(p.lede)}</p>${metaLine(p)}</a>`;

function slide(cls, label, cnt, title, extra = '') {
  return `<div class='slide ${cls}'><div class='sc'><b>${label}</b><span>${cnt}</span></div>${title ? `<div class='st'>${title}</div>` : ''}${extra}<div class='sl'>${HANDLE}</div></div>`;
}
function igEmbeds() {
  const E = [
    ['https://www.instagram.com/p/Dd9UwNLDPtd/', slide('mind', 'MIND', '1/7', 'Discipline beats <em>motivation</em>')],
    ['https://www.instagram.com/reel/Dd9U27ejXVO/', slide('mind', 'REEL', '0:10', 'Motivation fades. <em>Habits stay.</em>', "<span class='play'></span>")],
    ['https://www.instagram.com/p/Dd6txghlwSY/', slide('body-p', 'BODY', '1/7', 'Push-ups, <em>done right</em>', "<div class='sub' style='margin-top:10px'>No gym needed. Knee option for beginners.</div>")],
  ];
  return "<div class='embeds'>" + E.map(x => `<blockquote class='instagram-media' data-instgrm-permalink='${x[0]}?utm_source=ig_embed' data-instgrm-version='14'><a href='${x[0]}' target='_blank' rel='noopener' style='padding:0'>${x[1]}<span style='display:block;padding:12px 14px'>View on Instagram →</span></a></blockquote>`).join('') + '</div>';
}
const socials = () => "<div class='socials'>" + SOCIAL.map(s => `<a class='social' href='${s.u}' target='_blank' rel='noopener'><i style='background:${s.bg}'>${s.k}</i><div><b>${s.n}</b><span>${esc(s.h)}</span></div></a>`).join('') + '</div>';

function signupForm(source, heading = 'Get new articles by email') {
  if (!SIGNUP.url || !SIGNUP.key) return '';
  return `<form class='signup' data-url='${SIGNUP.url}' data-key='${SIGNUP.key}' data-source='${source}' novalidate>` +
    `<label for='su-${source}'>${heading}</label>` +
    `<div class='signup-row'><input id='su-${source}' type='email' name='email' autocomplete='email' inputmode='email' placeholder='you@example.com' required maxlength='254'>` +
    `<input class='hp' type='text' name='website' tabindex='-1' autocomplete='off' aria-hidden='true'>` +
    `<button class='btn solid' type='submit'>Sign up</button></div>` +
    `<p class='signup-note' role='status' aria-live='polite'>New articles and free guides. No spam, unsubscribe any time.</p></form>`;
}

function psxBand(withLink, cls = 'block band money') {
  return `<section class='${cls}'><div class='wrap split'><div><span class='chip'><i></i>PSX Alpha</span><h2 style='margin-top:16px'>Research a PSX stock in <span class='acc'>five numbers</span>.</h2><p>PSX Alpha is a simple, repeatable way to look at Pakistan Stock Exchange companies before you read the headlines. Facts first, then opinion.</p>${withLink ? "<div class='ctas'><a class='btn solid' href='/psx'>Explore PSX Alpha</a></div>" : ''}</div>` +
    "<ol class='numbers'><li><div>Earnings per share (EPS) and its trend<small>Is profit per share growing over several years?</small></div></li><li><div>Price-to-earnings (P/E)<small>How much you pay for each rupee of profit.</small></div></li><li><div>Dividend yield and payout<small>Cash returned, and whether it is sustainable.</small></div></li><li><div>Debt against equity<small>How much of the business is borrowed.</small></div></li><li><div>Cash from operations<small>Do reported profits turn into real cash?</small></div></li></ol></div></section>";
}
// Background photos (public/img/<key>.jpg). Missing files are skipped so the page never shows a broken image.
const photo = key => existsSync(`public/img/${key}.jpg`) ? { cls: ' has-photo', style: ` style="--photo:url('/img/${key}.jpg')"` } : { cls: '', style: '' };
const GALLERY = [['yoga', 'Yoga at sunrise'], ['hiking', 'Hiking in the north'], ['longevity', 'Staying active for life']];
const MIND_GALLERY = [['meditate', 'Stillness at sunrise'], ['journal', 'Plan the week on paper'], ['brain', 'Train the mind like a muscle']];
const gallery = (list = GALLERY) => { const g = list.filter(([k]) => existsSync(`public/img/${k}.jpg`)); return g.length ? `<div class='gallery'>${g.map(([k, c]) => `<figure><img src='/img/${k}.jpg' alt='${c}' loading='lazy' decoding='async' width='800' height='450'><figcaption>${c}</figcaption></figure>`).join('')}</div>` : ''; };
// Header photo for articles where one fits.
const ARTICLE_PHOTO = { 'psx-alpha-sector-map-september-2026': 'money', 'psx-alpha-company-dossiers-september-2026': 'money', 'psx-largest-companies-september-2026': 'money', 'dividend-reinvestment-calculator-psx': 'money', 'psx-daily-brief-7-october-2026': 'money', 'why-ai-skills-matter-for-the-future': 'brain', 'what-research-says-about-ai-at-work': 'journal', 'how-this-website-was-built-with-ai': 'mind', 'earning-with-ai-skills-pakistan': 'money', 'spotting-fake-ai-claims': 'brain', 'careem-from-karachi-to-uber': 'money', 'airbnb-air-mattresses-to-global': 'journal', 'jack-dorsey-twitter-square-block': 'brain', 'elon-musk-risk-and-failure': 'mind', 'cz-binance-fast-growth-and-rules': 'money', 'jensen-huang-nvidia-long-bets': 'brain', 'jeff-bezos-amazon-long-term': 'journal', 'fat-loss-myths': 'body', 'panic-selling-after-a-market-fall': 'money', 'pay-yourself-first-system': 'journal', 'fibre-the-missing-nutrient': 'longevity', 'procrastination-is-a-mood-problem': 'journal', 'sleep-debt-explained': 'yoga', 'cardio-vs-strength-training': 'body', 'dividend-yield-explained': 'money', 'fomo-buying-after-the-run': 'brain', 'sunk-cost-trap': 'journal', 'inflation-explained': 'money', 'emergency-fund-first': 'money', 'gold-in-pakistan-basics': 'money', 'protein-pakistani-plate': 'body', 'hydration-in-the-heat': 'hiking', 'how-habits-form': 'journal', 'discipline-vs-motivation': 'meditate', 'longevity-basics': 'longevity', 'walk-every-day': 'hiking', 'strength-twice-a-week': 'body', 'steady-sleep-and-wake-time': 'yoga', 'longevity-and-money': 'longevity', 'one-focused-block': 'mind', 'sunday-review': 'mind', 'decision-journal': 'mind', 'why-one-framework': 'mind', 'what-is-psx-alpha': 'money', 'five-numbers-before-a-psx-stock': 'money', 'index-is-not-your-portfolio': 'money', 'one-page-trade-plan': 'money', 'crypto-and-psx-risk': 'money' };
// Compounding chart: real arithmetic (monthly saving, assumed yearly return), not market data.
function compoundChart() {
  const P = 10000, rate = 0.10 / 12, years = 20, W = 640, H = 300, pad = { l: 56, r: 16, t: 16, b: 34 };
  const pts = [];
  for (let y = 0; y <= years; y++) { const n = y * 12; pts.push({ y, paid: P * n, total: n ? P * (Math.pow(1 + rate, n) - 1) / rate : 0 }); }
  const max = 8e6, x = y => pad.l + (W - pad.l - pad.r) * y / years, yv = v => H - pad.b - (H - pad.t - pad.b) * v / max;
  const area = key => `M${x(0)},${yv(0)} ` + pts.map(p => `L${x(p.y).toFixed(1)},${yv(p[key]).toFixed(1)}`).join(' ') + ` L${x(years)},${yv(0)} Z`;
  const fmt = v => (v / 1e6).toFixed(1) + 'M';
  const t10 = pts[10].total, t20 = pts[20].total;
  return `<figure class='chartfig ccomp'><svg viewBox='0 0 ${W} ${H}' role='img' aria-labelledby='cc-t cc-d'><title id='cc-t'>Saving PKR 10,000 a month at an assumed 10% a year</title><desc id='cc-d'>After 10 years about PKR ${fmt(t10)}, of which PKR 1.2M was paid in. After 20 years about PKR ${fmt(t20)}, of which PKR 2.4M was paid in.</desc>` +
    `<g class='grid'>${[0, 2e6, 4e6, 6e6, 8e6].map(v => `<line x1='${pad.l}' x2='${W - pad.r}' y1='${yv(v)}' y2='${yv(v)}'/><text x='${pad.l - 8}' y='${yv(v) + 4}' text-anchor='end'>${v ? (v / 1e6) + 'M' : '0'}</text>`).join('')}` +
    `${[0, 5, 10, 15, 20].map(y => `<text x='${x(y)}' y='${H - 10}' text-anchor='middle'>${y}y</text>`).join('')}</g>` +
    `<path class='a-total' d='${area('total')}'/><path class='a-paid' d='${area('paid')}'/>` +
    `<circle class='dot' cx='${x(10)}' cy='${yv(t10)}' r='5'/><text class='lbl' x='${x(10) - 6}' y='${yv(t10) - 12}' text-anchor='end'>10 years: PKR ${fmt(t10)}</text>` +
    `<circle class='dot' cx='${x(20)}' cy='${yv(t20)}' r='5'/><text class='lbl' x='${x(20) - 8}' y='${yv(t20) + 22}' text-anchor='end'>20 years: PKR ${fmt(t20)}</text></svg>` +
    `<figcaption><span class='key k-paid'></span>Money you paid in <span class='key k-total'></span>Growth from compounding. Assumes PKR 10,000 a month and a steady 10% yearly return. Real returns vary and can be negative.</figcaption></figure>`;
}
// Small illustrative "price swing" lines for the asset cards.
function swing(kind) {
  const seeds = { stocks: [30, 26, 31, 24, 28, 20, 25, 18, 22, 15, 19, 12, 16, 10], gold: [24, 23, 25, 22, 23, 21, 22, 20, 21, 19, 20, 18, 18, 16], crypto: [34, 12, 28, 6, 30, 18, 38, 4, 24, 10, 32, 2, 20, 8] }[kind];
  const d = seeds.map((v, i) => `${i ? 'L' : 'M'}${(i * 120 / (seeds.length - 1)).toFixed(1)},${v}`).join(' ');
  return `<svg class='swing swing-${kind}' viewBox='0 0 120 40' aria-hidden='true' preserveAspectRatio='none'><path d='${d}'/></svg>`;
}
const line = (style = '') => `<div class='wrap'><div class='line'${style ? ` style='${style}'` : ''}></div></div>`;

// ---------- pages ----------
const pages = [];
const page = (path, file, opts) => pages.push({ path, file, html: layout({ path, ...opts }) });

// Old links used #fragments (e.g. /#five-numbers-before-a-psx-stock). Send them to the new pages.
const LEGACY = { home: '/', ai: '/ai', framework: '/framework', patterns: '/patterns', stories: '/stories', mind: '/mind', body: '/body', money: '/money', psx: '/psx', guides: '/guides', about: '/about', all: '/articles' };
const legacyRedirect = `<script>(function(){var h=location.hash.slice(1);if(!h||h==='latest')return;var R=${JSON.stringify(LEGACY)},S=${JSON.stringify(POSTS.map(p => p.slug))};var t=R[h]||(S.indexOf(h)>=0?'/articles/'+h:null);if(t&&t!=='/')location.replace(t+location.search)})();</script>\n`;

{ // /framework: the full framework story (landing copy supplied by the site owner)
  const venn = `<svg class='venn' viewBox='0 0 400 380' role='img' aria-labelledby='venn-t'><title id='venn-t'>Mind, Body and Money overlap. Growth happens where they meet.</title>` +
    `<g class='rings'><circle class='c-mind' cx='200' cy='130' r='112'/><circle class='c-body' cx='138' cy='240' r='112'/><circle class='c-money' cx='262' cy='240' r='112'/></g>` +
    `<text x='200' y='88' class='vl l-mind'>MIND</text><text x='98' y='282' class='vl l-body'>BODY</text><text x='302' y='282' class='vl l-money'>MONEY</text>` +
    `<text x='200' y='212' class='vl l-you'>YOU</text></svg>`;
  const list = items => `<ul class='chips'>${items.map(t => `<li>${t}</li>`).join('')}</ul>`;
  const P3 = [
    ['Mind', 'mind', 'Think clearly. Build discipline. Understand your patterns.'],
    ['Body', 'body', 'Move better. Eat better. Build a healthier lifestyle.'],
    ['Money', 'money', 'Build financial awareness. Follow rules. Think long term.'],
  ];

  // 1. Hero
  const stars = Array.from({ length: 46 }, (_, i) => { const x = (i * 37.3) % 100, y = (i * 53.7) % 62, d = (i % 7) * .6, s = 1 + (i % 3); return `<i style='left:${x.toFixed(1)}%;top:${y.toFixed(1)}%;width:${s}px;height:${s}px;animation-delay:${d}s'></i>`; }).join('');
  let h = `<section class='hero hero-x'><div class='scifi' aria-hidden='true'><div class='stars'>${stars}</div><div class='horizon'></div><div class='neongrid'></div></div><div class='wrap hero-grid'><div>` +
    `<span class='eyebrow'>The Growth Framework</span>` +
    `<h1 style='margin-top:16px'>Grow Your <span class='m'>Mind.</span> <span class='b'>Body.</span> <span class='y'>Money.</span> Together.</h1>` +
    `<p class='lead'>A practical framework for building a better life — through clearer thinking, a stronger body, and smarter financial decisions.</p>` +
    `<p class='hero-note'>Built for real life. Built for Pakistan and South Asia.</p>` +
    `<div class='ctas'><a class='btn solid' href='#framework'>Explore the Framework</a><a class='btn ghost' href='#start'>Start Your Growth Journey</a></div>` +
    `</div><div class='hero-venn'>${venn}</div></div><div class='giant' aria-hidden='true'>GROW</div></section>`;
  h += line();

  // 2. You need a system
  h += `<section class='block'><div class='wrap'><div class='statement'><h2>You Don't Need Another Motivation Speech.</h2><p class='big-line'>You need a <span class='grad'>system.</span></p>` +
    `<p>Life doesn't improve because we know more.<br>It improves when we turn knowledge into better decisions, better habits, and consistent action.</p>` +
    `<p class='muted'>The Growth Framework brings three areas together:</p>` +
    `<ul class='trio'>${P3.map(([n, k, t]) => `<li class='${COLORS[n]}'><a href='#pillar-${k}'><b>${n}</b><span>${t}</span></a></li>`).join('')}</ul></div></div></section>`;

  // 3. One section per pillar
  const deep = [
    ['Mind', 'mind', 'Change the Pattern Before You Change the Result.',
      ['Your decisions are influenced by habits, emotions, environment, expectations and the way you interpret events.', 'We explore practical ideas around:'],
      ['Discipline', 'Habits', 'Decision-making', 'Psychology', 'Focus', 'Patience', 'Emotional control', 'Personal growth', 'Breaking unhelpful patterns'],
      'Understand yourself. Then build better systems.'],
    ['Body', 'body', 'Your Body Is Part of the Framework.',
      ["A better life isn't only about financial success or mental performance.", 'Your physical health matters too.', 'We focus on practical, sustainable approaches to:'],
      ['Movement', 'Strength', 'Fitness', 'Nutrition', 'Recovery', 'Sleep', 'Healthy routines', 'Long-term wellbeing'],
      'No extreme promises. No shortcuts. Just practical improvement.'],
    ['Money', 'money', 'Make Financial Decisions With Rules, Not Noise.',
      ['Markets are full of opinions.', 'We focus on understanding the principles behind financial decisions.', 'Explore:'],
      ['Investing fundamentals', 'Asset classes', 'Risk management', 'Market behaviour', 'Long-term wealth building', 'Trading psychology', 'Financial mistakes', 'Investment frameworks', 'Pakistan &amp; global markets'],
      'Learn the rules before taking the risk.'],
  ];
  // Floating original quotes for the Mind section, and an illustrative chart for Money.
  const quotes = ['Decide once. Repeat daily.', 'Rules beat moods.', 'Small steps, every day.', 'Progress, not perfection.', 'Calm mind. Clear choices.', 'Do it on the bad days too.'];
  const qrow = quotes.map(q => `<span class='fq'>“${q}”</span>`).join('');
  const floaters = `<div class='ticker' aria-label='Mind principles'><div class='ticker-track'>${qrow}<span class='dup' aria-hidden='true'>${qrow}</span></div></div>`;
  const chart = `<figure class='chartfig'><svg viewBox='0 0 520 260' role='img' aria-labelledby='chart-t'><title id='chart-t'>Illustrative chart of a long-term rising trend with short-term ups and downs</title>` +
    `<defs><linearGradient id='cg' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='var(--money)' stop-opacity='.45'/><stop offset='1' stop-color='var(--money)' stop-opacity='0'/></linearGradient></defs>` +
    `<g class='grid'>${[50, 100, 150, 200].map(y => `<line x1='0' x2='520' y1='${y}' y2='${y}'/>`).join('')}</g>` +
    (() => { // candles: deterministic, gently rising with pullbacks
      const pts = [190, 182, 188, 170, 176, 160, 166, 150, 158, 140, 132, 145, 128, 118, 124, 108, 100, 112, 96, 84, 90, 72, 64, 70, 56];
      let out = '', path = '', area = '';
      pts.forEach((y, i) => {
        const x = 12 + i * 20.5, prev = i ? pts[i - 1] : y + 6, up = y < prev;
        const top = Math.min(y, prev), bot = Math.max(y, prev);
        out += `<line class='wick' x1='${x}' x2='${x}' y1='${top - 8}' y2='${bot + 8}'/><rect class='${up ? 'up' : 'down'}' x='${x - 5}' y='${top}' width='10' height='${Math.max(bot - top, 3)}' rx='2'/>`;
        path += `${i ? 'L' : 'M'}${x},${y - 4}`;
      });
      area = `${path}L${12 + 24 * 20.5},260L12,260Z`;
      return `<path class='area' d='${area}' fill='url(#cg)'/><g class='candles'>${out}</g><path class='trend' d='${path}'/>`;
    })() +
    `</svg><figcaption>Illustration only, not real market data. Long-term trends include many short-term falls.</figcaption></figure>`;

  deep.forEach(([n, k, title, paras, items, close], i) => {
    const ph = photo(k);
    h += `<section class='block pdeep ${COLORS[n]}${i % 2 ? ' band' : ''}${ph.cls}' id='pillar-${k}'${ph.style}><div class='wrap split'>` +
      `<div><span class='chip'><i></i>${n}</span><h2 style='margin-top:16px'>${title}</h2>${paras.map(p => `<p>${p}</p>`).join('')}</div>` +
      `<div>${k === 'money' ? chart : ''}${list(items)}<p class='close-line'>${close}</p><div class='ctas'><a class='btn solid' href='/${k}'>Explore ${n}</a></div></div></div>${k === 'body' ? `<div class='wrap'>${gallery()}</div>` : ''}${k === 'mind' ? `<div class='wrap'>${gallery(MIND_GALLERY)}</div>${floaters}` : ''}</section>`;
  });

  // 3b. Stocks, gold and crypto (summaries; full detail lives on /money)
  const assets = [
    ['Stocks', 'PSX &amp; global', 'Own a small part of real businesses. You earn when profits grow and from dividends. On the PSX you buy through an SECP-licensed broker; funds and ETFs spread your money across many companies.', 'Company and market falls', 3, 'Medium to high', '/money#stocks'],
    ['Gold', 'Priced per tola', "A traditional store of value in Pakistan. In rupees it often rises when the rupee weakens, but it pays no income, can stay flat for years, and jewellery carries making charges you don't get back.", 'Long flat or falling periods', 2, 'Medium', '/money#gold'],
    ['Crypto', 'Trades 24/7', "Digital assets like bitcoin. Prices can swing wildly in a day. Exchanges can fail, accounts get hacked, scams are common, and Pakistan's rules are still changing. Only use money you could lose.", 'Crashes, hacks and scams', 5, 'Very high', '/money#crypto'],
  ];
  h += `<section class='block assets money' id='assets'><div class='wrap'><div class='sechead'><div><span class='chip'><i></i>Money</span><h2 style='margin-top:16px'>Stocks, Gold and Crypto.</h2></div><a href='/money#compare'>Compare them side by side →</a></div>` +
    `<p class='assets-lead'>Three common ways people try to grow money, each with very different rewards and risks. Learn how they work before you put money in.</p><div class='acards'>` +
    assets.map(([t, tag, d, risk, lvl, lvlTxt, href]) => `<a class='acard' href='${href}'><div class='acard-top'><h3>${t}</h3><span class='tag'>${tag}</span></div>${swing(t.toLowerCase())}<p>${d}</p>` +
      `<div class='risk'><span class='risk-label'>Risk: <b>${lvlTxt}</b></span><span class='meter' role='img' aria-label='Risk ${lvl} out of 5'>${[1, 2, 3, 4, 5].map(i => `<i${i <= lvl ? " class='on'" : ''}></i>`).join('')}</span><span class='risk-main'>Main risk: ${risk}</span></div>` +
      `<span class='more'>Learn about ${t.toLowerCase()} →</span></a>`).join('') +
    `</div><p class='meta' style='margin-top:10px'>Price-swing lines are illustrations, not real prices.</p>` +
    `<div class='split compound-row'><div><h3 class='ch-title'>Why time matters more than timing</h3><p>Small, regular amounts grow because returns start earning their own returns. In this example, after 20 years most of the money is growth, not what was paid in.</p><a class='btn ghost' href='/articles/longevity-and-money'>Read: If you may live to 90 →</a></div>${compoundChart()}</div>` +
    `<p class='meta' style='margin-top:18px'>Educational content only. Not financial advice. All investing carries risk, including the loss of capital.</p></div></section>`;

  // 4. The framework
  const fph = photo('brain');
  h += `<section class='block framework-sec${fph.cls}' id='framework'${fph.style}><div class='wrap split'><div><span class='eyebrow'>The Framework</span><h2 style='margin-top:12px'>Three Areas. One Life.</h2>` +
    `<p>Mind, Body and Money are often treated as separate subjects.</p><p class='big-line' style='font-size:clamp(28px,3.4vw,40px)'>They aren't.</p>` +
    `<p>Your financial decisions can affect your stress.<br>Your physical condition can affect your energy.<br>Your habits can affect both.</p>` +
    `<p>That's why The Growth Framework looks at them together.</p></div>` +
    `<ol class='flow'><li class='mind'><b>Mind</b><span>How you think.</span></li><li class='body-p'><b>Body</b><span>How you live.</span></li><li class='money'><b>Money</b><span>How you build and protect resources.</span></li><li class='flow-end'><b>A More Complete Approach to Growth.</b></li></ol></div></section>`;

  // 5. Built for Pakistan & South Asia
  h += `<section class='block band'><div class='wrap split'><div><span class='eyebrow'>Built for Pakistan &amp; South Asia</span>` +
    `<h2 style='margin-top:12px'>Global knowledge. Local context. Practical application.</h2>` +
    `<p>Most personal-development and financial content is created for someone else's environment.</p><p>Our goal is different.</p>` +
    `<p>We want to translate useful ideas into practical conversations relevant to people living in Pakistan and South Asia.</p></div>` +
    `<div><p class='muted'>That means considering:</p>${list(['Local financial realities', "Pakistan's investment environment", 'Regional lifestyle and food habits', 'Cultural expectations', 'Family responsibilities', 'Career realities', 'Financial uncertainty', 'Access to fitness and wellbeing resources'])}</div></div></section>`;

  // 6. Our principle
  h += `<section class='block'><div class='wrap'><div class='statement'><span class='eyebrow'>Our Principle</span><h2 style='margin-top:12px'>Learn. Test. Reflect. Improve.</h2>` +
    `<p>We don't believe every popular idea is automatically correct.</p><p class='muted'>We look for:</p></div>` +
    `<ol class='chain'>${['Evidence', 'Understanding', 'Experimentation', 'Reflection', 'Improvement'].map(t => `<li>${t}</li>`).join('')}</ol>` +
    `<div class='statement'><p>Some ideas will work for you.<br>Some won't.</p><p>The goal isn't perfection.</p><p class='big-line' style='font-size:clamp(26px,3vw,36px)'>The goal is progress that <span class='grad'>compounds.</span></p></div></div></section>`;

  // 7. What you'll find here
  const find = [
    ['Articles', 'Practical ideas about mindset, fitness, investing and everyday decisions.', '/articles', 'mind'],
    ['Guides', 'Simple frameworks that turn complicated subjects into understandable steps.', '/guides', 'body-p'],
    ['Market &amp; Money Education', 'Learn financial concepts without unnecessary jargon.', '/money', 'money'],
    ['Fitness &amp; Wellbeing', 'Practical approaches to building a stronger, healthier lifestyle.', '/body', 'body-p'],
  ];
  h += `<section class='block band'><div class='wrap'><div class='sechead'><h2>What You'll Find Here</h2></div><div class='find'>` +
    find.map(([t, d, href, c]) => `<a class='fcard ${c}' href='${href}'><h3>${t}</h3><p>${d}</p></a>`).join('') + `</div></div></section>`;

  // 8. What it is not
  h += `<section class='block'><div class='wrap'><div class='nots'><p class='not-lead'>Not a get-rich-quick system.</p><p>Not a motivational cult.</p><p>Not financial advice.</p><p>Not a promise of overnight transformation.</p></div>` +
    `<p class='nots-end'>The Growth Framework is about learning how to make better decisions and building systems that can survive real life.</p></div></section>`;

  // 9. Start with one area
  h += `<section class='block band' id='start'><div class='wrap'><div class='statement'><span class='eyebrow'>Start Here</span><h2 style='margin-top:12px'>Start With One Area.</h2><p>You don't have to change everything at once.<br>Choose where you want to begin.</p></div>` +
    `<div class='pcards'>${[['Mind', 'mind', 'Build clarity, discipline and better patterns.'], ['Body', 'body', 'Build movement, fitness and healthier routines.'], ['Money', 'money', 'Build financial knowledge and better decision-making.']]
      .map(([n, k, d]) => `<div class='pcard ${COLORS[n]}'><span class='chip'><i></i>${n}</span><p>${d}</p><a class='btn solid' href='/${k}'>Start With ${n} →</a></div>`).join('')}</div></div></section>`;

  // 10. Closing
  h += `<section class='block closing'><div class='wrap'><span class='eyebrow'>Grow Differently.</span>` +
    `<h2 style='margin-top:14px'>Your life doesn't need another complicated formula.</h2><p class='big-line'>It needs better patterns.<br>Better decisions.<br>Better habits.<br><span class='muted-inline'>Repeated consistently.</span></p>` +
    `<p class='closing-pillars'><span class='m'>Mind.</span> <span class='b'>Body.</span> <span class='y'>Money.</span> Together.</p>` +
    `<div class='ctas' style='justify-content:center'><a class='btn solid' href='#framework'>Explore the Framework</a></div></div></section>`;

  page('/framework', 'framework.html', {
    title: 'The Framework: Mind, Body and Money together',
    description: 'A practical framework for building a better life — through clearer thinking, a stronger body, and smarter financial decisions. Built for Pakistan and South Asia.',
    body: h,
  });
}

{ // home: magazine front page
  const bySlug = s => POSTS.find(p => p.slug === s);
  const num = i => String(i + 1).padStart(2, '0');
  const ph = (p, cls = '') => { const k = ARTICLE_PHOTO[p.slug]; return k && existsSync(`public/img/${k}.jpg`) ? `<img class='${cls}' src='/img/${k}.jpg' alt='' loading='lazy' decoding='async' width='800' height='450'>` : ''; };
  const stars = Array.from({ length: 46 }, (_, i) => { const x = (i * 37.3) % 100, y = (i * 53.7) % 62, d = (i % 7) * .6, s = 1 + (i % 3); return `<i style='left:${x.toFixed(1)}%;top:${y.toFixed(1)}%;width:${s}px;height:${s}px;animation-delay:${d}s'></i>`; }).join('');
  const venn = `<svg class='venn' viewBox='0 0 400 380' role='img' aria-labelledby='venn-h'><title id='venn-h'>Mind, Body and Money overlap. Growth happens where they meet.</title>` +
    `<g class='rings'><circle class='c-mind' cx='200' cy='130' r='112'/><circle class='c-body' cx='138' cy='240' r='112'/><circle class='c-money' cx='262' cy='240' r='112'/></g>` +
    `<text x='200' y='88' class='vl l-mind'>MIND</text><text x='98' y='282' class='vl l-body'>BODY</text><text x='302' y='282' class='vl l-money'>MONEY</text><text x='200' y='212' class='vl l-you'>YOU</text></svg>`;

  // Hero
  let h = `<section class='hero hero-x home-hero'><div class='scifi' aria-hidden='true'><div class='stars'>${stars}</div><div class='horizon'></div><div class='neongrid'></div></div><div class='wrap hero-grid'><div>` +
    `<span class='eyebrow'>The Growth Framework</span>` +
    `<h1 style='margin-top:16px'>Grow Your <span class='m'>Mind.</span> <span class='b'>Body.</span> <span class='y'>Money.</span> Together.</h1>` +
    `<div class='pillbtns'>${[['Mind', 'mind'], ['Body', 'body'], ['Money', 'money']].map(([n, k]) => `<a class='pillbtn ${COLORS[n]}' href='/${k}'><i></i>${n}</a>`).join('')}</div>` +
    `</div><div class='hero-venn'>${venn}</div></div></section>`;

  // Featured
  const f = bySlug(FEATURED) || POSTS[0];
  h += `<section class='block'><div class='wrap'><span class='eyebrow'>Featured</span><a class='featured ${COLORS[f.pillar]}' href='${postUrl(f)}'>${ph(f, 'featured-img')}<div class='featured-body'>${chip(f.pillar)}<h2>${esc(f.title)}</h2><p>${esc(f.lede)}</p><span class='readmore'>Read Article →</span></div></a></div></section>`;

  // Mind, Body, Money: latest four each
  ['Mind', 'Body', 'Money'].forEach((n, i) => {
    const k = PILLARS[n].key, list = POSTS.filter(p => p.pillar === n).slice(0, 4), pp = photo(k);
    h += `<section class='block pillar-latest ${COLORS[n]}${i % 2 ? '' : ' band'}' id='latest-${k}'><div class='wrap pl-grid'>` +
      `<div class='pl-head'><h2 class='pl-title'>${n}</h2><span class='eyebrow'>Latest Articles</span>${pp.cls ? `<div class='pl-photo'${pp.style}></div>` : ''}<a class='viewall' href='/${k}#articles'>View All ${n} Articles →</a></div>` +
      `<ol class='numlist'>${list.map((p, j) => `<li><a href='${postUrl(p)}'><span class='n'>${num(j)}</span><div><h3>${esc(p.title)}</h3><p>${esc(p.lede)}</p></div></a></li>`).join('')}</ol></div></section>`;
  });

  // Breaking Patterns
  const bp = PATTERNS.map(bySlug).filter(Boolean).slice(0, 3), bph = photo('brain');
  h += `<section class='block patterns-sec${bph.cls}'${bph.style}><div class='wrap'><span class='eyebrow'>Breaking Patterns</span><h2 class='sec-title'>Breaking Patterns</h2>` +
    `<p class='sec-lead'>Behaviour, mistakes, decision-making, FOMO, discipline and lessons from real life.</p>` +
    `<div class='bp-cards'>${bp.map(p => `<a class='bp-card' href='${postUrl(p)}'><h3>${esc(p.title)}</h3><span class='meta'>${p.read} min read</span></a>`).join('')}</div>` +
    `<a class='btn solid' href='/patterns' style='margin-top:26px'>Explore Breaking Patterns →</a></div></section>`;

  // Success Stories
  const st = STORIES.map(bySlug).filter(Boolean).slice(-3).reverse();
  h += `<section class='block band stories-sec'><div class='wrap'><span class='eyebrow'>Success Stories</span><h2 class='sec-title'>Success Stories</h2>` +
    `<p class='sec-lead'>Founders who turned small ideas into big companies, told with the setbacks included, and the lessons you can actually use.</p>` +
    `<div class='bp-cards'>${st.map(p => `<a class='bp-card story-card' href='${postUrl(p)}'><span class='part'>Part ${storyPart(p.slug)}</span><h3>${esc(p.title)}</h3><span class='meta'>${p.read} min read</span></a>`).join('')}</div>` +
    `<a class='btn solid' href='/stories' style='margin-top:26px'>Explore Success Stories →</a></div></section>`;

  // AI & Skills
  const ai = AI_SKILLS.map(bySlug).filter(Boolean).slice(0, 3);
  h += `<section class='block ai-sec'><div class='wrap'><span class='eyebrow'>AI &amp; Skills</span><h2 class='sec-title'>AI &amp; Skills</h2>` +
    `<p class='sec-lead'>Real use cases and research on AI at work, not hype. What it does well, where it fails, and how to build skills that last.</p>` +
    `<div class='bp-cards'>${ai.map(p => `<a class='bp-card' href='${postUrl(p)}'><h3>${esc(p.title)}</h3><span class='meta'>${p.read} min read</span></a>`).join('')}</div>` +
    `<a class='btn solid' href='/ai' style='margin-top:26px'>Explore AI &amp; Skills →</a></div></section>`;

  // Practical guides
  h += `<section class='block'><div class='wrap'><span class='eyebrow'>Practical Guides</span><h2 class='sec-title'>Practical Guides</h2><p class='sec-lead'>Longer, evergreen guides you can come back to.</p><div class='gcols'>` +
    ['Mind', 'Body', 'Money'].map(n => { const k = PILLARS[n].key; return `<div class='gcol ${COLORS[n]}'><h3>${n} Guides</h3><ul>${FOUNDATIONS[n].sections.slice(0, 3).map(s => `<li><a href='/${k}#${s.id}'>${s.title}</a></li>`).join('')}</ul></div>`; }).join('') +
    `</div><a class='viewall' href='/guides'>Explore All Guides →</a></div></section>`;

  // Most read + Latest
  const mr = MOST_READ.map(bySlug).filter(Boolean);
  h += `<section class='block band'><div class='wrap split mr-split'><div><span class='eyebrow'>Most Read</span><h2 class='sec-title'>Most Read</h2><ol class='mostread'>${mr.map((p, j) => `<li class='${COLORS[p.pillar]}'><a href='${postUrl(p)}'><span class='n'>${num(j)}</span><b>${esc(p.title)}</b></a></li>`).join('')}</ol></div>` +
    `<div><span class='eyebrow'>Latest</span><h2 class='sec-title'>Latest</h2><ul class='latest'>${POSTS.slice(0, 6).map(p => `<li class='${COLORS[p.pillar]}'><a href='${postUrl(p)}'><i class='dot'></i><b>${esc(p.title)}</b><span class='meta'>${fmt(p.date)} · ${p.pillar}</span></a></li>`).join('')}</ul><a class='viewall' href='/articles'>View All Articles →</a></div></div></section>`;

  // About the framework
  h += `<section class='block'><div class='wrap'><span class='eyebrow'>About the Framework</span><h2 class='sec-title'>Three areas. One life.</h2><div class='whys'>` +
    [['Mind', 'Why Mind?', 'Every result starts with a decision. Clear thinking, discipline and better patterns make every other change possible.'],
     ['Body', 'Why Body?', 'Energy, health and focus come from how you move, eat and sleep. A strong body supports a strong mind.'],
     ['Money', 'Why Money?', 'Financial stress affects sleep, health and choices. Rules and long-term thinking protect your future.']]
      .map(([n, t, d]) => `<div class='why ${COLORS[n]}'><h3>${t}</h3><p>${d}</p></div>`).join('') +
    `</div><div class='ctas'><a class='btn solid' href='/about'>Learn About The Growth Framework →</a><a class='btn ghost' href='/framework'>See the full framework</a></div></div></section>`;

  // Follow the journey
  h += `<section class='block band follow'><div class='wrap follow-grid'><div><span class='eyebrow'>Follow the Journey</span><h2 class='sec-title'>Follow the Journey</h2>` +
    `<p class='follow-handle'><b>Instagram:</b> <a href='${IG}' target='_blank' rel='noopener'>${HANDLE}</a></p><p class='ftag'>Mind · Body · Money</p>` +
    `<a class='btn solid' href='${IG}' target='_blank' rel='noopener'>Follow →</a></div>${signupForm('home', 'Or get new articles by email')}</div></section>`;

  page('/', 'index.html', {
    title: NAME + ' · Grow Your Mind, Body & Money',
    description: 'Practical articles and guides on mind, body and money: discipline, fitness, nutrition, PSX, gold and crypto. Built for Pakistan and South Asia.',
    head: legacyRedirect,
    jsonld: { '@context': 'https://schema.org', '@type': 'WebSite', name: NAME, url: SITE + '/', description: 'Practical articles and guides on mind, body and money for Pakistan and South Asia.', inLanguage: 'en' },
    body: h,
  });
}

{ // AI & Skills
  const list = AI_SKILLS.map(s => POSTS.find(p => p.slug === s)).filter(Boolean);
  let h = `<section class='wrap pagehead'><span class='eyebrow'>Real use, not hype</span><h1 style='margin-top:14px'>AI &amp; Skills</h1><p>How AI is actually used at work, what research shows about where it helps and where it fails, and how to build skills that stay valuable. No income promises, no viral claims.</p></section>${line('margin-top:28px')}`;
  h += `<section class='block'><div class='wrap'><div class='grid'>${list.map(card).join('')}</div>` +
    `<p class='meta' style='margin-top:24px'>AI tools change quickly. Each article shows when it was last checked. Nothing here is a guarantee of income or results.</p>${signupForm('ai', 'Get new AI &amp; Skills articles by email')}</div></section>`;
  page('/ai', 'ai.html', { title: 'AI & Skills: real use cases and evidence, not hype', description: 'What research shows about AI at work, real case studies, earning with AI skills from Pakistan, and how to spot fake AI claims.', body: h });
}

{ // Success Stories series
  const list = STORIES.map(s => POSTS.find(p => p.slug === s)).filter(Boolean);
  let h = `<section class='wrap pagehead'><span class='eyebrow'>A series</span><h1 style='margin-top:14px'>Success Stories</h1><p>How founders turned small ideas into big companies: the problem they saw, the setbacks they faced, and the lessons ordinary readers can use. Based on documented facts, with the failures left in.</p></section>${line('margin-top:28px')}`;
  h += `<section class='block'><div class='wrap'><ol class='series'>${list.map(p => `<li class='${COLORS[p.pillar]}'><a href='${postUrl(p)}'><span class='part'>Part ${storyPart(p.slug)}</span><div><h2>${esc(p.title)}</h2><p>${esc(p.lede)}</p><span class='meta'>${p.read} min read</span></div></a></li>`).join('')}</ol>` +
    `<p class='meta' style='margin-top:24px'>A note on survivorship bias: we hear about the companies that made it, not the many that tried just as hard and failed. These stories are for learning habits and thinking, not proof that any approach guarantees success.</p>${signupForm('stories', 'Get the next story by email')}</div></section>`;
  page('/stories', 'stories.html', { title: 'Success Stories: founders who turned small ideas into big companies', description: 'A series on founders such as Careem, Airbnb, Jack Dorsey, Elon Musk, CZ, Jensen Huang and Jeff Bezos: the problem, the setbacks and the practical lessons.', body: h });
}

{ // Breaking Patterns
  const list = PATTERNS.map(s => POSTS.find(p => p.slug === s)).filter(Boolean);
  const bph = photo('brain');
  let h = `<div class='pagehero${bph.cls}'${bph.style}><section class='wrap pagehead'><span class='eyebrow'>Breaking Patterns</span><h1 style='margin-top:14px'>Breaking Patterns</h1><p>Behaviour, mistakes, decision-making, FOMO, discipline and lessons from real life. Spot the pattern first, then change it.</p></section></div>${line('margin-top:28px')}`;
  h += `<section class='block'><div class='wrap'><div class='grid'>${list.map(card).join('')}</div></div></section>`;
  page('/patterns', 'patterns.html', { title: 'Breaking Patterns: behaviour, FOMO and better decisions', description: 'Articles on behaviour, mistakes, decision-making, FOMO and discipline, with practical ways to break unhelpful patterns.', body: h });
}

for (const name of ['Mind', 'Body', 'Money']) { // pillar pages: foundations guide, then articles
  const P = PILLARS[name], F = FOUNDATIONS[name], list = POSTS.filter(p => p.pillar === name);
  const ph = photo(P.key);
  let h = `<div class='${COLORS[name]}'><div class='pagehero${ph.cls}'${ph.style}><section class='wrap pagehead'>${chip(name)}<h1 style='margin-top:18px'>${name}</h1><p>${F.intro}</p>` +
    `<nav class='toc' aria-label='On this page'>${F.sections.map(s => `<a href='#${s.id}'>${s.title}</a>`).join('')}<a href='#articles'>Articles</a></nav></section></div>${line('margin-top:28px')}`;
  if (name === 'Body' && gallery()) h += `<section class='block' style='padding-bottom:0'><div class='wrap'>${gallery()}</div></section>`;
  h += `<section class='block'><div class='wrap'><div class='fdn'>` +
    F.sections.map((s, i) => `<section class='fdn-sec' id='${s.id}'><div class='fdn-side'><span class='num'>${String(i + 1).padStart(2, '0')}</span><h2>${s.title}</h2><p>${s.line}</p></div><div class='prose'>${s.html.replace('<!--COMPOUND-->', compoundChart())}</div></section>`).join('') +
    `</div><p class='disclaimer'>Educational content only. Not medical or financial advice. Talk to a doctor or a licensed adviser before acting.</p></div></section>`;
  h += `<section class='block band' id='articles'><div class='wrap'><div class='sechead'><h2>${name} articles</h2><a href='/articles'>All articles →</a></div>${list.length ? feature(list[0]) + `<div class='grid'>${list.slice(1).map(card).join('')}</div>` : "<p class='empty'>New articles are on the way.</p>"}</div></section></div>`;
  const topics = F.sections.map(s => s.title.toLowerCase()).join(', ');
  page('/' + P.key, P.key + '.html', { title: `${name}: ${F.sections.map(s => s.title).slice(0, 3).join(', ')}`, description: `${F.intro} Covers ${topics}.`.slice(0, 300), og: P.key, body: h });
}

{ // all articles
  let h = `<section class='wrap pagehead'><span class='eyebrow'>Library</span><h1 style='margin-top:14px'>All articles</h1><p>${POSTS.length} short reads across mind, body and money.</p></section><section class='block' style='padding-top:28px'><div class='wrap'><div class='filters' role='group' aria-label='Filter by pillar'>`;
  for (const n of ['All', 'Mind', 'Body', 'Money']) h += `<button type='button' class='${COLORS[n] || ''}' data-p='${n}' aria-pressed='${n === 'All'}'>${n === 'All' ? '' : "<i class='dot'></i>"}${n}</button>`;
  h += `</div><div class='grid'>${POSTS.map(card).join('')}</div></div></section>`;
  page('/articles', 'articles.html', { title: 'All articles', description: `All ${POSTS.length} articles from ${NAME}: discipline, training, food, money and PSX research.`, og: 'articles', body: h });
}

{ // PSX Alpha
  const list = POSTS.filter(p => PSX.includes(p.slug));
  let h = `<div class='money'><section class='wrap pagehead'><span class='chip'><i></i>PSX Alpha</span><h1 style='margin-top:18px'>PSX Alpha</h1><p>A plain-language method for researching Pakistan Stock Exchange stocks: check the numbers, keep risk rules, and think in years, not days.</p></section>${line('margin-top:28px')}</div>`;
  h += psxBand(false, 'block money');
  h += `<section class='block band'><div class='wrap'><div class='sechead'><h2>PSX Alpha library</h2></div><div class='grid'>${list.map(card).join('')}</div></div></section>`;
  h += `<section class='block'><div class='wrap'><p class='meta'>PSX Alpha is educational research, not a buy or sell recommendation. Markets carry risk. Talk to a licensed adviser before investing.</p></div></section>`;
  page('/psx', 'psx.html', { title: 'PSX Alpha: research a PSX stock in five numbers', description: 'PSX Alpha is a plain-language method for researching Pakistan Stock Exchange stocks: EPS, P/E, dividend yield, debt and cash from operations.', og: 'psx', body: h });
}

{ // guides
  let h = `<section class='wrap pagehead'><span class='eyebrow'>Practical guides</span><h1 style='margin-top:14px'>Guides</h1><p>Longer, evergreen guides for mind, body and money, plus free PDFs for traders and investors.</p></section>${line('margin-top:28px')}`;
  h += `<section class='block'><div class='wrap'><div class='gcols gcols-full'>` + ['Mind', 'Body', 'Money'].map(n => { const k = PILLARS[n].key; return `<div class='gcol ${COLORS[n]}'><h2>${n} Guides</h2><ul>${FOUNDATIONS[n].sections.map(s => `<li><a href='/${k}#${s.id}'><b>${s.title}</b><span>${s.line}</span></a></li>`).join('')}</ul></div>`; }).join('') + `</div></div></section>`;
  h += `<section class='block band'><div class='wrap'><div class='sechead'><h2>Free PDF guides</h2></div><div class='guides'>` +
    `<div class='guide money'><div class='doc'></div><span class='status free'>Free</span><h3>Trading Guidelines</h3><p>Golden rules for PSX and crypto trading, a pre-trade checklist, a trading plan template and a journal format.</p></div>` +
    `<div class='guide money'><div class='doc'></div><span class='status free'>Free</span><h3>Risk Management Guide</h3><p>The 1% rule, position sizing with a PSX example, stop-losses, risk/reward and why big losses are hard to recover.</p></div>` +
    `<div class='guide mind'><div class='doc'></div><span class='status'>Coming soon</span><h3>Trading Journal &amp; Risk Planner</h3><p>A printable journal and planner to log every trade, review your week and keep your risk rules in one place.</p></div>` +
    `</div><div class='how'><h3 style='font-size:24px'>How to get a free guide</h3><ol><li>Open any trading post on <a href='${IG}' target='_blank' rel='noopener'>${HANDLE}</a>.</li><li>Comment <b>GUIDE</b>.</li><li>The PDF is sent to you in your messages.</li></ol></div>${signupForm('guides', 'Or get the guides and new articles by email')}` +
    `<p class='meta' style='margin-top:20px'>Educational content, not financial advice.</p></div></section>`;
  page('/guides', 'guides.html', { title: 'Practical guides: mind, body and money', description: 'Evergreen guides on discipline, exercise, food, vitamins, electrolytes, PSX, stocks, gold and crypto, plus free trading and risk management PDFs.', og: 'guides', body: h });
}

{ // about: what the site is and why
  let h = `<section class='wrap pagehead'><span class='eyebrow'>About</span><h1 style='margin-top:14px'>What <span style='color:var(--mind)'>The Growth Framework</span> is about.</h1><p>A simple, honest system for a better life, built on three pillars that hold each other up: a disciplined mind, a strong body and money with rules.</p></section>${line('margin-top:28px')}`;
  h += `<section class='block'><div class='wrap split'><div><h2>Why this site exists</h2><p>Most advice treats health, mindset and money as separate problems. In real life they are one. A tired body makes worse money decisions. Money stress wrecks sleep and training. A mind without direction drifts on all three.</p><p>The Growth Framework puts them in one place, with one method: decide in advance, keep it small, and review every week. It is written for ambitious, busy people in Pakistan and South Asia who want clear, practical steps instead of hype.</p></div>` +
    `<ul class='facts'>` +
    `<li><b>Mind</b><span>Discipline, ambition and wellness: habits that hold up on low days, clear aims, and the sleep and stress basics that keep you going.</span></li>` +
    `<li><b>Body</b><span>Physical activity, simple exercises, food values and what the body needs: protein, fibre, vitamins and minerals, electrolytes, and an honest look at adaptogens.</span></li>` +
    `<li><b>Money</b><span>Rules before moods: an emergency fund first, then PSX investing, stocks, gold and crypto explained, plus PSX Alpha, our method for researching Pakistani companies.</span></li>` +
    `</ul></div></section>`;
  h += `<section class='block band'><div class='wrap'><div class='sechead'><h2>What you will find here</h2></div><div class='pillars'>` +
    `<a class='pillar mind' href='/articles' style='min-height:0'><h3>Articles</h3><p>Short, sourced reads you can finish in five minutes, each ending with one action.</p></a>` +
    `<a class='pillar body-p' href='/mind' style='min-height:0'><h3>Guides</h3><p>A foundations guide for each pillar, from discipline and sleep to vitamins, electrolytes, PSX, gold and crypto.</p></a>` +
    `<a class='pillar money' href='/psx' style='min-height:0'><h3>PSX Alpha</h3><p>A repeatable way to read a Pakistani company's numbers before you read the headlines.</p></a>` +
    `</div></div></section>`;
  h += `<section class='block'><div class='wrap'><div class='sechead'><h2>How we write</h2></div><div class='pillars'>` +
    `<div class='pillar mind' style='min-height:0'><h3>Sourced</h3><p>Health facts follow trusted sources such as the WHO, NHS, NIH and Mayo Clinic. No made-up numbers.</p></div>` +
    `<div class='pillar body-p' style='min-height:0'><h3>Simple</h3><p>Short sentences, clear steps and one action you can take today.</p></div>` +
    `<div class='pillar money' style='min-height:0'><h3>Honest</h3><p>No miracle cures, no tips and no get-rich promises. Educational content, never medical or financial advice.</p></div>` +
    `</div></div></section>`;
  h += `<section class='block' style='padding-top:0'><div class='wrap'><div class='ctas'><a class='btn solid' href='/framework'>See the full framework →</a></div></div></section>`;
  h += `<section class='block' style='padding-top:0'><div class='wrap'><div class='sechead'><h2>Follow and connect</h2></div>${socials()}</div></section>`;
  page('/about', 'about.html', {
    title: 'About The Growth Framework', description: 'What The Growth Framework is about: one simple system for a better life across mind (discipline, ambition, wellness), body (exercise, nutrition, vitamins, electrolytes) and money (PSX, stocks, gold, crypto).', og: 'about',
    jsonld: { '@context': 'https://schema.org', '@type': 'AboutPage', name: 'About ' + NAME, url: SITE + '/about', about: { '@type': 'Organization', name: NAME, url: SITE + '/', sameAs: SOCIAL.map(s => s.u) } }, body: h,
  });
}

POSTS.forEach((p, i) => { // articles
  const newer = POSTS[i - 1], older = POSTS[i + 1], P = PILLARS[p.pillar];
  let h = `<div class='wrap ${COLORS[p.pillar]}'><article class='article'><nav class='crumbs' aria-label='Breadcrumb'><a href='/'>Home</a> / <a href='/${P.key}'>${p.pillar}</a></nav><div style='margin-top:22px'>${chip(p.pillar)}${storyPart(p.slug) ? ` <a class='serieslabel' href='/stories'>Success Stories · Part ${storyPart(p.slug)}</a>` : ''}</div><h1>${esc(p.title)}</h1>${ARTICLE_PHOTO[p.slug] && existsSync(`public/img/${ARTICLE_PHOTO[p.slug]}.jpg`) ? `<img class='art-photo' src='/img/${ARTICLE_PHOTO[p.slug]}.jpg' alt='' width='1200' height='675' decoding='async'>` : ''}<p class='lede'>${esc(p.lede)}</p><div class='meta'><time datetime='${p.date}'>${fmt(p.date)}</time> · ${p.read} min read · By <a href='/about'>Waseem Raja</a></div><div class='content'>${p.body}${p.sources && p.sources.length ? `<section class='sources'><h2>Sources</h2><ol>${p.sources.map(s => `<li>${esc(s)}</li>`).join('')}</ol></section>` : ''}</div>`;
  if (storyPart(p.slug)) h += `<nav class='seriesnav' aria-label='Success Stories series'><h2>More in the Success Stories series</h2><ol>${STORIES.map(s => POSTS.find(x => x.slug === s)).filter(Boolean).map(x => `<li${x.slug === p.slug ? " aria-current='page'" : ''}><a href='${postUrl(x)}'><span class='part'>Part ${storyPart(x.slug)}</span> ${esc(x.title)}</a></li>`).join('')}</ol></nav>`;
  h += shareBar(url(postUrl(p)), p.title + ' · ' + NAME, 'Share this article');
  h += signupForm('article');
  h += `<p class='disclaimer'>Educational content only. This is not medical or financial advice. Check facts with qualified professionals before you act.</p><nav class='nextprev' aria-label='More articles'>`;
  if (older) h += `<a href='${postUrl(older)}'><span>Older</span><strong>${esc(older.title)}</strong></a>`;
  if (newer) h += `<a href='${postUrl(newer)}'><span>Newer</span><strong>${esc(newer.title)}</strong></a>`;
  h += `</nav></article></div>`;
  page(postUrl(p), 'articles/' + p.slug + '.html', {
    title: p.title, description: p.lede, og: p.slug, type: 'article',
    head: `<meta property="article:published_time" content="${p.date}">\n<meta property="article:section" content="${p.pillar}">\n`,
    jsonld: {
      '@context': 'https://schema.org', '@type': 'BlogPosting', headline: p.title, description: p.lede,
      datePublished: p.date, dateModified: p.date, articleSection: p.pillar, inLanguage: 'en',
      image: `${SITE}/og/${p.slug}.jpg`, mainEntityOfPage: url(postUrl(p)),
      author: { '@type': 'Person', name: 'Waseem Raja', url: SITE + '/about' },
      publisher: { '@type': 'Organization', name: NAME, url: SITE + '/' },
    },
    body: h,
  });
});

pages.push({ path: null, file: '404.html', html: layout({
  path: '/404', title: 'Page not found', description: 'This page could not be found.',
  body: `<section class='wrap pagehead notfound'><span class='eyebrow'>404</span><h1 style='margin-top:14px'>Page not found</h1><p>The page may have moved. Try the latest articles instead.</p><div class='ctas' style='margin-top:28px'><a class='btn solid' href='/articles'>All articles</a><a class='btn ghost' href='/'>Home</a></div></section>`,
}).replace(/<link rel="canonical"[^>]*>\n/, '<meta name="robots" content="noindex">\n') });

// ---------- write ----------
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT + '/articles', { recursive: true });
mkdirSync(OUT + '/assets', { recursive: true });
for (const p of pages) writeFileSync(`${OUT}/${p.file}`, p.html);
writeFileSync(OUT + '/assets/styles.css', css);
writeFileSync(OUT + '/assets/site.js', js);
if (existsSync('public')) cpSync('public', OUT, { recursive: true });

const newest = POSTS.map(p => p.date).sort().at(-1);
const lastmod = path => { const p = POSTS.find(x => postUrl(x) === path); return p ? p.date : newest; };
writeFileSync(OUT + '/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  pages.filter(p => p.path).map(p => `  <url><loc>${url(p.path)}</loc><lastmod>${lastmod(p.path)}</lastmod></url>`).join('\n') + '\n</urlset>\n');
writeFileSync(OUT + '/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
const rfc822 = d => new Date(d + 'T06:00:00+05:00').toUTCString();
writeFileSync(OUT + '/feed.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>\n<title>${NAME}</title>\n<link>${SITE}/</link>\n<atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml"/>\n<description>Better life through mind, body and money.</description>\n<language>en</language>\n` +
  POSTS.map(p => `<item><title>${esc(p.title)}</title><link>${url(postUrl(p))}</link><guid>${url(postUrl(p))}</guid><pubDate>${rfc822(p.date)}</pubDate><category>${p.pillar}</category><description>${esc(p.lede)}</description></item>`).join('\n') + '\n</channel></rss>\n');
// Vercel reads vercel.json from the project's root directory (this folder); copy it into dist/ too for CLI deploys of dist/.
cpSync('vercel.json', OUT + '/vercel.json');

console.log(`Built ${pages.length} pages into ${OUT}/`);
