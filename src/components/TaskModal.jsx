import { useId, useRef, useState } from 'react';
import Modal from './Modal';
import ConfirmDialog from './ConfirmDialog';
import CopyPromptButton from './CopyPromptButton';
import MarkdownEditor from './MarkdownEditor';
import { useMembers } from '../hooks/useMembers';
import { resolveAssignee } from '../lib/assignee';
import { AI_TOOLS, STAGES, TASK_TYPES } from '../lib/constants';
import { formatTimestamp } from '../lib/dates';
import { typeStyle } from '../lib/taskTypes';
import { btnDanger, btnPrimary, btnSecondary, inputClass, labelClass } from '../lib/ui';

const TITLE_MAX = 120;

const EMPTY_TASK = {
  title: '',
  description: '',
  type: 'feature',
  status: 'todo',
  assigneeId: '',
  dueDate: '',
  context: '',
  contextTool: '',
};

/** One modal for both creating and editing a task (FR-03, FR-04, FR-05, M9 context FR-14–16). */
export default function TaskModal({ open, task, onClose, onSave, onDelete }) {
  const titleId = useId();
  return (
    <Modal open={open} onClose={onClose} labelledBy={titleId} className="max-w-3xl">
      <TaskForm headingId={titleId} task={task} onClose={onClose} onSave={onSave} onDelete={onDelete} />
    </Modal>
  );
}

