import { useCallback, useEffect, useState } from 'react';
import * as api from '../api';

/**
 * Loads a board's tasks through the data layer and keeps React state in sync.
 * Components use this hook rather than calling api.js directly.
 */
export function useTasks(boardId) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
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
    const task = await api.updateTask(boardId, id, patch);
    setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
    return task;
  }, [boardId]);

  const removeTask = useCallback(async (id) => {
    await api.deleteTask(boardId, id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, [boardId]);

  return { tasks, loading, error, addTask, editTask, removeTask };
}
