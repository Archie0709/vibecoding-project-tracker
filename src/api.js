/**
 * Data layer — the ONLY place the app reads or writes data.
 *
 * M4–M11: tasks and anchors were backed by localStorage.
 * 12c:    accounts (register / log in / log out) use the Spring Boot REST API.
 * 12d:    boards and deliverable anchors use the REST API.
 * 12e:    board members and the user list use the REST API; tasks store the
 *         assignee as a user id (assigneeId).
 * 12f:    tasks use the REST API, so they are shared by everyone on a board.
 *         Components never changed: they only ever called these async functions.
 */


function read(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw != null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
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

// ---- Users & board members (12e) ------------------------------------------

/** Everyone with an account on this (self-hosted) instance. */
export function listUsers() {
  return request('/users');
}

export function listMembers(boardId) {
  return request(`/boards/${boardId}/members`);
}

export function addMember(boardId, userId) {
  return request(`/boards/${boardId}/members`, { method: 'POST', body: { userId } });
}

export function removeMember(boardId, userId) {
  return request(`/boards/${boardId}/members/${userId}`, { method: 'DELETE' });
}

// ---- Deliverable anchors (M11, per board from 12d) ------------------------

export function listAnchors(boardId) {
  return request(`/boards/${boardId}/anchors`);
}

export function updateAnchor(boardId, slot, { url }) {
  return request(`/boards/${boardId}/anchors/${slot}`, { method: 'PUT', body: { url } });
}

// ---- Tasks (REST API from 12f) ---------------------------------------------

/** The fields the API accepts for a task (contextUpdatedAt is set by the server). */
function toTaskRequest(task) {
  return {
    title: task.title,
    description: task.description ?? '',
    type: task.type,
    status: task.status,
    assigneeId: task.assigneeId ?? null,
    dueDate: task.dueDate || null,
    context: task.context ?? '',
    contextTool: task.contextTool || null,
    createdDate: task.createdDate ?? null,
  };
}

export function listTasks(boardId) {
  return request(`/boards/${boardId}/tasks`);
}

export function createTask(boardId, task) {
  return request(`/boards/${boardId}/tasks`, { method: 'POST', body: toTaskRequest(task) });
}

/** Sends the whole task (the caller merges its changes into the current task first). */
export function updateTask(boardId, id, task) {
  return request(`/boards/${boardId}/tasks/${id}`, { method: 'PUT', body: toTaskRequest(task) });
}

export function deleteTask(boardId, id) {
  return request(`/boards/${boardId}/tasks/${id}`, { method: 'DELETE' });
}

export function importTasks(boardId, tasks) {
  return request(`/boards/${boardId}/tasks/import`, { method: 'POST', body: tasks.map(toTaskRequest) });
}

// ---- Tasks left in this browser from before 12f ----------------------------

const isLocalTaskKey = (key) => key === 'vibetracker.tasks' || key.startsWith('vibetracker.tasks.');

/** Every task still saved in this browser (from M4–M11 and 12d), so they can be imported once. */
export function findLocalTasks() {
  const found = [];
  try {
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (key && isLocalTaskKey(key)) {
        const tasks = read(key, []);
        if (Array.isArray(tasks)) found.push(...tasks);
      }
    }
  } catch {
    /* storage unavailable */
  }
  return found;
}

export function clearLocalTasks() {
  try {
    const keys = [];
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (key && isLocalTaskKey(key)) keys.push(key);
    }
    keys.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    /* ignore */
  }
}
