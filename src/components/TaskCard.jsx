import { useId } from 'react';
import { STAGES } from '../lib/constants';
import { formatShortDate } from '../lib/dates';

/**
 * A single task on the board.
 * - The whole card is clickable to edit; the click target is a real <button> on the
 *   title, stretched over the card, so it works with keyboard and screen readers.
 * - The status dropdown moves the task between columns without dragging (FR-06,
 *   WCAG 2.2 SC 2.5.7 Dragging Movements).
 * Styling for type (M6) and due date (M8) comes later.
 */
export default function TaskCard({ task, onOpen, onMove }) {
  const statusId = useId();
  const typeLabel = task.type === 'bug' ? 'Bug' : 'Feature';

  return (
    <article className="relative rounded-md border border-border-subtle bg-surface-card p-3 transition-colors hover:bg-surface-raised has-[.card-open:focus-visible]:outline has-[.card-open:focus-visible]:outline-2 has-[.card-open:focus-visible]:outline-offset-2 has-[.card-open:focus-visible]:outline-brand-primary">
      <h3 className="text-sm font-medium text-text-primary">
        <button
          type="button"
          onClick={() => onOpen(task)}
          className="card-open text-left after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
        >
          <span className="sr-only">Edit task: </span>
          {task.title}
        </button>
      </h3>

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

      {/* relative + z-10 lifts the dropdown above the stretched edit button */}
      <div className="relative z-10 mt-3">
        <label htmlFor={statusId} className="sr-only">
          Move &ldquo;{task.title}&rdquo; to
        </label>
        <select
          id={statusId}
          value={task.status}
          onChange={(e) => onMove(task, e.target.value)}
          className="rounded border border-border-strong bg-surface-page px-2 py-1 text-xs text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
        >
          {STAGES.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      </div>
    </article>
  );
}
