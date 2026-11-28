#!/usr/bin/env node
// Builds and starts the made-up "Sample Studio" for the feature tour:
//   node scripts/tour/setup.mjs <tour-dir>
// In <tour-dir>: the workforce (four colleagues), local stand-ins for the
// GitHub repositories of "sample-studio", home folders for Robin and Jo,
// the team room, and one chat per person. The colleagues answer from
// scripts/tour/script.json (no model, no tokens); GitHub is the stand-in
// in scripts/tour/fake-gh (no network). Prints the two chat addresses and
// keeps running until stopped.
import { execFileSync, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { createServer, connect } from 'node:net';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..', '..');
const dir = resolve(process.argv[2] || join(process.cwd(), 'tour'));
if (existsSync(dir)) {
  console.error(`${dir} exists already; give a new folder.`);
  process.exit(1);
}
const git = (cwd, ...args) => execFileSync('git', args, { cwd, stdio: ['ignore', 'pipe', 'pipe'] });

// The workforce, with Juno as the template ships her.
const ws = join(dir, 'sample-studio');
cpSync(join(here, 'workforce'), ws, { recursive: true });
cpSync(join(repoRoot, 'team', 'juno'), join(ws, 'team', 'juno'), { recursive: true });
for (const file of ['hr']) cpSync(join(repoRoot, file), join(ws, file), { recursive: true });
git(ws, 'init', '-q', '-b', 'main');
git(ws, 'remote', 'add', 'origin', 'https://github.com/sample-studio/studio-team.git');

// Local stand-ins for the repositories on "GitHub".
const bare = join(dir, 'github');
const seed = join(dir, 'seed');
const repos = {
  website: { 'README.md': '# Sample Studio website\n', 'components/Footer.tsx': 'export const Footer = () => <footer>© 2025 Sample Studio</footer>;\n', 'package.json': '{ "name": "website", "scripts": { "test": "node --test" } }\n' },
  'mobile-app': { 'README.md': '# Sample Studio app\n' },
  'brand-kit': { 'README.md': '# Brand kit\n', 'colors.md': '- Ink #1b1b1f\n- Studio blue #3358d6\n' },
};
for (const [name, files] of Object.entries(repos)) {
  const work = join(seed, name);
  for (const [file, text] of Object.entries(files)) {
    mkdirSync(dirname(join(work, file)), { recursive: true });
    writeFileSync(join(work, file), text);
  }
  git(work, 'init', '-q', '-b', 'main');
  git(work, '-c', 'user.email=tour@example.org', '-c', 'user.name=Tour', 'add', '.');
  git(work, '-c', 'user.email=tour@example.org', '-c', 'user.name=Tour', 'commit', '-q', '-m', 'Start');
  git(dir, 'clone', '-q', '--bare', work, join(bare, `${name}.git`));
}

// People: Robin and Jo, each with a home folder, a git config that points
// "github.com/sample-studio" at the stand-ins, and a room token.
const people = [{ id: 'robin', name: 'Robin' }, { id: 'jo', name: 'Jo' }];
const run = join('/tmp', `hj-tour-${process.pid}`); // short: Unix socket paths have a length limit
mkdirSync(run, { recursive: true });
for (const p of people) {
  p.home = join(dir, 'home', p.id);
  mkdirSync(p.home, { recursive: true });
  // Only the three repositories are redirected: the workforce's own origin
  // keeps its GitHub address, which is how the chat finds the account.
  const redirects = Object.keys(repos).map((name) => `[url "file://${bare}/${name}.git"]\n\tinsteadOf = https://github.com/sample-studio/${name}.git\n`).join('');
  writeFileSync(join(p.home, '.gitconfig'), `[user]\n\tname = ${p.name}\n\temail = ${p.id}@sample-studio.example\n${redirects}`);
  p.token = createHash('sha256').update(`${p.id}-${process.pid}-tour`).digest('hex');
  writeFileSync(join(dir, `${p.id}.token`), p.token);
  p.socket = join(run, `${p.id}.sock`);
}
writeFileSync(join(dir, 'members.json'), JSON.stringify(people.map((p) => ({ id: p.id, name: p.name, tokenSha256: createHash('sha256').update(p.token).digest('hex') }))));

const node = process.execPath;
const roomSock = join(run, 'room.sock');
const children = [];
const start = (args, env = {}) => {
  const child = spawn(node, args, { env: { ...process.env, ...env }, stdio: ['ignore', 'inherit', 'inherit'] });
  children.push(child);
  return child;
};
start([join(repoRoot, 'chat', 'bin', 'room.js'), '--socket', roomSock, '--db', join(dir, 'room.db'), '--members', join(dir, 'members.json')]);
await new Promise((r) => setTimeout(r, 800));
const ports = { robin: 4911, jo: 4912 };
for (const p of people) {
  start(
    [join(repoRoot, 'chat', 'bin', 'chat.js'), '--dir', ws, '--socket', p.socket, '--person', p.name, '--room-socket', roomSock, '--room-token-file', join(dir, `${p.id}.token`)],
    {
      HOME: p.home,
      GIT_CONFIG_GLOBAL: join(p.home, '.gitconfig'),
      PATH: `${join(here, 'fake-gh')}:${process.env.PATH}`,
      HIRE_JUNO_DEMO_SCRIPT: join(here, 'script.json'),
      TOUR_STATE: join(dir, 'github-state.json'),
      TOUR_USER: p.id,
    }
  );
}
await new Promise((r) => setTimeout(r, 1500));
// Browsers cannot open a Unix socket: one local TCP port per person.
for (const p of people) {
  createServer((c) => {
    const u = connect(p.socket);
    c.pipe(u).pipe(c);
    u.on('error', () => c.destroy());
    c.on('error', () => u.destroy());
  }).listen(ports[p.id], '127.0.0.1');
}
console.log(`Sample Studio is running.\n  Robin: http://127.0.0.1:${ports.robin}/\n  Jo:    http://127.0.0.1:${ports.jo}/`);
const stop = () => {
  for (const c of children) c.kill('SIGTERM');
  process.exit(0);
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
