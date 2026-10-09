// Renders share images (1200x630 JPEG) into public/og/ for WhatsApp, Facebook, LinkedIn and X previews.
// Run after adding or renaming an article: node og.mjs   (needs Playwright + Chromium)
import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { POSTS } from './src/posts.mjs';

const require = createRequire(import.meta.url);
let pw;
try { pw = require('playwright'); } catch { pw = require(join(execSync('npm root -g').toString().trim(), 'playwright')); }

const C = { Mind: '#a082ff', Body: '#3ddc84', Money: '#ffc454', Brand: '#a082ff' };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const ITEMS = [
  { name: 'default', label: 'Mind · Body · Money', color: C.Brand, title: 'Better life through <b style="color:#a082ff">mind</b>, <b style="color:#3ddc84">body</b> &amp; <b style="color:#ffc454">money</b>.', raw: true },
  { name: 'mind', label: 'Mind', color: C.Mind, title: 'Discipline, ambition and wellness: the mind behind every habit.' },
  { name: 'body', label: 'Body', color: C.Body, title: 'Exercise, food values, vitamins, minerals and electrolytes.' },
  { name: 'money', label: 'Money', color: C.Money, title: 'PSX, stocks, gold and crypto, explained with rules first.' },
  { name: 'psx', label: 'PSX Alpha', color: C.Money, title: 'Research a PSX stock in five numbers.' },
  { name: 'guides', label: 'Free guides', color: C.Money, title: 'Free trading and risk management guides.' },
  { name: 'about', label: 'About', color: C.Mind, title: 'One framework for a better life: mind, body and money.' },
  { name: 'articles', label: 'Library', color: C.Brand, title: `All ${POSTS.length} articles on mind, body and money.` },
  ...POSTS.map(p => ({ name: p.slug, label: p.pillar, color: C[p.pillar], title: p.title, meta: `${p.read} min read` })),
];

// Fetch the brand fonts once and inline them, so rendering does not depend on the browser's network access.
async function inlineFonts(cssUrl) {
  const css = await (await fetch(cssUrl, { headers: { 'user-agent': 'Mozilla/5.0 Chrome/120' } })).text();
  let out = css;
  for (const [, u] of css.matchAll(/url\((https:[^)]+)\)/g)) {
    const buf = Buffer.from(await (await fetch(u)).arrayBuffer());
    out = out.replace(u, 'data:application/octet-stream;base64,' + buf.toString('base64'));
  }
  return out;
}
const FONTS = await inlineFonts('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=JetBrains+Mono:wght@500&display=block');

const html = it => `<!doctype html><html><head><meta charset="utf-8">
<style>${FONTS}</style>
<style>
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;background:radial-gradient(70% 90% at 100% 0%,${it.color}30,#0c0d10 62%);color:#f0f0ec;font-family:'Bricolage Grotesque',sans-serif;padding:64px 72px;display:flex;flex-direction:column;overflow:hidden}
.top{display:flex;justify-content:space-between;align-items:center}
.brand{display:flex;align-items:center;gap:14px;font-weight:800;font-size:30px;letter-spacing:-.01em}
.dots{display:flex}.dots i{width:22px;height:22px;border-radius:50%;margin-right:-6px;border:3px solid #0c0d10}
.chip{font-weight:700;font-size:22px;letter-spacing:.08em;text-transform:uppercase;color:${it.color};border:3px solid ${it.color};border-radius:999px;padding:6px 20px}
h1{font-weight:800;letter-spacing:-.025em;line-height:1.04;margin-top:auto;font-size:${it.title.length > 60 ? 64 : it.title.length > 40 ? 74 : 86}px;max-width:1040px}
.foot{margin-top:44px;padding-top:22px;border-top:4px solid;border-image:linear-gradient(90deg,#a082ff,#3ddc84,#ffc454) 1;display:flex;justify-content:space-between;font:500 22px 'JetBrains Mono',monospace;color:#a2a4ad}
</style></head><body>
<div class="top"><div class="brand"><span class="dots"><i style="background:#a082ff"></i><i style="background:#3ddc84"></i><i style="background:#ffc454"></i></span>The Growth Framework</div><span class="chip">${esc(it.label)}</span></div>
<h1>${it.raw ? it.title : esc(it.title)}</h1>
<div class="foot"><span>thegrowthframework.live</span><span>${esc(it.meta || '@the_growth_frame_work')}</span></div>
</body></html>`;

mkdirSync('public/og', { recursive: true });
const browser = await pw.chromium.launch();
const pg = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const it of ITEMS) {
  await pg.setContent(html(it), { waitUntil: 'networkidle' });
  await pg.evaluate(() => document.fonts.ready);
  await pg.screenshot({ path: `public/og/${it.name}.jpg`, type: 'jpeg', quality: 86 });
}
await browser.close();
console.log(`Rendered ${ITEMS.length} share images into public/og/`);
