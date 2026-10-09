// Shared Playwright setup for the slides and video-clip skills. Free tools only: Playwright, Chromium, ffmpeg, Motion.
// The sandbox browser cannot reach CDNs directly, so Google Fonts and the Motion library are fetched by Node and served to the page.
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
function loadPlaywright() {
  for (const p of ['playwright', '/opt/node-tools/node_modules/playwright', join(execSync('npm root -g').toString().trim(), 'playwright')]) {
    try { return require(p); } catch {}
  }
  throw new Error('Playwright not found');
}

// Local copy of Motion (motion.dev, the vanilla version of Framer Motion), installed once from npm.
function motionFile() {
  const dir = join(homedir(), '.cache', 'motion');
  const file = join(dir, 'node_modules', 'motion', 'dist', 'motion.js');
  if (!existsSync(file)) execSync(`mkdir -p ${dir} && cd ${dir} && npm i --silent motion@12`, { stdio: 'ignore' });
  return file;
}

export async function openBrowser() {
  const { chromium } = loadPlaywright();
  const executablePath = existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined;
  return chromium.launch({ executablePath }).catch(() => chromium.launch());
}

// Serve fonts and Motion from Node so pages can use the normal CDN URLs.
export async function routeAssets(context) {
  await context.route(/fonts\.(googleapis|gstatic)\.com/, async route => {
    const r = await fetch(route.request().url(), { headers: { 'user-agent': 'Mozilla/5.0 Chrome/120' } });
    await route.fulfill({ status: r.status, headers: { 'content-type': r.headers.get('content-type') || 'text/css', 'access-control-allow-origin': '*' }, body: Buffer.from(await r.arrayBuffer()) });
  });
  await context.route(/cdn\.jsdelivr\.net\/npm\/motion|unpkg\.com\/motion/, route =>
    route.fulfill({ status: 200, contentType: 'application/javascript', body: readFileSync(motionFile()) }));
}

export function args(argv, defaults) {
  const out = { ...defaults, _: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) out[argv[i].slice(2)] = argv[++i];
    else out._.push(argv[i]);
  }
  return out;
}
