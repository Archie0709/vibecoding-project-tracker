import { useCallback, useEffect, useRef, useState } from 'react';
import * as api from '../api';

/**
 * Loads a board's tasks through the data layer and keeps React state in sync.
 * Components use this hook rather than calling api.js directly.
 * 12f: tasks live on the server; edits send the full, merged task.
 */
export function useTasks(boardId) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  const reload = useCallback(async () => {
    const data = await api.listTasks(boardId);
    setTasks(data);
    return data;
  }, [boardId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .listTasks(boardId)
      .then((data) => !cancelled && setTasks(data))
      .catch((e) => !cancelled && setError(e))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [boardId]);

  const addTask = useCallback(async (input) => {
    const task = await api.createTask(boardId, input);
    setTasks((prev) => [...prev, task]);
    return task;
  }, [boardId]);

  const editTask = useCallback(async (id, patch) => {
    const current = tasksRef.current.find((t) => t.id === id);
    if (!current) throw new Error('That task no longer exists. Refresh the page.');
    const task = await api.updateTask(boardId, id, { ...current, ...patch });
    setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
    return task;
  }, [boardId]);

  const removeTask = useCallback(async (id) => {
    await api.deleteTask(boardId, id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, [boardId]);

  return { tasks, loading, error, addTask, editTask, removeTask, reload };
}
