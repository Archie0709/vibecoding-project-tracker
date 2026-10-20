import { useState } from 'react';
import AnchorBoard from './components/AnchorBoard';
import Board from './components/Board';
import TaskModal from './components/TaskModal';
import { ToastProvider, useToast } from './components/Toast';
import { useAnchors } from './hooks/useAnchors';
import { useTasks } from './hooks/useTasks';
import { STAGES } from './lib/constants';
import { btnPrimary } from './lib/ui';

/**
 * Vibecoding Project Tracker.
 *
 * Structure:
 *   src/api.js              data layer (localStorage now, REST API in M12)
 *   src/hooks/useTasks.js   React state over the data layer
 *   src/lib/                constants, dates, seed data, shared UI classes
 *   src/components/         AnchorBoard, Board → Column → TaskCard, TaskModal, Modal, ConfirmDialog, Toast
 *   src/hooks/useAnchors.js deliverable links (M11)
 *
 * Core milestones M4–M11 complete. M12 (secret sauce) builds on this.
 */
export default function App() {
  return (
    <ToastProvider>
      <Tracker />
    </ToastProvider>
  );
}

function Tracker() {
  const { tasks, loading, error, addTask, editTask, removeTask } = useTasks();
  const { anchors, saveAnchor } = useAnchors();
  const showToast = useToast();

  // Modal state: closed, creating (task = null) or editing (task = the task).
  const [modal, setModal] = useState({ open: false, task: null });
  const openCreate = () => setModal({ open: true, task: null });
  const openEdit = (task) => setModal({ open: true, task });
  const closeModal = () => setModal((m) => ({ ...m, open: false }));

  async function handleSave(values) {
    if (modal.task) {
      await editTask(modal.task.id, values);
      showToast('Changes saved.');
    } else {
      await addTask(values);
      showToast('Task created.');
    }
    closeModal();
  }

  async function handleDelete(id) {
    await removeTask(id);
    closeModal();
    showToast('Task deleted.');
  }

  async function handleMove(task, status) {
    await editTask(task.id, { status });
    const label = STAGES.find((s) => s.id === status)?.label ?? status;
    showToast(`Moved "${task.title}" to ${label}.`);
  }

  async function handleHandOff(task, name) {
    await editTask(task.id, { assignee: name });
    showToast(`Handed off to ${name}.`);
  }

  // Everything a card can do, passed down Board → Column → TaskCard as one object.
  const cardActions = { open: openEdit, move: handleMove, handOff: handleHandOff };

  return (
    <div className="min-h-screen p-6">
      <a
        href="#board"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-brand-primary focus:px-3 focus:py-2 focus:text-surface-page"
      >
        Skip to board
      </a>

      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-text-primary">
            <span aria-hidden="true" className="text-brand-primary">▍</span>
            Vibecoding Project Tracker
          </h1>
          <p className="text-sm text-text-muted">
            Archie · Track the task <em>and</em> the prompt that built it.
          </p>
        </div>
        <button id="new-task-button" type="button" className={btnPrimary} onClick={openCreate}>
          + New task
        </button>
      </header>

      {/* M11: pinned deliverables, always visible above the board (FR-18, FR-19). */}
      <AnchorBoard anchors={anchors} onSave={saveAnchor} />

      <main id="board" tabIndex={-1} className="focus:outline-none">
        {loading && <p className="text-text-muted">Loading tasks…</p>}
        {error && (
          <p role="alert" className="text-due-overdue">
            Couldn&apos;t load tasks: {error.message}
          </p>
        )}
        {!loading && !error && (
          <Board tasks={tasks} actions={cardActions} />
        )}
      </main>

      <TaskModal
        open={modal.open}
        task={modal.task}
        onClose={closeModal}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}
