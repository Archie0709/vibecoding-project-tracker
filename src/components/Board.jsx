import { useMemo, useState } from 'react';
import { STAGES } from '../lib/constants';
import Column from './Column';

/**
 * The four-column Kanban board. Columns come from STAGES (PRD §7).
 *
 * 12g drag and drop (FR-29): cards can be dragged between columns with a mouse.
 * Dragging is an extra, never the only way: every card keeps its status dropdown,
 * which works with a keyboard and screen readers (WCAG 2.2 SC 2.5.7 Dragging Movements,
 * NFR-07). Uses the browser's built-in HTML drag and drop, so no extra library.
 */
export default function Board({ tasks, actions }) {
  const [draggingId, setDraggingId] = useState(null);

  const dragActions = useMemo(
    () => ({
      ...actions,
      draggingId,
      startDrag: (task) => setDraggingId(task.id),
      endDrag: () => setDraggingId(null),
      dropOn: (taskId, status) => {
        setDraggingId(null);
        const task = tasks.find((t) => String(t.id) === String(taskId));
        if (task && task.status !== status) actions.move(task, status);
      },
    }),
    [actions, draggingId, tasks],
  );

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {STAGES.map((stage) => (
        <Column
          key={stage.id}
          stage={stage}
          tasks={tasks.filter((t) => t.status === stage.id)}
          actions={dragActions}
        />
      ))}
    </div>
  );
}
