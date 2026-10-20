import { useId, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';
import Modal from './Modal';
import { useToast } from './Toast';
import { btnPrimary, btnSecondary, focusRing, inputClass, labelClass } from '../lib/ui';

const smallBtn = `inline-flex min-h-[36px] items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-text-muted hover:bg-surface-card hover:text-text-primary ${focusRing}`;

/**
 * 12d: switch between boards, and create / rename / delete them (FR-24).
 * A native <select> is used for switching: it's keyboard and screen-reader friendly
 * everywhere and scales to many boards.
 */
export default function BoardBar({ boards, currentBoard, onSelect, onCreate, onRename, onDelete }) {
  const showToast = useToast();
  const [dialog, setDialog] = useState(null); // 'create' | 'rename' | 'delete' | null
  const fallbackFocusId = boards.length ? 'board-select' : 'new-board-button';

  async function handleCreate(name) {
    await onCreate(name);
    setDialog(null);
    showToast(`Board "${name}" created.`);
  }

  async function handleRename(name) {
    await onRename(currentBoard.id, name);
    setDialog(null);
    showToast(`Board renamed to "${name}".`);
  }

  async function handleDelete() {
    const name = currentBoard.name;
    const wasLast = boards.length === 1;
    await onDelete(currentBoard.id);
    setDialog(null);
    showToast(`Board "${name}" deleted.`);
    // The Delete button disappears with the last board, so move focus somewhere sensible.
    if (wasLast) requestAnimationFrame(() => document.getElementById('new-board-button')?.focus());
  }

  return (
    <nav aria-label="Boards" className="mb-6 flex flex-wrap items-end gap-2 border-b border-border-subtle pb-4">
      {boards.length > 0 && (
        <div className="mr-1">
          <label htmlFor="board-select" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-text-muted">
            Board
          </label>
          <select
            id="board-select"
            value={currentBoard?.id ?? ''}
            onChange={(e) => onSelect(Number(e.target.value))}
            className={`${inputClass} min-w-[14rem] font-medium`}
          >
            {boards.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      )}

      {currentBoard && (
        <>
          <button type="button" className={smallBtn} onClick={() => setDialog('rename')}>
            <Pencil aria-hidden="true" className="h-4 w-4" />
            Rename<span className="sr-only"> board</span>
          </button>
          <button type="button" className={smallBtn} onClick={() => setDialog('delete')}>
            <Trash2 aria-hidden="true" className="h-4 w-4" />
            Delete<span className="sr-only"> board</span>
          </button>
        </>
      )}

      <button id="new-board-button" type="button" className={smallBtn} onClick={() => setDialog('create')}>
        <Plus aria-hidden="true" className="h-4 w-4" />
        New board
      </button>

      <BoardNameModal
        open={dialog === 'create'}
        title="New board"
        submitLabel="Create board"
        initialName=""
        fallbackFocusId={fallbackFocusId}
        onClose={() => setDialog(null)}
        onSubmit={handleCreate}
      />
      <BoardNameModal
        open={dialog === 'rename'}
        title="Rename board"
        submitLabel="Save name"
        initialName={currentBoard?.name ?? ''}
        fallbackFocusId={fallbackFocusId}
        onClose={() => setDialog(null)}
        onSubmit={handleRename}
      />
      {currentBoard && (
        <ConfirmDialog
          open={dialog === 'delete'}
          title="Delete board?"
          message={`Delete "${currentBoard.name}"? Its tasks and deliverable links will be deleted for everyone on the board. This can't be undone.`}
          confirmLabel="Delete board"
          fallbackFocusId={fallbackFocusId}
          onCancel={() => setDialog(null)}
          onConfirm={handleDelete}
        />
      )}
    </nav>
  );
}

function BoardNameModal({ open, title, submitLabel, initialName, fallbackFocusId, onClose, onSubmit }) {
  const headingId = useId();
  return (
    <Modal open={open} onClose={onClose} labelledBy={headingId} className="max-w-md" fallbackFocusId={fallbackFocusId}>
      <BoardNameForm
        headingId={headingId}
        title={title}
        submitLabel={submitLabel}
        initialName={initialName}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}

function BoardNameForm({ headingId, title, submitLabel, initialName, onClose, onSubmit }) {
  const inputId = useId();
  const errorId = useId();
  const [name, setName] = useState(initialName);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Give the board a name.');
      document.getElementById(inputId)?.focus();
      return;
    }
    setSaving(true);
    try {
      await onSubmit(trimmed);
    } catch (err) {
      setError(err.fieldErrors?.name ?? err.message);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="border-b border-border-subtle px-5 py-4">
        <h2 id={headingId} className="text-lg font-semibold">{title}</h2>
      </div>
      <div className="px-5 py-4">
        <label htmlFor={inputId} className={labelClass}>Board name</label>
        <input
          id={inputId}
          type="text"
          value={name}
          maxLength={100}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : undefined}
          placeholder="e.g. Final project, Hackathon, Side quest"
          className={inputClass}
          data-autofocus
        />
        {error && <p id={errorId} className="mt-1 text-sm text-due-overdue">{error}</p>}
      </div>
      <div className="flex justify-end gap-2 border-t border-border-subtle px-5 py-4">
        <button type="button" className={btnSecondary} onClick={onClose}>Cancel</button>
        <button type="submit" className={btnPrimary} disabled={saving}>{submitLabel}</button>
      </div>
    </form>
  );
}
