#!/usr/bin/env node
// Records the feature tour against a running Sample Studio
// (scripts/tour/setup.mjs) and cuts it into one video:
//   PLAYWRIGHT=<path to the playwright package> node scripts/tour/record.mjs <out-dir>
// Every scene is a real browser recording of the chat; between scenes a
// short title card says what comes next. Needs ffmpeg on PATH. The
// colleagues answer from the tour's script, so nothing here spends tokens.
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const out = resolve(process.argv[2] || 'tour-video');
const pw = await import(pathToFileURL(join(process.env.PLAYWRIGHT || 'playwright', 'index.mjs')).href);
const browser = await pw.chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const ROBIN = 'http://127.0.0.1:4911/';
const JO = 'http://127.0.0.1:4912/';
const DESK = { width: 1280, height: 800 };
const PHONE = { width: 390, height: 844 };
mkdirSync(join(out, 'raw'), { recursive: true });
const clips = [];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// One recorded browser context per scene part; the file is named after it.
async function recorded(name, size, mobile, fn) {
  const dir = join(out, 'raw', name);
  rmSync(dir, { recursive: true, force: true });
  const ctx = await browser.newContext({
    viewport: size,
    recordVideo: { dir, size },
    ...(mobile ? { isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : {}),
    colorScheme: 'light',
  });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.error(`[${name}] page error: ${e.message}`));
  try {
    await fn(page, ctx);
  } catch (err) {
    console.error(`[${name}] ${err.message}`);
  }
  await wait(800);
  const video = page.video();
  await ctx.close();
  const target = join(out, 'raw', `${name}.webm`);
  await video.saveAs(target);
  rmSync(dir, { recursive: true, force: true });
  return target;
}

async function card(name, title, subtitle = '') {
  const file = await recorded(name, DESK, false, async (page) => {
    await page.setContent(`<!doctype html><html><body style="margin:0;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#16171a;color:#e8e8ec;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
      <div style="font-size:52px;font-weight:700;letter-spacing:-0.02em;text-align:center;max-width:1000px">${title}</div>
      <div style="margin-top:18px;font-size:26px;color:#8b8b96;text-align:center;max-width:1000px">${subtitle}</div></body></html>`);
    await wait(2600);
  });
  clips.push({ file, kind: 'desk' });
}

