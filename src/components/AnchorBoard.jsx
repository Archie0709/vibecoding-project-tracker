import { useId, useRef, useState } from 'react';
import { BookOpen, ExternalLink, FileText, MonitorPlay, Pencil, Pin, Plus, Presentation } from 'lucide-react';
import Modal from './Modal';
import { useToast } from './Toast';
import { displayHost, normaliseUrl } from '../lib/url';
import { btnPrimary, btnSecondary, focusRing, inputClass, labelClass } from '../lib/ui';

const ICONS = {
  presentation: Presentation,
  demo: MonitorPlay,
  report: FileText,
  documentation: BookOpen,
};

/**
 * M11 project-deliverables (FR-18, FR-19): four pinned slots above the board so the
 * final deliverables are always one click away.
 */
export default function AnchorBoard({ anchors, onSave }) {
  const headingId = useId();
  const showToast = useToast();
  const [editing, setEditing] = useState(null);

  async function handleSave(anchor, url) {
    await onSave(anchor.id, { url });
    setEditing(null);
    showToast(url ? `${anchor.label} link saved.` : `${anchor.label} link removed.`);
  }

  return (
    <section aria-labelledby={headingId} className="mb-6">
      <h2
        id={headingId}
        className="mb-2 flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-wider text-text-muted"
      >
        <Pin aria-hidden="true" className="h-3.5 w-3.5" />
        Deliverables
      </h2>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {anchors.map((anchor) => (
          <li key={anchor.id}>
            <AnchorTile anchor={anchor} onEdit={() => setEditing(anchor)} />
          </li>
        ))}
      </ul>

      <AnchorModal
        anchor={editing}
        onClose={() => setEditing(null)}
        onSave={handleSave}
      />
    </section>
  );
}

function AnchorTile({ anchor, onEdit }) {
  const Icon = ICONS[anchor.id] ?? FileText;
  const hasLink = Boolean(anchor.url);

  return (
    <div
      className={`flex h-full items-center gap-3 rounded-md p-3 ${
        hasLink
          ? 'border border-border-subtle bg-surface-card'
          : 'border border-dashed border-border-subtle'
      }`}
    >
      <Icon aria-hidden="true" className={`h-5 w-5 shrink-0 ${hasLink ? 'text-brand-primary' : 'text-text-muted'}`} />

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-text-primary">{anchor.label}</p>
        {hasLink ? (
          <a
            href={anchor.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex max-w-full items-center gap-1 truncate text-xs text-brand-accent underline-offset-2 hover:underline ${focusRing}`}
          >
            <span className="sr-only">Open {anchor.label}: </span>
            <span className="truncate">{displayHost(anchor.url)}</span>
            <ExternalLink aria-hidden="true" className="h-3 w-3 shrink-0" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : (
          <p className="text-xs text-text-muted">No link yet</p>
        )}
      </div>

      <button
        type="button"
        onClick={onEdit}
        className={`inline-flex shrink-0 items-center gap-1 rounded px-2 py-1 text-xs text-text-muted hover:bg-surface-raised hover:text-text-primary ${focusRing}`}
      >
        {hasLink ? <Pencil aria-hidden="true" className="h-3.5 w-3.5" /> : <Plus aria-hidden="true" className="h-3.5 w-3.5" />}
        {hasLink ? 'Edit' : 'Add link'}
        <span className="sr-only"> for {anchor.label}</span>
      </button>
    </div>
  );
}

function AnchorModal({ anchor, onClose, onSave }) {
  const titleId = useId();
  return (
    <Modal open={Boolean(anchor)} onClose={onClose} labelledBy={titleId} className="max-w-md">
      {anchor && <AnchorForm headingId={titleId} anchor={anchor} onClose={onClose} onSave={onSave} />}
    </Modal>
  );
}

function AnchorForm({ headingId, anchor, onClose, onSave }) {
  const inputId = useId();
  const errorId = useId();
  const hintId = useId();
  const inputRef = useRef(null);
  const [value, setValue] = useState(anchor.url ?? '');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!value.trim()) {
      await onSave(anchor, null);
      return;
    }
    const url = normaliseUrl(value);
    if (!url) {
      setError('Enter a web link, e.g. https://docs.google.com/…');
      inputRef.current?.focus();
      return;
    }
    await onSave(anchor, url);
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="border-b border-border-subtle px-5 py-4">
        <h2 id={headingId} className="text-lg font-semibold">{anchor.label} link</h2>
      </div>
      <div className="px-5 py-4">
        <label htmlFor={inputId} className={labelClass}>Link</label>
        <input
          ref={inputRef}
          id={inputId}
          type="url"
          inputMode="url"
          autoComplete="url"
          placeholder="https://"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${errorId} ${hintId}` : hintId}
          className={inputClass}
          data-autofocus
        />
        {error && <p id={errorId} className="mt-1 text-sm text-due-overdue">{error}</p>}
        <p id={hintId} className="mt-2 text-xs text-text-muted">
          Paste a link to a shared file or page (Google Drive, OneDrive, GitHub, a hosted demo…). Leave it empty and save to remove the link.
        </p>
      </div>
      <div className="flex justify-end gap-2 border-t border-border-subtle px-5 py-4">
        <button type="button" className={btnSecondary} onClick={onClose}>Cancel</button>
        <button type="submit" className={btnPrimary}>Save link</button>
      </div>
    </form>
  );
}