function TaskForm({ headingId, task, onClose, onSave, onDelete }) {
  const isEdit = Boolean(task);
  const { members } = useMembers();
  const [values, setValues] = useState(() => {
    if (!isEdit) return EMPTY_TASK;
    const owner = resolveAssignee(task, members);
    return {
      ...EMPTY_TASK,
      ...task,
      assigneeId: owner?.id != null ? String(owner.id) : '',
      dueDate: task.dueDate ?? '',
      context: task.context ?? '',
      contextTool: task.contextTool ?? '',
    };
  });
  const [titleError, setTitleError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const titleInputRef = useRef(null);

  const ids = {
    title: useId(),
    titleError: useId(),
    description: useId(),
    descriptionHint: useId(),
    status: useId(),
    assignee: useId(),
    dueDate: useId(),
    context: useId(),
    contextHint: useId(),
    contextTool: useId(),
  };

  const set = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    const title = values.title.trim();
    if (!title) {
      setTitleError('Give the task a title.');
      titleInputRef.current?.focus();
      return;
    }
    setTitleError('');

    // FR-16: stamp the context time automatically, only when the context or tool actually changed.
    const context = values.context.trimEnd();
    const contextTool = values.contextTool || null;
    const contextChanged = context !== (task?.context ?? '') || contextTool !== (task?.contextTool ?? null);
    const contextUpdatedAt = contextChanged ? new Date().toISOString() : task?.contextUpdatedAt ?? null;

    setSaving(true);
    setSaveError('');
    try {
      await onSave({
        title,
        description: values.description.trim(),
        type: values.type,
        status: values.status,
        assigneeId: values.assigneeId ? Number(values.assigneeId) : null,
        assignee: '', // pre-12e name field, replaced by assigneeId
        dueDate: values.dueDate || null,
        context,
        contextTool,
        contextUpdatedAt: context || contextTool ? contextUpdatedAt : null,
      });
    } catch (err) {
      const detail = Object.values(err.fieldErrors ?? {})[0] ?? err.message;
      setSaveError(`Couldn't save: ${detail}`);
      setSaving(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} noValidate>
        <div className="border-b border-border-subtle px-5 py-4">
          <h2 id={headingId} className="text-lg font-semibold">
            {isEdit ? 'Edit task' : 'New task'}
          </h2>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div>
            <label htmlFor={ids.title} className={labelClass}>
              Title <span className="font-normal text-text-muted">(required)</span>
            </label>
            <input
              ref={titleInputRef}
              id={ids.title}
              type="text"
              value={values.title}
              onChange={set('title')}
              maxLength={TITLE_MAX}
              required
              aria-invalid={titleError ? 'true' : 'false'}
              aria-describedby={titleError ? ids.titleError : undefined}
              className={inputClass}
              data-autofocus
            />
            {titleError && (
              <p id={ids.titleError} className="mt-1 text-sm text-due-overdue">
                {titleError}
              </p>
            )}
          </div>

          <div>
            <MarkdownEditor
              id={ids.description}
              label="Description"
              rows={4}
              value={values.description}
              onChange={set('description')}
              describedBy={ids.descriptionHint}
              header={
                <>
                  <label htmlFor={ids.description} className={labelClass}>Description</label>
                  <p id={ids.descriptionHint} className="-mt-0.5 text-xs text-text-muted">
                    Markdown supported: **bold**, _italic_, `code`, - lists, [links](https://…)
                  </p>
                </>
              }
            />
          </div>

          <fieldset>
            <legend className={labelClass}>Type</legend>
            <div className="flex gap-2">
              {TASK_TYPES.map((t) => {
                const { Icon, text, ring, tint } = typeStyle(t.id);
                const checked = values.type === t.id;
                return (
                  <label
                    key={t.id}
                    className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-primary ${
                      checked ? `border-transparent ring-2 ${ring} ${tint} ${text} font-medium` : 'border-border-strong text-text-primary hover:bg-surface-card'
                    }`}
                  >
                    <input
                      type="radio"
                      name="task-type"
                      value={t.id}
                      checked={checked}
                      onChange={set('type')}
                      className="sr-only"
                    />
                    <Icon aria-hidden="true" className="h-4 w-4" />
                    {t.label}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={ids.status} className={labelClass}>Status</label>
              <select id={ids.status} value={values.status} onChange={set('status')} className={inputClass}>
                {STAGES.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={ids.assignee} className={labelClass}>Assignee</label>
              <select id={ids.assignee} value={values.assigneeId} onChange={set('assigneeId')} className={inputClass}>
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={ids.dueDate} className={labelClass}>Due date</label>
              <input
                id={ids.dueDate}
                type="date"
                value={values.dueDate}
                onChange={set('dueDate')}
                className={inputClass}
              />
            </div>
          </div>

          {/* M9 context: the curated briefing for the next AI tool or teammate (FR-14, FR-15, FR-16). */}
          <div className="rounded-md border border-border-subtle bg-surface-page/40 p-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <label htmlFor={ids.context} className={labelClass}>AI context</label>
                <p id={ids.contextHint} className="text-xs text-text-muted">
                  Paste what the next AI tool or teammate needs: the prompt, conversation, bug log or requirements. Markdown supported.
                </p>
              </div>
              <div className="w-44">
                <label htmlFor={ids.contextTool} className={labelClass}>AI tool used</label>
                <select
                  id={ids.contextTool}
                  value={values.contextTool}
                  onChange={set('contextTool')}
                  className={inputClass}
                >
                  <option value="">Not specified</option>
                  {AI_TOOLS.map((tool) => (
                    <option key={tool} value={tool}>{tool}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-3">
              <MarkdownEditor
                id={ids.context}
                label="AI context"
                rows={8}
                mono
                value={values.context}
                onChange={set('context')}
                describedBy={ids.contextHint}
              />
            </div>
            <p className="mt-2 flex justify-between text-xs text-text-muted">
              <span>
                {task?.contextUpdatedAt
                  ? <>Last updated <time dateTime={task.contextUpdatedAt}>{formatTimestamp(task.contextUpdatedAt)}</time></>
                  : 'Not saved yet'}
              </span>
              <span>{values.context.length.toLocaleString('en-GB')} characters</span>
            </p>
          </div>

          {saveError && (
            <p role="alert" className="text-sm text-due-overdue">{saveError}</p>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border-subtle px-5 py-4">
          <div className="flex gap-2">
            {isEdit && (
              <button type="button" className={btnDanger} onClick={() => setConfirmingDelete(true)}>
                Delete
              </button>
            )}
            {/* Copies what is currently in the form, including unsaved edits. */}
            <CopyPromptButton
              variant="modal"
              task={{
                ...task,
                ...values,
                assignee: members.find((m) => String(m.id) === values.assigneeId)?.name ?? '',
                title: values.title.trim() || 'Untitled task',
                dueDate: values.dueDate || null,
                contextTool: values.contextTool || null,
              }}
            />
          </div>
          <div className="flex gap-2">
            <button type="button" className={btnSecondary} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={btnPrimary} disabled={saving}>
              {isEdit ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </div>
      </form>

      {isEdit && (
        <ConfirmDialog
          open={confirmingDelete}
          title="Delete task?"
          message={`Delete "${task.title}"? This can't be undone.`}
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={() => onDelete(task.id)}
        />
      )}
    </>
  );
}
