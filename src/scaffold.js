import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { BINARY_FILES, CONTENT_FILES } from './content-manifest.js';
import { substitute } from './substitute.js';
import { findTool } from './tools.js';

export const PACKAGE_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

function writeFile(targetPath, content) {
  mkdirSync(dirname(targetPath), { recursive: true });
  writeFileSync(targetPath, content);
}

// Reads a manifest file's raw (un-substituted) source — used by the
// browser preview to render the same content the terminal path would
// write, without a second copy of "where the source files live".
export function readSourceFile(rel) {
  return readFileSync(join(PACKAGE_ROOT, rel), 'utf8');
}

// Returns the list of relative paths that would be overwritten, without
// writing anything — used to ask for confirmation before touching an
// existing directory.
export function findCollisions(targetDir, toolValue) {
  const tool = findTool(toolValue);
  const relPaths = [...CONTENT_FILES, ...BINARY_FILES, ...(tool.adapters ?? [])];
  return relPaths.filter((rel) => existsSync(join(targetDir, rel)));
}

export function scaffold({ targetDir, toolValue, substitutions }) {
  const tool = findTool(toolValue);
  const written = [];

  for (const rel of CONTENT_FILES) {
    const raw = readFileSync(join(PACKAGE_ROOT, rel), 'utf8');
    writeFile(join(targetDir, rel), substitute(raw, substitutions));
    written.push(rel);
  }

  // No `substitute()` here on purpose — see BINARY_FILES' own comment
  // in content-manifest.js for why running the text pipeline on these
  // would corrupt them.
  for (const rel of BINARY_FILES) {
    const raw = readFileSync(join(PACKAGE_ROOT, rel));
    writeFile(join(targetDir, rel), raw);
    written.push(rel);
  }

  if (tool.adapters) {
    for (const rel of tool.adapters) {
      const raw = readFileSync(join(PACKAGE_ROOT, rel), 'utf8');
      writeFile(join(targetDir, rel), substitute(raw, substitutions));
      written.push(rel);
    }
  }

  return { written, tool };
}
