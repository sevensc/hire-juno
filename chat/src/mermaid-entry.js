// The diagram library, built into its own file (public/mermaid.js) so the
// chat only loads it when a message actually holds a diagram (see
// drawDiagrams in app.js). "strict" keeps a diagram from carrying scripts,
// click handlers or raw HTML.
import mermaid from 'mermaid';

mermaid.initialize({ startOnLoad: false, securityLevel: 'strict' });
globalThis.hireJunoMermaid = mermaid;
