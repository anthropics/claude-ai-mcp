// Renders a live carousel: one looping 1080x1350 MP4 per slide, frame-exact, with beat-locked music.
// Usage: node render-live.mjs deck.html media-out/<name> [--bpm 120 --bars 2 --fps 30 --music calm|bright|none|track.mp3]
// The page has one <section class="slide"> per slide (optional data-bars="4") and defines window.__frame(i, t),
// which draws slide i at t seconds. Frames are screenshotted one by one, so timing never drifts.
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { openBrowser, routeAssets, args } from '../slides/browser.mjs';

const a = args(process.argv.slice(2), { bpm: '120', bars: '2', fps: '30', music: 'calm', w: '1080', h: '1350' });
const [input, outDir] = a._;
if (!input || !outDir) { console.error('Usage: node render-live.mjs deck.html outDir [--bpm 120 --bars 2 --fps 30 --music calm]'); process.exit(1); }
const bpm = +a.bpm, fps = +a.fps, w = +a.w, h = +a.h;
mkdirSync(outDir, { recursive: true });
const tmp = mkdtempSync(join(tmpdir(), 'live-'));

const browser = await openBrowser();
const context = await browser.newContext({ viewport: { width: w, height: h } });
await routeAssets(context);
const page = await context.newPage();
await page.goto(pathToFileURL(resolve(input)).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
const bars = await page.evaluate(d => [...document.querySelectorAll('.slide')].map(s => +(s.dataset.bars || d)), +a.bars);

// Music: one song split into per-slide parts that each loop cleanly.
const here = dirname(fileURLToPath(import.meta.url));
const secs = bars.map(b => (b * 4 * 60) / bpm);
const audio = join(tmp, 'audio');
if (a.music === 'calm' || a.music === 'bright') {
  execFileSync('python3', [join(here, 'music.py'), audio, String(bpm), bars.join(','), a.music]);
} else if (a.music !== 'none') {
  mkdirSync(audio);
  let at = 0;
  secs.forEach((s, i) => {
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(at), '-t', String(s), '-i', resolve(a.music), '-ac', '1', '-ar', '44100', join(audio, `slide${String(i + 1).padStart(2, '0')}.wav`)]);
    at += s;
  });
}

for (let i = 0; i < bars.length; i++) {
  const name = `slide${String(i + 1).padStart(2, '0')}`;
  const frames = join(tmp, name);
  mkdirSync(frames);
  await page.evaluate(i => document.querySelectorAll('.slide').forEach((s, k) => (s.style.display = k === i ? '' : 'none')), i);
  const n = Math.round(secs[i] * fps);
  for (let f = 0; f < n; f++) {
    await page.evaluate(([i, t]) => window.__frame(i, t), [i, f / fps]);
    await page.screenshot({ path: join(frames, `f${String(f).padStart(4, '0')}.png`) });
  }
  const sound = a.music === 'none'
    ? ['-f', 'lavfi', '-i', 'anullsrc=channel_layout=mono:sample_rate=44100']
    : ['-i', join(audio, `${name}.wav`)];
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', join(frames, 'f%04d.png'), ...sound,
    '-t', String(secs[i]), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-c:a', 'aac', '-b:a', '192k', '-ac', '2',
    '-movflags', '+faststart', resolve(outDir, `${name}.mp4`)]);
  console.log(`${outDir}/${name}.mp4 (${secs[i]}s, ${bars[i]} bars)`);
}
await browser.close();
rmSync(tmp, { recursive: true, force: true });
