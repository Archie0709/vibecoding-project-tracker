import { formatShortDate } from '../lib/dates';

/** A single task on the board. Styling for type (M6) and due date (M8) comes later. */
export default function TaskCard({ task }) {
  const typeLabel = task.type === 'bug' ? 'Bug' : 'Feature';

  return (
    <article className="rounded-md border border-border-subtle bg-surface-card p-3 transition-colors hover:bg-surface-raised">
      <h3 className="text-sm font-medium text-text-primary">{task.title}</h3>

      {task.description && (
        <p className="mt-1 line-clamp-2 text-sm text-text-muted">{task.description}</p>
      )}

      <dl className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
        <div>
          <dt className="sr-only">Type</dt>
          <dd className="font-mono">{typeLabel}</dd>
        </div>
        {task.assignee && (
          <div>
            <dt className="sr-only">Assigned to</dt>
            <dd>{task.assignee}</dd>
          </div>
        )}
        {task.dueDate && (
          <div>
            <dt className="sr-only">Due</dt>
            <dd>
              <time dateTime={task.dueDate}>Due {formatShortDate(task.dueDate)}</time>
            </dd>
          </div>
        )}
      </dl>
    </article>
  );
}
