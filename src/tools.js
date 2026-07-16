// Tool registry. The prompt UI offers every entry here from the start
// — a deliberate call, so the picker doesn't need reshaping every time
// a new tool is added — but only entries with `adapters` actually
// generate files. Everything else gets a manual-wiring note in the
// outro.

export const TOOLS = [
  {
    value: 'claude-code',
    label: 'Claude Code',
    adapters: [
      '.claude/agents/juno.md',
      '.claude/agents/examiner-security.md',
      '.claude/agents/examiner-expertise.md',
      '.claude/agents/examiner-brand.md',
    ],
  },
  { value: 'cursor', label: 'Cursor', adapters: null },
  { value: 'windsurf', label: 'Windsurf', adapters: null },
  { value: 'other', label: 'Something else / not sure yet', adapters: null },
];

export function findTool(value) {
  const tool = TOOLS.find((t) => t.value === value);
  if (!tool) throw new Error(`Unknown tool: ${value}`);
  return tool;
}
