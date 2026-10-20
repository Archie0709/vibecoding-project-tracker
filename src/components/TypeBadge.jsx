import { typeStyle } from '../lib/taskTypes';

/** Icon + label in the task-type colour, e.g. [✦ Feature]. The icon is decorative; the text carries the meaning. */
export default function TypeBadge({ type }) {
  const { label, Icon, text, tint } = typeStyle(type);
  return (
    <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-xs font-medium ${text} ${tint}`}>
      <Icon aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.25} />
      {label}
    </span>
  );
}
