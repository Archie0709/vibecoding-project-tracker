import { useCallback, useEffect, useState } from 'react';
import * as api from '../api';

/** Loads a board's deliverable anchors through the data layer (M11, per board from 12d). */
export function useAnchors(boardId) {
  const [anchors, setAnchors] = useState([]);

  useEffect(() => {
    let cancelled = false;
    api
      .listAnchors(boardId)
      .then((data) => !cancelled && setAnchors(data))
      .catch(() => !cancelled && setAnchors([]));
    return () => {
      cancelled = true;
    };
  }, [boardId]);

  const saveAnchor = useCallback(
    async (id, patch) => {
      const anchor = await api.updateAnchor(boardId, id, patch);
      setAnchors((prev) => prev.map((a) => (a.id === id ? anchor : a)));
      return anchor;
    },
    [boardId],
  );

  return { anchors, saveAnchor };
}
