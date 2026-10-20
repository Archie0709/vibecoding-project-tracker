import TaskCard from './TaskCard';

/** One Kanban column: a labelled region with a list of task cards. */
export default function Column({ stage, tasks, actions }) {
  const headingId = `column-${stage.id}`;

  return (
    <section
      aria-labelledby={headingId}
      className="flex min-h-[12rem] flex-col rounded-lg bg-surface-page/60 p-3 ring-1 ring-border-subtle"
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
          Nothing here yet — that&apos;s fine.
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
