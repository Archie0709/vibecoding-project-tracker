// The four columns of the board, in render order (PRD §7).
// Use these IDs everywhere — do not invent new ones.
export const STAGES = [
  { id: 'todo',        label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'review',      label: 'Review' },
  { id: 'done',        label: 'Done' },
];

// Demo team for M7–M11 (PRD §8). From M12 this is replaced by the board's members.
export const TEAM = ['Archie', 'Jordan', 'Priya'];

export const TASK_TYPES = [
  { id: 'feature', label: 'Feature' },
  { id: 'bug',     label: 'Bug' },
];
