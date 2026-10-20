import { useCallback, useEffect, useState } from 'react';
import * as api from '../api';

/**
 * Loads tasks through the data layer and keeps React state in sync.
 * Components use this hook rather than calling api.js directly.
 */
export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .listTasks()
      .then((data) => !cancelled && setTasks(data))
      .catch((e) => !cancelled && setError(e))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const addTask = useCallback(async (input) => {
    const task = await api.createTask(input);
    setTasks((prev) => [...prev, task]);
    return task;
  }, []);

  const editTask = useCallback(async (id, patch) => {
    const task = await api.updateTask(id, patch);
    setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
    return task;
  }, []);

  const removeTask = useCallback(async (id) => {
    await api.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { tasks, loading, error, addTask, editTask, removeTask };
}
