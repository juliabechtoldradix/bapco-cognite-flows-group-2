import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { ChecklistResultRow } from '../contracts';

export type QuickViewUiStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';

export type QuickViewUiStorage = {
  status: QuickViewUiStatus;
  results: ChecklistResultRow[];
  errorMessage: string | null;
  checklistName: string | null;
  setLoading: () => void;
  setSuccess: (results: ChecklistResultRow[], checklistName: string | null) => void;
  setError: (message: string) => void;
  setIdle: () => void;
};

const QuickViewUiStateContext = createContext<QuickViewUiStorage | null>(null);

export function QuickViewUiStateProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<QuickViewUiStatus>('idle');
  const [results, setResults] = useState<ChecklistResultRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [checklistName, setChecklistName] = useState<string | null>(null);

  const setLoading = useCallback(() => {
    setStatus('loading');
    setErrorMessage(null);
  }, []);

  const setSuccess = useCallback((nextResults: ChecklistResultRow[], nextName: string | null) => {
    setResults(nextResults);
    setChecklistName(nextName);
    setErrorMessage(null);
    setStatus(nextResults.length === 0 ? 'empty' : 'success');
  }, []);

  const setError = useCallback((message: string) => {
    setResults([]);
    setErrorMessage(message);
    setStatus('error');
  }, []);

  const setIdle = useCallback(() => {
    setResults([]);
    setChecklistName(null);
    setErrorMessage(null);
    setStatus('idle');
  }, []);

  const value = useMemo<QuickViewUiStorage>(
    () => ({
      status,
      results,
      errorMessage,
      checklistName,
      setLoading,
      setSuccess,
      setError,
      setIdle,
    }),
    [checklistName, errorMessage, results, setError, setIdle, setLoading, setSuccess, status]
  );

  return (
    <QuickViewUiStateContext.Provider value={value}>{children}</QuickViewUiStateContext.Provider>
  );
}

export function useQuickViewUiStorage(): QuickViewUiStorage {
  const value = useContext(QuickViewUiStateContext);
  if (!value) {
    throw new Error('useQuickViewUiStorage must be used within QuickViewUiStateProvider');
  }
  return value;
}
