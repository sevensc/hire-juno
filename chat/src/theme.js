// The appearance choice in the settings dialog: follow the system, or
// force light or dark. Every colour token in styles.css is declared with
// light-dark(), so the whole switch is the root's `color-scheme`: a
// `data-theme` attribute on <html> pins it, no attribute leaves it at
// "light dark" (the system decides). The choice lives in the browser's
// localStorage, like the open conversation (see open-conversation.js).
//
// index.html's <head> carries a short inline copy of readThemePreference +
// applyTheme, so the attribute is set before the first paint and a forced
// theme never flashes the system one first. Keep the key and the values
// in step with that copy.

export const THEME_STORAGE_KEY = 'hire-juno-chat:theme';
export const THEME_CHOICES = ['system', 'light', 'dark'];

// Pure: anything that is not a known choice (missing, from an older
// shape, hand-edited) is "system", the default.
export function normalizeThemePreference(value) {
  return THEME_CHOICES.includes(value) ? value : 'system';
}

export function readThemePreference(storage = globalThis.localStorage) {
  try {
    return normalizeThemePreference(storage.getItem(THEME_STORAGE_KEY));
  } catch {
    return 'system';
  }
}

export function writeThemePreference(value, storage = globalThis.localStorage) {
  const choice = normalizeThemePreference(value);
  try {
    if (choice === 'system') storage.removeItem(THEME_STORAGE_KEY);
    else storage.setItem(THEME_STORAGE_KEY, choice);
  } catch {
    // Storage blocked — the choice still applies to this page, it just
    // is not remembered after a reload.
  }
  return choice;
}

// Sets the attribute styles.css keys on, and the <meta name="color-scheme">
// the browser reads for its own canvas and controls before styles.css has
// loaded. "system" removes the attribute and puts the meta back to
// "light dark".
export function applyTheme(value, doc = globalThis.document) {
  const choice = normalizeThemePreference(value);
  const root = doc?.documentElement;
  if (!root) return choice;
  if (choice === 'system') delete root.dataset.theme;
  else root.dataset.theme = choice;
  const meta = doc.querySelector?.('meta[name="color-scheme"]');
  if (meta) meta.setAttribute('content', choice === 'system' ? 'light dark' : choice);
  return choice;
}
