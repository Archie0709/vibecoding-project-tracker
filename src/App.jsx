import { useEffect, useState } from 'react';
import { LogOut, ServerCrash } from 'lucide-react';
import AnchorBoard from './components/AnchorBoard';
import AuthScreen from './components/AuthScreen';
import BoardBar from './components/BoardBar';
import LocalTasksBanner from './components/LocalTasksBanner';
import MembersPanel from './components/MembersPanel';
import Board from './components/Board';
import TaskModal from './components/TaskModal';
import { ToastProvider, useToast } from './components/Toast';
import { useAnchors } from './hooks/useAnchors';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { useBoards } from './hooks/useBoards';
import { MembersProvider, useBoardMembers } from './hooks/useMembers';
import { useTasks } from './hooks/useTasks';
import { STAGES } from './lib/constants';
import { btnPrimary, btnSecondary } from './lib/ui';

/**
 * Vibecoding Project Tracker.
 *
 * Structure:
 *   src/api.js              data layer: every read/write goes through the REST API (M12)
 *   src/hooks/useTasks.js   React state over the data layer
 *   src/lib/                constants, dates, seed data, shared UI classes
 *   src/components/         AnchorBoard, Board → Column → TaskCard, TaskModal, Modal, ConfirmDialog, Toast
 *   src/hooks/useAnchors.js deliverable links (M11)
 *   src/hooks/useAuth.jsx   who is logged in (12c)
 *   src/hooks/useBoards.js  the user's boards and which one is open (12d)
 *   src/hooks/useMembers.jsx the open board's members, shared via context (12e)
 *
 * Core milestones M4–M11 complete. M12 (secret sauce) builds on this.
 */
export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Gate />
      </AuthProvider>
    </ToastProvider>
  );
}

/** 12c: shows the login screen until someone is logged in (NFR-14). */
function Gate() {
  const auth = useAuth();

  if (auth.status === 'loading') {
    return (
      <p role="status" className="flex min-h-screen items-center justify-center text-text-muted">
        Loading…
      </p>
    );
  }

  if (auth.status === 'error') {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div role="alert" className="max-w-md rounded-lg bg-surface-card p-6 text-center ring-1 ring-border-subtle">
          <ServerCrash aria-hidden="true" className="mx-auto h-8 w-8 text-due-overdue" />
          <h1 className="mt-3 text-lg font-semibold">Can&apos;t reach the server</h1>
          <p className="mt-1 text-sm text-text-muted">{auth.error?.message}</p>
          <button type="button" className={`${btnPrimary} mt-4`} onClick={auth.refresh}>
            Try again
          </button>
        </div>
      </main>
    );
  }

  if (auth.status === 'anonymous') return <AuthScreen />;

  return <Tracker />;
}

function Tracker() {
  const { user, logout } = useAuth();
  const boards = useBoards();
  const showToast = useToast();

  async function handleLogout() {
    await logout();
    showToast('Logged out.');
  }

  /** 12e: after leaving a board, drop it from the list and put focus somewhere sensible. */
  function handleLeft(boardId) {
    boards.forgetBoard(boardId);
    requestAnimationFrame(() =>
      (document.getElementById('board-select') ?? document.getElementById('new-board-button'))?.focus(),
    );
  }

  return (
    <div className="min-h-screen p-6">
      <a
        href="#board"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-brand-primary focus:px-3 focus:py-2 focus:text-surface-page"
      >
        Skip to board
      </a>

      <header className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-text-primary">
            <span aria-hidden="true" className="text-brand-primary">▍</span>
            Vibecoding Project Tracker
          </h1>
          <p className="text-sm text-text-muted">
            Track the task <em>and</em> the prompt that built it.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-text-muted">
            Signed in as <span className="font-medium text-text-primary">{user.name}</span>
          </p>
          <button type="button" className={btnSecondary} onClick={handleLogout}>
            <LogOut aria-hidden="true" className="h-4 w-4" />
            Log out
          </button>
        </div>
      </header>

      {boards.loading && <p className="text-text-muted">Loading boards…</p>}
      {boards.error && (
        <p role="alert" className="text-due-overdue">Couldn&apos;t load boards: {boards.error.message}</p>
      )}

      {!boards.loading && !boards.error && (
        <>
          <BoardBar
            boards={boards.boards}
            currentBoard={boards.currentBoard}
            onSelect={boards.selectBoard}
            onCreate={boards.createBoard}
            onRename={boards.renameBoard}
            onDelete={boards.deleteBoard}
          />
          {boards.currentBoard ? (
            // key: switching boards remounts the view, so tasks, links and modals reset cleanly.
            <BoardView key={boards.currentBoard.id} board={boards.currentBoard} onLeft={handleLeft} />
          ) : (
            <NoBoards onCreate={() => document.getElementById('new-board-button')?.click()} />
          )}
        </>
      )}
    </div>
  );
}

function NoBoards({ onCreate }) {
  return (
    <main id="board" tabIndex={-1} className="focus:outline-none">
      <div className="rounded-lg border border-dashed border-border-subtle p-10 text-center">
        <h2 className="text-lg font-semibold">No boards yet</h2>
        <p className="mt-1 text-sm text-text-muted">Create a board to start tracking tasks and prompts.</p>
        <button type="button" className={`${btnPrimary} mt-4`} onClick={onCreate}>
          Create a board
        </button>
      </div>
    </main>
  );
}

/** Everything that belongs to one board: its deliverables, tasks and the task modal. */
function BoardView({ board, onLeft }) {
  const { tasks, loading, error, addTask, editTask, removeTask, reload } = useTasks(board.id);
  const members = useBoardMembers(board.id);
  const { anchors, saveAnchor } = useAnchors(board.id);
  const showToast = useToast();

  // Modal state: closed, creating (task = null) or editing (task = the task).
  const [modal, setModal] = useState({ open: false, task: null });
  const openCreate = () => setModal({ open: true, task: null });
  const openEdit = (task) => setModal({ open: true, task });
  const closeModal = () => setModal((m) => ({ ...m, open: false }));

  useEffect(() => {
    document.title = `${board.name} · Vibecoding Project Tracker`;
  }, [board.name]);

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

  async function handleHandOff(task, member) {
    await editTask(task.id, { assigneeId: member.id, assignee: '' });
    showToast(`Handed off to ${member.name}.`);
  }

  // Everything a card can do, passed down Board → Column → TaskCard as one object.
  const cardActions = { open: openEdit, move: handleMove, handOff: handleHandOff };

  return (
    <MembersProvider value={members}>
      {/* M11: pinned deliverables, always visible above the board (FR-18, FR-19). */}
      <AnchorBoard anchors={anchors} onSave={saveAnchor} />

      {/* 12f: one-off import of tasks still saved in this browser from before. */}
      <LocalTasksBanner board={board} onImported={reload} />

      <main id="board" tabIndex={-1} aria-labelledby="board-heading" className="focus:outline-none">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 id="board-heading" className="text-lg font-semibold text-text-primary">
            {board.name}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <MembersPanel board={board} onLeft={onLeft} />
            <button id="new-task-button" type="button" className={btnPrimary} onClick={openCreate}>
              + New task
            </button>
          </div>
        </div>

        {loading && <p className="text-text-muted">Loading tasks…</p>}
        {error && (
          <p role="alert" className="text-due-overdue">
            Couldn&apos;t load tasks: {error.message}
          </p>
        )}
        {!loading && !error && <Board tasks={tasks} actions={cardActions} />}
      </main>

      <TaskModal
        open={modal.open}
        task={modal.task}
        onClose={closeModal}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </MembersProvider>
  );
}
