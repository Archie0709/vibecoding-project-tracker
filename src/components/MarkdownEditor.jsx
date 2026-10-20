import { useId, useState } from 'react';
import { Columns2, Eye, PencilLine } from 'lucide-react';
import Markdown from './Markdown';
import { inputClass } from '../lib/ui';

const VIEWS = [
  { id: 'write', label: 'Write', Icon: PencilLine },
  { id: 'split', label: 'Split', Icon: Columns2 },
  { id: 'preview', label: 'Preview', Icon: Eye },
];

const VIEW_KEY = 'vibetracker.markdownView';

function loadView() {
  try {
    const saved = window.localStorage.getItem(VIEW_KEY);
    return VIEWS.some((v) => v.id === saved) ? saved : 'write';
  } catch {
    return 'write';
  }
}

/**
 * A Markdown text field with three views, like GitHub's editor (12a, FR-21):
 *   Write   — just the text box (full width, no space wasted on a preview)
 *   Split   — text box and live preview side by side
 *   Preview — just the rendered result
 * The chosen view is remembered (per browser) so users don't have to re-pick it.
 *
 * The view switch is a real radio group, so it is keyboard and screen-reader friendly.
 * The label for the field is rendered by the parent (optionally via `header`, which sits
 * on the same row as the view switch) and points at `id`.
 */
export default function MarkdownEditor({
  id,
  label,
  value,
  onChange,
  rows = 4,
  mono = false,
  describedBy,
  placeholder,
  header = null,
}) {
  const [view, setViewState] = useState(loadView);
  const groupName = useId();
  const previewId = useId();

  function setView(next) {
    setViewState(next);
    try {
      window.localStorage.setItem(VIEW_KEY, next);
    } catch {
      /* ignore */
    }
  }

  const showEditor = view !== 'preview';
  const showPreview = view !== 'write';
  const minHeight = `${rows * 1.6 + 1.25}rem`;

  return (
    <div>
      <div className="mb-1.5 flex flex-wrap items-end justify-between gap-2">
        <div>{header}</div>
        <fieldset>
          <legend className="sr-only">{label} view</legend>
          <div className="inline-flex rounded-md border border-border-strong p-0.5">
            {VIEWS.map(({ id: viewId, label: viewLabel, Icon }) => {
              const checked = view === viewId;
              return (
                <label
                  key={viewId}
                  className={`flex cursor-pointer items-center gap-1 rounded px-2 py-0.5 text-xs has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand-primary ${
                    checked ? 'bg-brand-primary/15 font-medium text-brand-primary' : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  <input
                    type="radio"
                    name={groupName}
                    value={viewId}
                    checked={checked}
                    onChange={() => setView(viewId)}
                    className="sr-only"
                  />
                  <Icon aria-hidden="true" className="h-3.5 w-3.5" />
                  {viewLabel}
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>

      <div className={view === 'split' ? 'grid grid-cols-1 gap-3 md:grid-cols-2' : ''}>
        {showEditor && (
          <textarea
            id={id}
            rows={rows}
            value={value}
            onChange={onChange}
            aria-describedby={describedBy}
            placeholder={placeholder}
            spellCheck={!mono}
            className={`${inputClass} ${mono ? 'font-mono text-[13px] leading-relaxed' : ''}`}
            style={{ minHeight }}
          />
        )}

        {showPreview && (
          <div
            id={previewId}
            role="region"
            aria-label={`${label} preview`}
            tabIndex={0}
            className="overflow-auto rounded-md border border-border-subtle bg-surface-page/40 px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary"
            style={{ minHeight, maxHeight: view === 'split' ? '24rem' : undefined }}
          >
            {value.trim() ? (
              <Markdown>{value}</Markdown>
            ) : (
              <p className="text-sm italic text-text-muted">Nothing to preview yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
