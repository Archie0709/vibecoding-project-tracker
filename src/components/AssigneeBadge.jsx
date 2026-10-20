import { UserRound } from 'lucide-react';

function initials(name) {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/**
 * M7 task-owner: shows who owns a task as an initials avatar plus their name.
 * The name is always written out, so the avatar is decorative (aria-hidden).
 */
export default function AssigneeBadge({ name }) {
  if (!name) {
    return (
      <span className="inline-flex items-center gap-1.5 text-text-muted">
        <UserRound aria-hidden="true" className="h-4 w-4" />
        Unassigned
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-text-primary">
      <span
        aria-hidden="true"
        className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary/15 font-mono text-[10px] font-semibold text-brand-primary ring-1 ring-brand-primary/40"
      >
        {initials(name)}
      </span>
      {name}
    </span>
  );
}
