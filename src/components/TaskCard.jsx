import { useId } from 'react';
import { STAGES, TEAM } from '../lib/constants';
import { getDueState } from '../lib/dueStatus';
import { typeStyle } from '../lib/taskTypes';
import { focusRing } from '../lib/ui';
import AssigneeBadge from './AssigneeBadge';
import DueBadge from './DueBadge';
import TypeBadge from './TypeBadge';

const cardSelect = `rounded border border-border-strong bg-surface-page px-2 py-1 text-xs text-text-primary ${focusRing}`;

/**
 * A single task on the board.
 * - The whole card is clickable to edit; the click target is a real <button> on the
 *   title, stretched over the card, so it works with keyboard and screen readers.
 * - The status dropdown moves the task between columns without dragging (FR-06,
 *   WCAG 2.2 SC 2.5.7 Dragging Movements).
 * - M6: a 4px left stripe in the type colour plus an icon + label badge.
 * - M7: assignee badge + "Hand off to…" dropdown (FR-09, FR-10).
 * - M8: due-state chip (icon + text) and a faint background tint on the card (FR-11, FR-12).
 *
 * `actions` = { open(task), move(task, status), handOff(task, name) }
 */
export default function TaskCard({ task, actions }) {
  const statusId = useId();
  const handOffId = useId();
  const { stripe } = typeStyle(task.type);
  const due = getDueState(task);
  const handOffOptions = TEAM.filter((name) => name !== task.assignee);

  return (
    <article className={`relative rounded-md border border-l-4 border-border-subtle ${stripe} bg-surface-card ${due?.card ?? ''} p-3 transition-colors hover:bg-surface-raised has-[.card-open:focus-visible]:outline has-[.card-open:focus-visible]:outline-2 has-[.card-open:focus-visible]:outline-offset-2 has-[.card-open:focus-visible]:outline-brand-primary`}>
      <h3 className="text-sm font-medium text-text-primary">
        <button
          type="button"
          onClick={() => actions.open(task)}
          className="card-open text-left after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
        >
          <span className="sr-only">Edit task: </span>
          {task.title}
        </button>
      </h3>

      {task.description && (
        <p className="mt-1 line-clamp-2 text-sm text-text-muted">{task.description}</p>
      )}

      <dl className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-text-muted">
        <div>
          <dt className="sr-only">Type</dt>
          <dd>
            <TypeBadge type={task.type} />
          </dd>
        </div>
        <div>
          <dt className="sr-only">Assigned to</dt>
          <dd>
            <AssigneeBadge name={task.assignee} />
          </dd>
        </div>
        {due && (
          <div>
            <dt className="sr-only">Due date</dt>
            <dd>
              <DueBadge state={due} dueDate={task.dueDate} />
            </dd>
          </div>
        )}
      </dl>

      {/* relative + z-10 lifts the controls above the stretched edit button */}
      <div className="relative z-10 mt-3 flex flex-wrap gap-2">
        <div>
          <label htmlFor={statusId} className="sr-only">
            Move &ldquo;{task.title}&rdquo; to
          </label>
          <select
            id={statusId}
            value={task.status}
            onChange={(e) => actions.move(task, e.target.value)}
            className={cardSelect}
          >
            {STAGES.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={handOffId} className="sr-only">
            Hand off &ldquo;{task.title}&rdquo; to
          </label>
          {/* Always shows the "Hand off to…" prompt; choosing a name reassigns immediately. */}
          <select
            id={handOffId}
            value=""
            onChange={(e) => e.target.value && actions.handOff(task, e.target.value)}
            className={cardSelect}
          >
            <option value="" disabled>Hand off to…</option>
            {handOffOptions.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
      </div>
    </article>
  );
}
