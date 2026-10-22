// Decides whether a model value coming from the browser may be applied.
// The browser sends whatever its dropdown held; the server only accepts
// what the SDK itself listed for this account (`value` of each entry from
// supportedModels()), or an empty value / the SDK's own 'default' entry,
// which both mean "back to the default" (stored as no choice at all).
// Returns { ok: true, model: <string|null> } or { ok: false, message }.
export function validateModelChoice(requested, supportedModels) {
  if (requested === null || requested === undefined || requested === '' || requested === 'default') return { ok: true, model: null };
  if (typeof requested !== 'string') return { ok: false, message: 'Model must be text.' };
  const known = (supportedModels || []).some((entry) => entry.value === requested);
  if (!known) return { ok: false, message: `Unknown model: ${requested.slice(0, 80)}` };
  return { ok: true, model: requested };
}
