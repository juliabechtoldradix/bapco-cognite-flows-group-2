import { useEffect } from 'react';

import { groupResultsBySectionAndEquipment, type ResultSectionGroup } from './groupResults';
import { useChecklistQuickViewViewModelDeps } from './ChecklistQuickViewViewModelContext';

export type ChecklistQuickViewViewModel = {
  status: 'idle' | 'loading' | 'success' | 'error' | 'empty';
  groups: ResultSectionGroup[];
  checklistName: string | null;
  errorMessage: string | null;
};

function isErrorWithMessage(value: unknown): value is { message: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof (value as { message: unknown }).message === 'string'
  );
}

export function useChecklistQuickViewViewModel(
  checklistId: string | null
): ChecklistQuickViewViewModel {
  const { useChecklistService, useQuickViewUiStorage } = useChecklistQuickViewViewModelDeps();
  const service = useChecklistService();
  const storage = useQuickViewUiStorage();

  const { setIdle, setLoading, setSuccess, setError, status, results, checklistName, errorMessage } =
    storage;

  useEffect(() => {
    let cancelled = false;

    if (!checklistId) {
      setIdle();
      return;
    }

    setLoading();

    void (async () => {
      try {
        const [nextResults, summaries] = await Promise.all([
          service.getResults(checklistId),
          service.searchChecklists(''),
        ]);
        if (cancelled) {
          return;
        }
        const match = summaries.find((item) => item.id === checklistId);
        setSuccess(nextResults, match?.name ?? null);
      } catch (error: unknown) {
        if (cancelled) {
          return;
        }
        const message = isErrorWithMessage(error)
          ? error.message
          : 'Failed to load checklist results';
        setError(message);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [checklistId, service, setIdle, setLoading, setSuccess, setError]);

  return {
    status,
    groups: groupResultsBySectionAndEquipment(results),
    checklistName,
    errorMessage,
  };
}