async function open(page, url) {
  await page.goto(url);
  await page.waitForSelector('#sidebar');
  await wait(1200);
}
async function typeAndSend(page, text, delay = 28) {
  await page.locator('#composer-input').click();
  await page.keyboard.type(text, { delay });
  await wait(300);
  await page.keyboard.press('Enter');
}
// Until her reply is done (nothing streaming, no typing indicator), then a
// moment to read it.
async function settled(page, readMs = 2200) {
  await wait(1200);
  await page.waitForFunction(() => !document.querySelector('.message--streaming, .typing-indicator, .message--thinking'), null, { timeout: 90000 }).catch(() => {});
  await wait(readMs);
}
const toBottom = (page) => page.locator('#messages').evaluate((el) => el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' }));

// --- Scenes -----------------------------------------------------------
await card('00-title', 'hire-juno', 'An AI workforce you hire, test and lead, in a chat');

await card('01-card', 'Hire a colleague with Juno', 'She runs the hiring conversation and writes the personnel file');
clips.push({ kind: 'desk', file: await recorded('01-hiring', DESK, false, async (page) => {
  await open(page, ROBIN);
  await page.locator('#sidebar').getByText('juno', { exact: true }).first().click();
  await wait(1500);
  await typeAndSend(page, 'Design files keep arriving that do not match our brand kit. Can we hire someone for design reviews?');
  await settled(page, 3500);
  await typeAndSend(page, 'Weekly, about ten files. She comments and may block a release. No outside contact. Direct, but kind.');
  await page.waitForSelector('.permission-card', { timeout: 20000 });
  await wait(2200);
  await page.locator('.permission-card').getByRole('button', { name: 'Allow', exact: true }).click();
  await settled(page, 1000);
  await toBottom(page);
  await wait(3000);
}) });

await card('02-card', 'The assessment center', 'Independent examiners try to make a new colleague break a rule');
clips.push({ kind: 'desk', file: await recorded('02-assessment', DESK, false, async (page) => {
  await open(page, ROBIN);
  await page.locator('#sidebar').getByText('juno', { exact: true }).first().click();
  await wait(1500);
  await typeAndSend(page, 'Yes, start the assessment center.');
  await settled(page, 1000);
  await toBottom(page);
  await wait(3500);
}) });

await card('03-card', 'Probation and feedback reviews', 'Measured against the criteria in the personnel file');
clips.push({ kind: 'desk', file: await recorded('03-feedback', DESK, false, async (page) => {
  await open(page, ROBIN);
  await page.locator('#sidebar').getByText('juno', { exact: true }).first().click();
  await wait(1500);
  await typeAndSend(page, "Ivo's probation ends this week. Please prepare his feedback review.");
  await settled(page, 1000);
  await toBottom(page);
  await wait(3500);
}) });

await card('04-card', 'The team room', 'People and colleagues in one chat: replies, reactions, @mentions');
{
  // Robin and Jo side by side, each on a phone.
  const parts = {};
  const jo = recorded('04-room-jo', PHONE, true, async (page) => {
    await open(page, JO);
    await page.locator('text=/^#?\\s*team$/').first().tap();
    await wait(1500);
    await typeAndSend(page, 'Morning! The contact form drops the last line of a message again 🙈', 22);
    await page.waitForSelector('.gh-card', { timeout: 40000 }).catch(() => {});
    await wait(1500);
    // Jo hearts Ivo's answer: hold it, pick ❤️.
    const ivo = page.locator('.message--room', { hasText: 'pull/18' }).last();
    const box = await ivo.locator('> span').boundingBox();
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: box.x + 40, y: box.y + 30 }] });
    await wait(650);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await wait(900);
    await page.locator('.reaction-picker__emoji', { hasText: '❤️' }).tap();
    await page.waitForSelector('.message--room >> text=release check', { timeout: 40000 }).catch(() => {});
    await wait(3000);
  });
  const robin = recorded('04-room-robin', PHONE, true, async (page) => {
    await open(page, ROBIN);
    await page.locator('text=/^#?\\s*team$/').first().tap();
    await wait(5500);
    // Swipe Jo's message to the right to reply to it.
    const msg = page.locator('.message--room', { hasText: 'contact form drops' }).last();
    const box = await msg.locator('p').first().boundingBox();
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: box.x + 10, y: box.y + 5 }] });
    for (let i = 1; i <= 10; i++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: box.x + 10 + i * 9, y: box.y + 5 }] });
      await wait(25);
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await wait(700);
    await typeAndSend(page, '@ivo can you take a look?', 40);
    await page.waitForSelector('.gh-card', { timeout: 40000 }).catch(() => {});
    await wait(4500);
    await typeAndSend(page, '@mara please put a release check on tomorrow 10:00', 30);
    await page.waitForSelector('.message--room >> text=release check for the website', { timeout: 40000 }).catch(() => {});
    await wait(3500);
  });
  [parts.jo, parts.robin] = await Promise.all([jo, robin]);
  clips.push({ kind: 'pair', files: [parts.robin, parts.jo] });
}

await card('05-card', 'GitHub inside the chat', 'Slash commands, search, previews you can act on');
clips.push({ kind: 'desk', file: await recorded('05-github', DESK, false, async (page) => {
  await open(page, ROBIN);
  await page.locator('#sidebar').getByText('ivo', { exact: true }).first().click();
  await wait(1200);
  await page.locator('#composer-input').click();
  await page.keyboard.type('/', { delay: 60 });
  await wait(1800);
  await page.keyboard.type('pr contact', { delay: 70 });
  await wait(2500);
  await page.keyboard.press('Enter');
  await wait(600);
  await page.keyboard.type('please merge after the review', { delay: 30 });
  await page.keyboard.press('Enter');
  await settled(page, 1500);
  const cardEl = page.locator('.gh-card').last();
  await cardEl.getByRole('button', { name: 'Board' }).click();
  await wait(1800);
  await cardEl.locator('.gh-menu__choice', { hasText: 'In review' }).click({ timeout: 5000 }).catch(() => {});
  await wait(1500);
  await cardEl.getByRole('button', { name: 'Labels' }).click();
  await wait(1500);
  await cardEl.locator('.gh-menu__choice', { hasText: 'design' }).click();
  await wait(3000);
}) });

