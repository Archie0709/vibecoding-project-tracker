import { useState } from 'react';
import { HardDriveUpload } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';
import { useToast } from './Toast';
import * as api from '../api';
import { useMembers } from '../hooks/useMembers';
import { resolveAssignee } from '../lib/assignee';
import { STAGES, TASK_TYPES } from '../lib/constants';
import { btnPrimary, btnSecondary } from '../lib/ui';

const STATUS_IDS = STAGES.map((s) => s.id);
const TYPE_IDS = TASK_TYPES.map((t) => t.id);

/**
 * 12f: tasks used to be saved in the browser (M4–12e). If any are still here, offer a
 * one-off import into the open board so nothing written before the switch is lost
 * (e.g. real AI-context notes). Names are matched to board members where possible.
 */
export default function LocalTasksBanner({ board, onImported }) {
  const { members } = useMembers();
  const showToast = useToast();
  const [localTasks, setLocalTasks] = useState(() => api.findLocalTasks());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  if (localTasks.length === 0) return null;

  const count = localTasks.length;
  const label = `${count} task${count === 1 ? '' : 's'}`;

  async function handleImport() {
    setBusy(true);
    setError('');
    try {
      const prepared = localTasks.map((t) => {
        const owner = resolveAssignee(t, members);
        return {
          title: String(t.title || 'Untitled task').slice(0, 120),
          description: t.description ?? '',
          type: TYPE_IDS.includes(t.type) ? t.type : 'feature',
          status: STATUS_IDS.includes(t.status) ? t.status : 'todo',
          assigneeId: owner?.isMember ? owner.id : null,
          dueDate: t.dueDate || null,
          context: t.context ?? '',
          contextTool: t.contextTool || null,
          createdDate: t.createdDate || null,
        };
      });
      await api.importTasks(board.id, prepared);
      api.clearLocalTasks();
      setLocalTasks([]);
      await onImported();
      showToast(`Imported ${label} into "${board.name}".`);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  function handleDiscard() {
    api.clearLocalTasks();
    setConfirmDiscard(false);
    setLocalTasks([]);
    showToast(`Discarded ${label} saved in this browser.`);
  }

  return (
    <section
      aria-label="Tasks saved in this browser"
      className="mb-4 flex flex-wrap items-center gap-3 rounded-md border border-brand-accent/50 bg-brand-accent/5 px-4 py-3"
    >
      <HardDriveUpload aria-hidden="true" className="h-5 w-5 shrink-0 text-brand-accent" />
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-medium">
          You have {label} saved in this browser from before tasks moved to the server.
        </p>
        <p className="text-text-muted">
          Import them into &ldquo;{board.name}&rdquo; so your team can see them, or discard them.
        </p>
        {error && <p role="alert" className="mt-1 text-due-overdue">{error}</p>}
      </div>
      <div className="flex gap-2">
        <button type="button" className={btnSecondary} onClick={() => setConfirmDiscard(true)} disabled={busy}>
          Discard
        </button>
        <button id="import-local-tasks" type="button" className={btnPrimary} onClick={handleImport} disabled={busy}>
          {busy ? 'Importing…' : `Import ${label}`}
        </button>
      </div>

      <ConfirmDialog
        open={confirmDiscard}
        title="Discard browser tasks?"
        message={`Discard the ${label} saved in this browser? They haven't been imported anywhere, so this can't be undone.`}
        confirmLabel="Discard"
        fallbackFocusId="new-task-button"
        onCancel={() => setConfirmDiscard(false)}
        onConfirm={handleDiscard}
      />
    </section>
  );
}
