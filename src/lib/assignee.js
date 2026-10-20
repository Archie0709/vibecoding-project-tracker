/**
 * 12e: tasks store their owner as `assigneeId` (a user id). Tasks made before 12e
 * stored a plain name in `assignee`; those are matched to a board member by name
 * where possible, so nothing is lost.
 *
 * Returns { id, name, isMember } or null when the task is unassigned.
 */
export function resolveAssignee(task, members) {
  if (task.assigneeId != null) {
    const member = members.find((m) => m.id === task.assigneeId);
    return member
      ? { id: member.id, name: member.name, isMember: true }
      : { id: task.assigneeId, name: 'Former member', isMember: false };
  }

  if (task.assignee) {
    const legacy = task.assignee.trim().toLowerCase();
    const match = members.find((m) => {
      const name = m.name.toLowerCase();
      return name === legacy || name.split(/\s+/)[0] === legacy;
    });
    return match
      ? { id: match.id, name: match.name, isMember: true }
      : { id: null, name: task.assignee, isMember: false };
  }

  return null;
}

/** Initials for the avatar, e.g. "Archie Neale" → "AN". */
export function initials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
