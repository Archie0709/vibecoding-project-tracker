import { isoDaysFromToday, toISODate } from './dates';

// Sample tasks shown on first load so the board isn't empty.
// Due dates are relative to today so the M8 due-date colours always demo well.
export function seedTasks() {
  const today = toISODate();
  const base = {
    context: '',
    contextTool: null,
    contextUpdatedAt: null,
    createdDate: today,
  };

  return [
    {
      ...base,
      id: 'seed-1',
      title: 'Render the four-column Kanban board',
      description: 'Columns come from STAGES; each shows the tasks whose status matches.',
      type: 'feature',
      status: 'done',
      assignee: 'Archie',
      dueDate: isoDaysFromToday(-1),
    },
    {
      ...base,
      id: 'seed-2',
      title: 'Add / edit / delete task modal',
      description: 'One modal for create and edit. Must trap focus and close on Esc.',
      type: 'feature',
      status: 'in-progress',
      assignee: 'Archie',
      dueDate: isoDaysFromToday(1),
    },
    {
      ...base,
      id: 'seed-3',
      title: 'Due date shows a day early',
      description: 'new Date("YYYY-MM-DD") parses as UTC, so UK evening times shift the date.',
      type: 'bug',
      status: 'review',
      assignee: 'Priya',
      dueDate: isoDaysFromToday(-2),
    },
    {
      ...base,
      id: 'seed-4',
      title: 'Copy task as prompt context',
      description: 'One click copies the task and its AI context, ready to paste into an agent.',
      type: 'feature',
      status: 'todo',
      assignee: 'Jordan',
      dueDate: isoDaysFromToday(5),
    },
  ];
}
