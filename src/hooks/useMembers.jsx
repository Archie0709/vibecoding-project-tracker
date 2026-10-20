import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as api from '../api';

/**
 * 12e: the members of the open board, shared with every card and the task modal
 * through context (so they don't need passing through Board → Column → TaskCard).
 */
const MembersContext = createContext({ members: [], loading: false });

export function useBoardMembers(boardId) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .listMembers(boardId)
      .then((data) => !cancelled && setMembers(data))
      .catch(() => !cancelled && setMembers([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [boardId]);

  const addMember = useCallback(async (userId) => {
    const next = await api.addMember(boardId, userId);
    setMembers(next);
    return next;
  }, [boardId]);

  const removeMember = useCallback(async (userId) => {
    const next = await api.removeMember(boardId, userId);
    setMembers(next);
    return next;
  }, [boardId]);

  return useMemo(() => ({ members, loading, addMember, removeMember }), [members, loading, addMember, removeMember]);
}

export function MembersProvider({ value, children }) {
  return <MembersContext.Provider value={value}>{children}</MembersContext.Provider>;
}

export function useMembers() {
  return useContext(MembersContext);
}
