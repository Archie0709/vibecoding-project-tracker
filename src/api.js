/**
 * Data layer — the ONLY place the app reads or writes data.
 *
 * M4–M11: backed by localStorage.
 * M12:    the bodies of these functions are swapped for fetch() calls to the
 *         Spring Boot REST API. They are already async, so components using
 *         them won't need to change.
 */
import { seedAnchors, seedTasks } from './lib/seed';
import { toISODate } from './lib/dates';

const TASKS_KEY = 'vibetracker.tasks';
const ANCHORS_KEY = 'vibetracker.anchors';

function read(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw != null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota or private-mode error — ignore for the hackathon */
  }
}

function newId() {
  return window.crypto?.randomUUID?.() ?? `t-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ---- Tasks ---------------------------------------------------------------

export async function listTasks() {
  let tasks = read(TASKS_KEY, null);
  if (tasks == null) {
    tasks = seedTasks();
    write(TASKS_KEY, tasks);
  }
  return tasks;
}

export async function createTask(input) {
  const tasks = await listTasks();
  const task = {
    title: '',
    description: '',
    type: 'feature',
    status: 'todo',
    assignee: '',
    dueDate: null,
    context: '',
    contextTool: null,
    contextUpdatedAt: null,
    ...input,
    id: newId(),
    createdDate: toISODate(),
  };
  write(TASKS_KEY, [...tasks, task]);
  return task;
}

export async function updateTask(id, patch) {
  const tasks = await listTasks();
  let updated = null;
  const next = tasks.map((t) => {
    if (t.id !== id) return t;
    updated = { ...t, ...patch, id: t.id, createdDate: t.createdDate };
    return updated;
  });
  if (!updated) throw new Error(`Task ${id} not found`);
  write(TASKS_KEY, next);
  return updated;
}

export async function deleteTask(id) {
  const tasks = await listTasks();
  write(TASKS_KEY, tasks.filter((t) => t.id !== id));
}

// ---- Deliverable anchors (M11) -------------------------------------------

export async function listAnchors() {
  let anchors = read(ANCHORS_KEY, null);
  if (anchors == null) {
    anchors = seedAnchors();
    write(ANCHORS_KEY, anchors);
  }
  return anchors;
}

export async function updateAnchor(id, patch) {
  const anchors = await listAnchors();
  let updated = null;
  const next = anchors.map((a) => {
    if (a.id !== id) return a;
    updated = { ...a, ...patch, id: a.id };
    return updated;
  });
  if (!updated) throw new Error(`Anchor ${id} not found`);
  write(ANCHORS_KEY, next);
  return updated;
}
