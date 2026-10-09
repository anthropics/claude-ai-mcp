// Renders every .slide element in an HTML file to PNG, plus one PDF of all slides.
// Usage: node render-slides.mjs deck.html out-dir [--w 1080 --h 1350]
import { mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { openBrowser, routeAssets, args } from './browser.mjs';

const a = args(process.argv.slice(2), { w: '1080', h: '1350' });
const [input, outDir] = a._;
if (!input || !outDir) { console.error('Usage: node render-slides.mjs deck.html out-dir [--w 1080 --h 1350]'); process.exit(1); }
const w = +a.w, h = +a.h;
mkdirSync(outDir, { recursive: true });

const browser = await openBrowser();
const context = await browser.newContext({ viewport: { width: w, height: h } });
await routeAssets(context);
const page = await context.newPage();
await page.goto(pathToFileURL(resolve(input)).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

const slides = await page.$$('.slide');
for (const [i, s] of slides.entries()) await s.screenshot({ path: join(outDir, `slide-${String(i + 1).padStart(2, '0')}.png`) });
await page.pdf({ path: join(outDir, 'slides.pdf'), width: `${w}px`, height: `${h}px`, printBackground: true });
await browser.close();
console.log(`${slides.length} slides -> ${outDir}`);
