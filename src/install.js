import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

import pc from 'picocolors';

import { t } from './i18n.js';
import { playJunoIntro } from './juno-ascii.js';
import {
  affirm,
  askGitInit,
  askLanguage,
  askSupervisor,
  askTargetDir,
  askTeamName,
  askToolChoice,
  askUseCase,
  chooseMode,
  confirmCreateDir,
  confirmOverwrite,
  printOutro,
  showIntro,
  spinner,
} from './prompts.js';
import { findCollisions, scaffold } from './scaffold.js';
import { buildSubstitutions } from './substitute.js';
import { findTool, TOOLS } from './tools.js';
import { runWebSetup } from './web/server.js';

function today() {
  return new Date().toISOString().slice(0, 10);
}

// Runs `git init` (skipped, not failed, if the folder is already a
// repo) and an optional `git remote add origin <url>` — execFileSync
// with an argument array throughout, never a shell string, so a remote
// URL can't do anything but be a remote URL.
function setUpGit(targetDir, remoteUrl) {
  const gitDir = join(targetDir, '.git');
  try {
    if (!existsSync(gitDir)) {
      execFileSync('git', ['init'], { cwd: targetDir, stdio: 'ignore' });
    }
    if (remoteUrl) {
      execFileSync('git', ['remote', 'add', 'origin', remoteUrl], { cwd: targetDir, stdio: 'ignore' });
    }
    return { attempted: true, ok: true };
  } catch (err) {
    return { attempted: true, ok: false, error: err.message };
  }
}

async function runTerminalPrompts() {
  const { company, workforceId } = await askTeamName();
  affirm();

  const useCase = await askUseCase();
  affirm();

  const targetDir = await askTargetDir();
  affirm();

  const supervisor = await askSupervisor();
  affirm();

  const toolValue = await askToolChoice(TOOLS);
  affirm();

  const { gitInit, remoteUrl } = await askGitInit();
  affirm();

  return { company, workforceId, useCase, targetDir, supervisor, toolValue, gitInit, remoteUrl };
}

export async function run() {
  // First question, always, in English (see askLanguage's own
  // comment) — everything after this, including the intro banner,
  // reads from the language it resolves.
  const language = await askLanguage();

  showIntro();

  const mode = await chooseMode();

  let answers;
  if (mode === 'browser') {
    const s = spinner();
    s.start(t('Waiting for you in the browser…'));
    answers = await runWebSetup({ language: language.englishName });
    s.stop(t('Got it — back in the terminal.'));
  } else {
    await playJunoIntro(pc);
    answers = await runTerminalPrompts();
  }

  await confirmCreateDir(resolve(answers.targetDir));
  await confirmOverwrite(findCollisions(answers.targetDir, answers.toolValue));

  const substitutions = buildSubstitutions({
    workforceId: answers.workforceId,
    company: answers.company,
    supervisor: answers.supervisor,
    toolLabel: findTool(answers.toolValue).label,
    hiredDate: today(),
    useCase: answers.useCase,
    language: language.englishName,
  });

  const writeSpinner = spinner();
  writeSpinner.start(t('Writing files…'));
  const resolvedTargetDir = resolve(answers.targetDir);
  const { written, tool } = scaffold({
    targetDir: resolvedTargetDir,
    toolValue: answers.toolValue,
    substitutions,
  });
  writeSpinner.stop(t('Written {n} files.', { n: written.length }));

  let gitInit;
  if (answers.gitInit) {
    gitInit = setUpGit(resolvedTargetDir, answers.remoteUrl);
  }

  printOutro({ tool, targetDir: answers.targetDir, gitInit });
}
