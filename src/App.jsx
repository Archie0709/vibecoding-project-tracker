import Board from './components/Board';
import { useTasks } from './hooks/useTasks';

/**
 * Vibecoding Project Tracker.
 *
 * Structure:
 *   src/api.js              data layer (localStorage now, REST API in M12)
 *   src/hooks/useTasks.js   React state over the data layer
 *   src/lib/                constants, dates, seed data
 *   src/components/         Board → Column → TaskCard
 *
 * Remaining milestone hooks:
 *   - M5  crud-modal    : "+" button modal and edit-on-click.
 *   - M6  tag-style     : feature vs. bug styling (TaskCard).
 *   - M7  task-owner    : assignee badge + "Hand off to..." dropdown.
 *   - M8  due-tint      : colour cards by due date (TaskCard).
 *   - M9  context       : Context field on the modal.
 *   - M10 copy-prompt   : "Copy as Prompt Context" button.
 *   - M11 anchors       : Deliverable Anchor Board above the Kanban.
 */
export default function App() {
  const { tasks, loading, error } = useTasks();

  return (
    <div className="min-h-screen p-6">
      <a
        href="#board"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-brand-primary focus:px-3 focus:py-2 focus:text-surface-page"
      >
        Skip to board
      </a>

      <header className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-text-primary">
            <span aria-hidden="true" className="text-brand-primary">▍</span>
            Vibecoding Project Tracker
          </h1>
          <p className="text-sm text-text-muted">
            Archie · Track the task <em>and</em> the prompt that built it.
          </p>
        </div>
      </header>

      {/* TODO M11 anchors: Anchor Board goes here, above the board. */}

      <main id="board" tabIndex={-1} className="focus:outline-none">
        {loading && <p className="text-text-muted">Loading tasks…</p>}
        {error && (
          <p role="alert" className="text-due-overdue">
            Couldn&apos;t load tasks: {error.message}
          </p>
        )}
        {!loading && !error && <Board tasks={tasks} />}
      </main>
    </div>
  );
}
