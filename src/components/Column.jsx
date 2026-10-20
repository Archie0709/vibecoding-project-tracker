import { useState } from 'react';
import TaskCard from './TaskCard';

/**
 * One Kanban column: a labelled region with a list of task cards.
 * 12g: also a drop target — it highlights while a card from another column is dragged over it.
 */
export default function Column({ stage, tasks, actions }) {
  const headingId = `column-${stage.id}`;
  const [isOver, setIsOver] = useState(false);
  const dragging = actions.draggingId != null;
  const draggingFromHere = tasks.some((t) => t.id === actions.draggingId);
  const canDrop = dragging && !draggingFromHere;

  const dropHandlers = {
    onDragOver: (e) => {
      if (!dragging) return;
      e.preventDefault(); // allow dropping here
      e.dataTransfer.dropEffect = 'move';
      if (!isOver) setIsOver(true);
    },
    onDragLeave: (e) => {
      // Ignore moves between the column's own children.
      if (!e.currentTarget.contains(e.relatedTarget)) setIsOver(false);
    },
    onDrop: (e) => {
      e.preventDefault();
      setIsOver(false);
      actions.dropOn(e.dataTransfer.getData('text/plain'), stage.id);
    },
  };

  return (
    <section
      aria-labelledby={headingId}
      {...dropHandlers}
      className={`flex min-h-[12rem] flex-col rounded-lg p-3 transition-colors ${
        isOver && canDrop
          ? 'bg-brand-primary/10 ring-2 ring-brand-primary'
          : canDrop
            ? 'bg-surface-page/60 outline outline-1 outline-dashed outline-brand-primary/60'
            : 'bg-surface-page/60 ring-1 ring-border-subtle'
      }`}
    >
      <h2
        id={headingId}
        className="mb-3 flex items-center justify-between text-[13px] font-semibold uppercase tracking-wider text-text-muted"
      >
        <span>{stage.label}</span>
        <span className="rounded-full bg-surface-card px-2 py-0.5 font-mono text-xs text-text-primary">
          {tasks.length}
          <span className="sr-only"> {tasks.length === 1 ? 'task' : 'tasks'}</span>
        </span>
      </h2>

      {tasks.length === 0 ? (
        <p className="flex flex-1 items-center justify-center rounded-md border border-dashed border-border-subtle p-4 text-center text-sm text-text-muted">
          {canDrop ? 'Drop here' : <>Nothing here yet — that&apos;s fine.</>}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {tasks.map((task) => (
            <li key={task.id}>
              <TaskCard task={task} actions={actions} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
