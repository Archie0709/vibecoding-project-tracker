import { useId } from 'react';
import Modal from './Modal';
import { btnDangerSolid, btnSecondary } from '../lib/ui';

/**
 * Confirmation for destructive actions (Nielsen heuristic: error prevention).
 * Focus starts on Cancel — the safe choice — per the WAI-ARIA alertdialog pattern.
 */
export default function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', onConfirm, onCancel, fallbackFocusId }) {
  const titleId = useId();
  const messageId = useId();

  return (
    <Modal
      open={open}
      onClose={onCancel}
      role="alertdialog"
      labelledBy={titleId}
      describedBy={messageId}
      className="max-w-sm"
      fallbackFocusId={fallbackFocusId}
    >
      <div className="p-5">
        <h2 id={titleId} className="text-base font-semibold">{title}</h2>
        <p id={messageId} className="mt-2 text-sm text-text-muted">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className={btnSecondary} onClick={onCancel} data-autofocus>
            Cancel
          </button>
          <button type="button" className={btnDangerSolid} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
