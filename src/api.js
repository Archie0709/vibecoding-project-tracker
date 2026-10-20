/**
 * Data layer — the ONLY place the app reads or writes data.
 *
 * M4–M11: tasks and anchors were backed by localStorage.
 * 12c:    accounts (register / log in / log out) use the Spring Boot REST API.
 * 12d:    boards and deliverable anchors use the REST API; tasks are kept per board
 *         in localStorage for now.
 * 12f:    tasks switch to the REST API too. The functions are already async and
 *         take a boardId, so components using them won't need to change.
 */
import { toISODate } from './lib/dates';

// Tasks stay in this browser until 12f, stored per board.
const tasksKey = (boardId) => `vibetracker.tasks.${boardId}`;
const LEGACY_TASKS_KEY = 'vibetracker.tasks'; // M4–M11 single-board storage

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

// ---- Boards (12d) ----------------------------------------------------------

export function listBoards() {
  return request('/boards');
}

export function createBoard(name) {
  return request('/boards', { method: 'POST', body: { name } });
}

export function renameBoard(boardId, name) {
  return request(`/boards/${boardId}`, { method: 'PATCH', body: { name } });
}

export function deleteBoard(boardId) {
  return request(`/boards/${boardId}`, { method: 'DELETE' });
}

// ---- Deliverable anchors (M11, per board from 12d) ------------------------

export function listAnchors(boardId) {
  return request(`/boards/${boardId}/anchors`);
}

export function updateAnchor(boardId, slot, { url }) {
  return request(`/boards/${boardId}/anchors/${slot}`, { method: 'PUT', body: { url } });
}

// ---- Tasks (localStorage per board until 12f) ------------------------------

export async function listTasks(boardId) {
  let tasks = read(tasksKey(boardId), null);
  if (tasks == null) {
    // One-off move: the first board opened inherits the tasks from the M4–M11 single board.
    tasks = read(LEGACY_TASKS_KEY, []);
    write(tasksKey(boardId), tasks);
    try {
      window.localStorage.removeItem(LEGACY_TASKS_KEY);
    } catch {
      /* ignore */
    }
  }
  return tasks;
}

export async function createTask(boardId, input) {
  const tasks = await listTasks(boardId);
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
  write(tasksKey(boardId), [...tasks, task]);
  return task;
}

export async function updateTask(boardId, id, patch) {
  const tasks = await listTasks(boardId);
  let updated = null;
  const next = tasks.map((t) => {
    if (t.id !== id) return t;
    updated = { ...t, ...patch, id: t.id, createdDate: t.createdDate };
    return updated;
  });
  if (!updated) throw new Error(`Task ${id} not found`);
  write(tasksKey(boardId), next);
  return updated;
}

export async function deleteTask(boardId, id) {
  const tasks = await listTasks(boardId);
  write(tasksKey(boardId), tasks.filter((t) => t.id !== id));
}
