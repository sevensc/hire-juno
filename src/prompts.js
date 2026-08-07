import {
  cancel,
  confirm,
  intro,
  isCancel,
  log,
  outro,
  path,
  select,
  spinner,
  text,
} from '@clack/prompts';

import { detectLanguage, setLanguage, t } from './i18n.js';
import { detectTool, pickAffirmation, slugify, USE_CASES } from './wizard-shared.js';

export { spinner };

export function bail() {
  cancel(t('Setup cancelled — nothing was written.'));
  process.exit(0);
}

export async function ask(promptFn, options) {
  const value = await promptFn(options);
  if (isCancel(value)) bail();
  return value;
}

// Printed after every single answer — the "kurz bestätigt" beat asked
// for, not a real validation step (that already happened in the
// prompt's own `validate`).
export function affirm() {
  log.success(t(pickAffirmation()));
}

export function showIntro() {
  intro(`hire-juno — ${t('set up your AI workforce')}`);
}

// Always the first question, in English regardless of what gets typed
// back — asking "what language?" in the target language itself would
// need to already know it. See src/i18n.js for what this does and
// doesn't cover.
export async function askLanguage() {
  const raw = await ask(text, {
    message:
      'What language should Juno use with you? (e.g. English, German, French, Spanish — or type your own)',
    validate(value) {
      if (!value.trim()) return 'Required.';
    },
  });
  const language = detectLanguage(raw);
  setLanguage(language.code);
  return language;
}

export async function chooseMode() {
  return ask(select, {
    message: t('Terminal or browser?'),
    options: [
      { value: 'terminal', label: 'Terminal', hint: t('the usual prompts') },
      {
        value: 'browser',
        label: t('Browser'),
        hint: t('a setup page with a live preview of what gets written'),
      },
    ],
  });
}

// One question, one field, in a fixed order: team name,
// use case, folder, supervisor, tool, git. Each is its own function
// instead of one big runPrompts() so install.js can weave affirm()
// between them without this file knowing anything about the terminal
// art — that stays install.js's job.

export async function askTeamName() {
  const name = await ask(text, {
    message: t('What should your team be called?'),
    validate(value) {
      if (!value.trim()) return t('Required.');
    },
  });
  // The workforce ID used to be its own question (lowercase, no
  // spaces, assigned once). Deriving it from the name removes a
  // question without removing the field the constitution actually
  // needs — shown back so it's never a silent surprise.
  const workforceId = slugify(name);
  log.info(t('Workforce ID: {id} (derived from the name, used internally, never shown again)', { id: workforceId }));
  return { company: name, workforceId };
}

export async function askUseCase() {
  const value = await ask(select, {
    message: t('What is this workforce for?'),
    options: USE_CASES.map((c) => ({ value: c.value, label: t(c.label) })),
  });
  const picked = USE_CASES.find((c) => c.value === value);
  if (picked.phrase) return picked.phrase;

  const custom = await ask(text, {
    message: t('Describe it in a few words'),
    validate(v) {
      if (!v.trim()) return t('Required.');
    },
  });
  return custom.trim();
}

export async function askTargetDir() {
  return ask(path, {
    message: t('Where should your team live? (a folder — tab-completes)'),
    directory: true,
    // @clack/prompts' `path()` widget filters its listing by checking
    // whether each entry's *joined* path starts with the current input
    // (`options()` in @clack/prompts/dist/index.mjs). Node's path.join
    // normalizes away a leading "./", so join('.', 'src') is 'src', not
    // './src' — with initialValue '.' that entry no longer starts with
    // '.' and gets filtered out. Only dotfiles ('.git', ...) survived,
    // so the picker looked all but empty in the actual working
    // directory. An absolute path doesn't hit that normalization, so
    // pass one instead of the relative shorthand.
    initialValue: process.cwd(),
  });
}

export async function askSupervisor() {
  return ask(text, {
    message: t("Who will be Juno's supervisor?"),
    validate(value) {
      if (!value.trim()) return t('Required.');
    },
  });
}

export async function askToolChoice(tools) {
  return ask(select, {
    message: t('Which tool do you use?'),
    initialValue: detectTool(tools),
    options: tools.map((tool) => ({
      value: tool.value,
      label: t(tool.label),
      hint: tool.adapters ? undefined : t('manual wiring for now'),
    })),
  });
}

// "evtl. Link verlangen, entscheide du" — a plain confirm, and only if
// yes, one optional follow-up for a remote. No separate "do you have a
// product repo to link tickets to" question anymore (that field is
// gone from this flow); this is about the repo the scaffolded files
// themselves live in, not a cross-reference to another one.
export async function askGitInit() {
  const gitInit = await ask(confirm, {
    message: t('Initialize a git repository here?'),
    initialValue: true,
  });
  if (!gitInit) return { gitInit: false, remoteUrl: null };

  const remoteUrl = await ask(text, {
    message: t('Remote URL to add as "origin"? (optional — press Enter to skip)'),
    validate() {}, // empty is valid; this one has no wrong answer
  });
  return { gitInit: true, remoteUrl: remoteUrl.trim() || null };
}

// Shared by both the terminal and the browser path: the browser can tell
// you what it would overwrite, but the confirmation itself happens back
// in the terminal you're actually running the installer from.
export async function confirmOverwrite(collisions) {
  if (collisions.length === 0) return;
  const proceed = await ask(confirm, {
    message: t('{n} file(s) already exist at that location and will be overwritten. Continue?', {
      n: collisions.length,
    }),
    initialValue: false,
  });
  if (!proceed) bail();
}

export function printOutro({ tool, targetDir, gitInit }) {
  const lines = [t('Written to {dir}.', { dir: targetDir }), ''];

  if (tool.adapters) {
    lines.push(
      t('Talk to Juno: "@agent-juno" or "claude --agent juno" once {dir} is your working directory.', {
        dir: targetDir,
      })
    );
  } else {
    lines.push(
      t(
        'No adapter generator for {tool} yet. team/juno/profile.md works as a system prompt as-is — wire it into {tool} by hand, the same way you would any other custom agent.',
        { tool: tool.label }
      )
    );
  }

  if (gitInit?.attempted && !gitInit.ok) {
    lines.push(
      '',
      t("Git setup didn't finish ({error}) — the files are still there, just run `git init` yourself.", {
        error: gitInit.error,
      })
    );
  }

  lines.push(
    '',
    t("First move: tell Juno what keeps landing on your desk, and she'll run the hiring conversation for your first real colleague.")
  );

  outro(lines.join('\n'));
}
