import { useEffect, useId, useState } from 'react';
import { UserMinus, UserPlus, Users } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';
import Modal from './Modal';
import { useToast } from './Toast';
import * as api from '../api';
import { useAuth } from '../hooks/useAuth';
import { useMembers } from '../hooks/useMembers';
import { initials } from '../lib/assignee';
import { btnPrimary, btnSecondary, focusRing, inputClass, labelClass } from '../lib/ui';

/**
 * 12e: who is on this board, and adding / removing people (FR-25).
 * Everyone on a board is an equal admin (small, self-managed team), so any member
 * can add anyone with an account on this instance, or remove anyone — including
 * themselves, which means leaving the board.
 */
export default function MembersPanel({ board, onLeft }) {
  const { members } = useMembers();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        id="members-button"
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex min-h-[36px] items-center gap-2 rounded-md border border-border-strong px-3 py-1.5 text-sm text-text-primary hover:bg-surface-card ${focusRing}`}
      >
        <span aria-hidden="true" className="flex -space-x-1.5">
          {members.slice(0, 3).map((m) => (
            <span
              key={m.id}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-raised font-mono text-[10px] font-semibold text-brand-primary ring-2 ring-surface-page"
            >
              {initials(m.name)}
            </span>
          ))}
        </span>
        <Users aria-hidden="true" className="h-4 w-4 text-text-muted" />
        Members ({members.length})
      </button>

      <MembersModal open={open} board={board} onClose={() => setOpen(false)} onLeft={onLeft} />
    </>
  );
}

function MembersModal({ open, board, onClose, onLeft }) {
  const headingId = useId();
  return (
    <Modal open={open} onClose={onClose} labelledBy={headingId} className="max-w-lg" fallbackFocusId="members-button">
      <MembersContent headingId={headingId} board={board} onClose={onClose} onLeft={onLeft} />
    </Modal>
  );
}

function MembersContent({ headingId, board, onClose, onLeft }) {
  const { user } = useAuth();
  const { members, addMember, removeMember } = useMembers();
  const showToast = useToast();
  const selectId = useId();
  const errorId = useId();

  const [allUsers, setAllUsers] = useState(null);
  const [selected, setSelected] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [removing, setRemoving] = useState(null); // the member being removed
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    api.listUsers().then(setAllUsers).catch((e) => setError(e.message));
  }, []);

  const memberIds = new Set(members.map((m) => m.id));
  const candidates = (allUsers ?? []).filter((u) => !memberIds.has(u.id));

  async function handleAdd(e) {
    e.preventDefault();
    if (!selected) {
      setError('Choose someone to add.');
      document.getElementById(selectId)?.focus();
      return;
    }
    setBusy(true);
    setError('');
    try {
      await addMember(Number(selected));
      const added = allUsers.find((u) => u.id === Number(selected));
      setSelected('');
      showToast(`${added?.name ?? 'They'} can now see and edit "${board.name}".`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove() {
    const target = removing;
    const isMe = target.id === user.id;
    try {
      await removeMember(target.id);
      setConfirmOpen(false);
      if (isMe) {
        onClose();
        showToast(`You left "${board.name}".`);
        onLeft(board.id);
      } else {
        showToast(`${target.name} was removed from "${board.name}".`);
      }
    } catch (err) {
      setConfirmOpen(false);
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="border-b border-border-subtle px-5 py-4">
        <h2 id={headingId} className="text-lg font-semibold">Board members</h2>
        <p className="mt-1 text-sm text-text-muted">
          Everyone on &ldquo;{board.name}&rdquo; can edit it, add people and remove people.
        </p>
      </div>

      <div className="px-5 py-4">
        <ul className="divide-y divide-border-subtle" aria-label="Members">
          {members.map((m) => {
            const isMe = m.id === user.id;
            return (
              <li key={m.id} className="flex items-center gap-3 py-2.5">
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-primary/15 font-mono text-xs font-semibold text-brand-primary ring-1 ring-brand-primary/40"
                >
                  {initials(m.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {m.name} {isMe && <span className="font-normal text-text-muted">(you)</span>}
                  </p>
                  <p className="truncate text-xs text-text-muted">
                    {m.email}
                    {m.githubHandle && <> · @{m.githubHandle}</>}
                  </p>
                </div>
                {members.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      setRemoving(m);
                      setConfirmOpen(true);
                    }}
                    className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-text-muted hover:bg-surface-card hover:text-due-overdue ${focusRing}`}
                  >
                    <UserMinus aria-hidden="true" className="h-3.5 w-3.5" />
                    {isMe ? 'Leave' : 'Remove'}
                    <span className="sr-only">{isMe ? ` "${board.name}"` : ` ${m.name}`}</span>
                  </button>
                )}
              </li>
            );
          })}
        </ul>

        <form onSubmit={handleAdd} noValidate className="mt-4 border-t border-border-subtle pt-4">
          <label htmlFor={selectId} className={labelClass}>Add a person</label>
          {allUsers && candidates.length === 0 ? (
            <p className="text-sm text-text-muted">Everyone with an account is already on this board.</p>
          ) : (
            <div className="flex gap-2">
              <select
                id={selectId}
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? errorId : undefined}
                className={inputClass}
                disabled={!allUsers}
              >
                <option value="">{allUsers ? 'Choose someone…' : 'Loading people…'}</option>
                {candidates.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
              <button type="submit" className={`${btnPrimary} shrink-0`} disabled={busy || !allUsers}>
                <UserPlus aria-hidden="true" className="h-4 w-4" />
                Add
              </button>
            </div>
          )}
          {error && <p id={errorId} role="alert" className="mt-1 text-sm text-due-overdue">{error}</p>}
          <p className="mt-2 text-xs text-text-muted">
            People need an account first. They can create one from the login page.
          </p>
        </form>
      </div>

      <div className="flex justify-end border-t border-border-subtle px-5 py-4">
        <button id="members-done" type="button" className={btnSecondary} onClick={onClose}>Done</button>
      </div>

      {removing && (
        <ConfirmDialog
          open={confirmOpen}
          title={removing.id === user.id ? 'Leave board?' : 'Remove member?'}
          message={
            removing.id === user.id
              ? `Leave "${board.name}"? You won't see it any more unless someone adds you back.`
              : `Remove ${removing.name} from "${board.name}"? They won't see this board any more. Their tasks stay on the board, unassigned.`
          }
          confirmLabel={removing.id === user.id ? 'Leave board' : 'Remove'}
          fallbackFocusId="members-done"
          onCancel={() => setConfirmOpen(false)}
          onConfirm={handleRemove}
        />
      )}
    </div>
  );
}
