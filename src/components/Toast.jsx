import { createContext, useCallback, useContext, useEffect, useState } from 'react';

/**
 * Short confirmation messages ("Task created.").
 * The live region is always in the DOM so screen readers announce new messages
 * without moving focus (WCAG 2.2 SC 4.1.3 Status Messages).
 */
const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message) => {
    setToast({ id: Date.now(), message });
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
      >
        {toast && (
          <div
            key={toast.id}
            className="pointer-events-auto rounded-md bg-surface-raised px-4 py-3 text-sm text-text-primary shadow-lg ring-1 ring-border-strong motion-safe:animate-fade-in"
          >
            {toast.message}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
