// The four columns of the board, in render order (PRD §7).
// Use these IDs everywhere — do not invent new ones.
export const STAGES = [
  { id: 'todo',        label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'review',      label: 'Review' },
  { id: 'done',        label: 'Done' },
];


export const TASK_TYPES = [
  { id: 'feature', label: 'Feature' },
  { id: 'bug',     label: 'Bug' },
];

// M9 context: which AI tool the context relates to (FR-15).
export const AI_TOOLS = ['Claude', 'ChatGPT', 'Codex', 'Cursor', 'Gemini', 'GitHub Copilot', 'Lovable', 'Replit', 'Other'];
