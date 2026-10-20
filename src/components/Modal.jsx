import { useEffect, useRef } from 'react';

/**
 * Accessible modal built on the native <dialog> element (showModal), which gives us
 * for free: the page behind becomes inert (focus stays inside), Esc closes it, and it
 * sits above everything else. On top of that we:
 *   - move focus to the element marked `data-autofocus` (or the first field) on open
 *   - return focus to whatever opened the modal when it closes (WAI-ARIA APG dialog pattern)
 *
 * Children are only rendered while open, so forms reset each time.
 */
export default function Modal({
  open,
  onClose,
  labelledBy,
  describedBy,
  role = 'dialog',
  fallbackFocusId = 'new-task-button',
  className = 'max-w-lg',
  children,
}) {
  const dialogRef = useRef(null);
  const openerRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      openerRef.current = document.activeElement;
      dialog.showModal();
      const target = dialog.querySelector('[data-autofocus]');
      if (target) target.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }

    if (!open && openerRef.current) {
      const opener = openerRef.current;
      openerRef.current = null;
      // The opener may no longer exist (e.g. the task was deleted) — fall back to a stable control.
      if (opener.isConnected) opener.focus();
      else document.getElementById(fallbackFocusId)?.focus();
    }
  }, [open, fallbackFocusId]);

  return (
    <dialog
      ref={dialogRef}
      role={role === 'dialog' ? undefined : role}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onCancel={(e) => {
        // Esc: let React state drive closing so focus is restored properly.
        e.preventDefault();
        onClose();
      }}
      className={`w-[calc(100%-2rem)] ${className} rounded-lg bg-surface-raised p-0 text-text-primary shadow-2xl ring-1 ring-border-subtle backdrop:bg-black/60`}
    >
      {open && children}
    </dialog>
  );
}
