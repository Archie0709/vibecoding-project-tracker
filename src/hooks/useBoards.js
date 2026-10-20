import { useCallback, useEffect, useState } from 'react';
import * as api from '../api';

const CURRENT_KEY = 'vibetracker.currentBoard';

function rememberedBoardId() {
  try {
    return window.localStorage.getItem(CURRENT_KEY);
  } catch {
    return null;
  }
}

function rememberBoardId(id) {
  try {
    if (id == null) window.localStorage.removeItem(CURRENT_KEY);
    else window.localStorage.setItem(CURRENT_KEY, String(id));
  } catch {
    /* ignore */
  }
}

/**
 * 12d: the user's boards and which one is open (FR-24).
 * The open board is remembered in this browser, so a refresh returns to it.
 */
export function useBoards() {
  const [boards, setBoards] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .listBoards()
      .then((data) => {
        if (cancelled) return;
        setBoards(data);
        const saved = rememberedBoardId();
        const match = data.find((b) => String(b.id) === saved);
        setCurrentId(match ? match.id : data[0]?.id ?? null);
      })
      .catch((e) => !cancelled && setError(e))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const selectBoard = useCallback((id) => {
    setCurrentId(id);
    rememberBoardId(id);
  }, []);

  const createBoard = useCallback(
    async (name) => {
      const board = await api.createBoard(name);
      setBoards((prev) => [...prev, board]);
      selectBoard(board.id);
      return board;
    },
    [selectBoard],
  );

  const renameBoard = useCallback(async (id, name) => {
    const board = await api.renameBoard(id, name);
    setBoards((prev) => prev.map((b) => (b.id === id ? board : b)));
    return board;
  }, []);

  const deleteBoard = useCallback(
    async (id) => {
      await api.deleteBoard(id);
      const remaining = boards.filter((b) => b.id !== id);
      setBoards(remaining);
      if (id === currentId) selectBoard(remaining[0]?.id ?? null);
    },
    [boards, currentId, selectBoard],
  );

  const currentBoard = boards.find((b) => b.id === currentId) ?? null;

  return { boards, currentBoard, loading, error, selectBoard, createBoard, renameBoard, deleteBoard };
}