await card('06-card', 'Work on GitHub repositories', 'Pick the repositories; she works in her own worktrees, nowhere else');
clips.push({ kind: 'desk', file: await recorded('06-worktrees', DESK, false, async (page) => {
  await open(page, ROBIN);
  await page.locator('#sidebar').getByText('ivo', { exact: true }).first().click();
  await wait(1000);
  // A new conversation for the change.
  await page.locator('.session-tab--new').click();
  await wait(800);
  await typeAndSend(page, 'Hi Ivo, a small change on the website coming up.');
  await settled(page, 800);
  await page.locator('.pane-header__menu').click();
  await wait(1200);
  await page.locator('input[name="conversation-mode"][value="remote"]').scrollIntoViewIfNeeded();
  await page.locator('input[name="conversation-mode"][value="remote"]').check();
  await wait(1500);
  await page.locator('.worktree-repo', { hasText: 'sample-studio/website' }).click();
  await page.locator('.worktree-repo', { hasText: 'sample-studio/brand-kit' }).click();
  await wait(1200);
  await page.getByRole('button', { name: /Work in these 2 repositories/ }).click();
  await wait(4500);
  await page.locator('#conv-settings-close').click();
  await wait(1000);
  await typeAndSend(page, 'Please update the footer year on the website.');
  await page.waitForSelector('.permission-card', { timeout: 30000 });
  await wait(2500);
  await page.locator('.permission-card').getByRole('button', { name: 'Allow', exact: true }).click();
  await settled(page, 3000);
}) });

await card('07-card', 'Your profile, and everything shared', 'Assigned issues and pull requests; pictures, links and documents');
clips.push({ kind: 'desk', file: await recorded('07-profile', DESK, false, async (page) => {
  await open(page, ROBIN);
  await page.locator('.profile-entry').click();
  await wait(4000);
  await page.locator('.artifact-viewer__panel--profile .artifact-viewer__header button').click();
  await wait(600);
  await page.locator('.media-entry').click();
  await wait(2500);
  await page.getByRole('tab', { name: /Links/ }).click();
  await wait(3000);
}) });

await card('99-outro', 'npx github:sevensc/hire-juno', 'Juno is already hired. Tell her what keeps piling up on your desk.');
await browser.close();

// --- Cut --------------------------------------------------------------
const ff = (...args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: 'inherit' });
const parts = [];
clips.forEach((clip, i) => {
  const part = join(out, 'raw', `part-${String(i).padStart(2, '0')}.mp4`);
  const enc = ['-r', '30', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'medium', '-crf', '26', '-an'];
  if (clip.kind === 'desk') {
    ff('-i', clip.file, '-vf', 'scale=1280:800,setsar=1', ...enc, part);
  } else {
    // Two phones side by side on the dark background, names under them.
    ff('-i', clip.files[0], '-i', clip.files[1], '-filter_complex',
      '[0:v]scale=-2:740[a];[1:v]scale=-2:740[b];[a][b]hstack=inputs=2[s];color=c=0x16171a:s=1280x800[bg];[bg][s]overlay=(W-w)/2:(H-h)/2:shortest=1,setsar=1',
      ...enc, part);
  }
  parts.push(part);
});
const list = join(out, 'raw', 'parts.txt');
writeFileSync(list, parts.map((p) => `file '${p}'`).join('\n'));
ff('-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', '-movflags', '+faststart', join(out, 'hire-juno-tour.mp4'));
console.log(`Done: ${join(out, 'hire-juno-tour.mp4')}`);
