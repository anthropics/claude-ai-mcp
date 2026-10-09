// Records an animated HTML page to an MP4 clip with Playwright, then converts it with ffmpeg.
// Usage: node render-video.mjs clip.html out.mp4 [--w 1080 --h 1920 --s 8]
import { mkdirSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { openBrowser, routeAssets, args } from '../slides/browser.mjs';

const a = args(process.argv.slice(2), { w: '1080', h: '1920', s: '8' });
const [input, out] = a._;
if (!input || !out) { console.error('Usage: node render-video.mjs clip.html out.mp4 [--w 1080 --h 1920 --s 8]'); process.exit(1); }
const w = +a.w, h = +a.h, seconds = +a.s;
mkdirSync(dirname(resolve(out)), { recursive: true });
const tmp = mkdtempSync(join(tmpdir(), 'clip-'));

const browser = await openBrowser();
const context = await browser.newContext({ viewport: { width: w, height: h }, recordVideo: { dir: tmp, size: { width: w, height: h } } });
await routeAssets(context);
const page = await context.newPage();
// The page waits for window.__start() so the recording begins after fonts and scripts have loaded.
await page.goto(pathToFileURL(resolve(input)).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
const lead = Date.now();
await page.evaluate(() => window.__start && window.__start());
await page.waitForTimeout(seconds * 1000);
await context.close();
await browser.close();

// Trim the blank lead-in recorded while the page was loading.
const trim = ((Date.now() - lead) / 1000 - seconds).toFixed(2);
const webm = join(tmp, readdirSync(tmp).find(f => f.endsWith('.webm')));
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-sseof', `-${seconds}`, '-i', webm, '-r', '30', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', resolve(out)]);
rmSync(tmp, { recursive: true, force: true });
console.log(`${out} (${w}x${h}, ${seconds}s, lead-in trimmed ${trim}s)`);
