import { useId, useRef, useState } from 'react';
import Modal from './Modal';
import ConfirmDialog from './ConfirmDialog';
import { STAGES, TASK_TYPES, TEAM } from '../lib/constants';
import { typeStyle } from '../lib/taskTypes';
import { btnDanger, btnPrimary, btnSecondary, inputClass, labelClass } from '../lib/ui';

const TITLE_MAX = 120;

const EMPTY_TASK = {
  title: '',
  description: '',
  type: 'feature',
  status: 'todo',
  assignee: '',
  dueDate: '',
};

/** One modal for both creating and editing a task (FR-03, FR-04, FR-05). */
export default function TaskModal({ open, task, onClose, onSave, onDelete }) {
  const titleId = useId();
  return (
    <Modal open={open} onClose={onClose} labelledBy={titleId}>
      <TaskForm headingId={titleId} task={task} onClose={onClose} onSave={onSave} onDelete={onDelete} />
    </Modal>
  );
}

function TaskForm({ headingId, task, onClose, onSave, onDelete }) {
  const isEdit = Boolean(task);
  const [values, setValues] = useState(() =>
    isEdit ? { ...EMPTY_TASK, ...task, dueDate: task.dueDate ?? '' } : EMPTY_TASK,
  );
  const [titleError, setTitleError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const titleInputRef = useRef(null);

  const ids = {
    title: useId(),
    titleError: useId(),
    description: useId(),
    status: useId(),
    assignee: useId(),
    dueDate: useId(),
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
    setSaving(true);
    setSaveError('');
    try {
      await onSave({
        title,
        description: values.description.trim(),
        type: values.type,
        status: values.status,
        assignee: values.assignee,
        dueDate: values.dueDate || null,
      });
    } catch (err) {
      setSaveError(`Couldn't save: ${err.message}`);
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
            <label htmlFor={ids.description} className={labelClass}>Description</label>
            <textarea
              id={ids.description}
              rows={4}
              value={values.description}
              onChange={set('description')}
              className={inputClass}
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
              <select id={ids.assignee} value={values.assignee} onChange={set('assignee')} className={inputClass}>
                <option value="">Unassigned</option>
                {TEAM.map((name) => (
                  <option key={name} value={name}>{name}</option>
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

          {/* TODO M9 context: Context textarea + AI tool picker go here. */}

          {saveError && (
            <p role="alert" className="text-sm text-due-overdue">{saveError}</p>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border-subtle px-5 py-4">
          <div>
            {isEdit && (
              <button type="button" className={btnDanger} onClick={() => setConfirmingDelete(true)}>
                Delete
              </button>
            )}
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
