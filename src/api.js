/**
 * Data layer — the ONLY place the app reads or writes data.
 *
 * M4–M11: tasks and anchors are backed by localStorage.
 * 12c:    accounts (register / log in / log out) use the Spring Boot REST API.
 * 12f:    tasks and anchors switch to the REST API too. The functions are already
 *         async, so components using them won't need to change.
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

// ---- HTTP helper (REST API on Spring Boot, proxied by Vite at /api) --------

/** An error from the API, with an HTTP status and optional per-field messages. */
export class ApiError extends Error {
  constructor(status, message, fieldErrors = {}) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

const SERVER_DOWN = "Can't reach the server. Check the backend is running, then try again.";

async function request(path, { method = 'GET', body } = {}) {
  let response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin', // sends the HttpOnly login cookie
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, SERVER_DOWN);
  }

  if (response.status === 204) return null;

  let data = null;
  try {
    data = await response.json();
  } catch {
    /* empty or non-JSON body */
  }

  if (!response.ok) {
    // The Vite proxy answers 5xx with no JSON when the backend isn't running.
    const message = data?.message ?? (response.status >= 500 ? SERVER_DOWN : `Request failed (${response.status}).`);
    throw new ApiError(response.status, message, data?.fieldErrors ?? {});
  }
  return data;
}

// ---- Accounts (12c) --------------------------------------------------------

/** The logged-in user, or null if nobody is logged in. */
export async function getCurrentUser() {
  try {
    return await request('/auth/me');
  } catch (err) {
    if (err.status === 401) return null;
    throw err;
  }
}

export function register({ name, email, githubHandle, password }) {
  return request('/auth/register', {
    method: 'POST',
    body: { name, email, githubHandle: githubHandle || null, password },
  });
}

export function login({ email, password }) {
  return request('/auth/login', { method: 'POST', body: { email, password } });
}

export function logout() {
  return request('/auth/logout', { method: 'POST' });
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
