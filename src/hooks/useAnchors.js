import { useCallback, useEffect, useState } from 'react';
import * as api from '../api';

/** Loads the deliverable anchors through the data layer (M11). */
export function useAnchors() {
  const [anchors, setAnchors] = useState([]);

  useEffect(() => {
    let cancelled = false;
    api.listAnchors().then((data) => !cancelled && setAnchors(data));
    return () => {
      cancelled = true;
    };
  }, []);

  const saveAnchor = useCallback(async (id, patch) => {
    const anchor = await api.updateAnchor(id, patch);
    setAnchors((prev) => prev.map((a) => (a.id === id ? anchor : a)));
    return anchor;
  }, []);

  return { anchors, saveAnchor };
}
