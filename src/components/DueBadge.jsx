/** Icon + text chip for a task's due state, e.g. [⚠ Due tomorrow · 21 Oct]. */
export default function DueBadge({ state, dueDate }) {
  const { Icon, label, text, chip } = state;
  return (
    <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-medium ring-1 ${text} ${chip}`}>
      <Icon aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.25} />
      {dueDate ? <time dateTime={dueDate}>{label}</time> : label}
    </span>
  );
}
