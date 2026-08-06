import { useContext, useEffect, useRef } from 'react';

import type {
  TaskResultDashboardData,
  TaskResultPeriodPreset,
} from '../contracts';

import type { DashboardLoadState } from './DashboardUiState';
import { getErrorMessage } from './getErrorMessage';
import { isDashboardEmpty } from './isDashboardEmpty';
import { TaskResultDashboardViewModelContext } from './taskResultDashboardViewModelContext';

export type TaskResultDashboardViewModelInput = {
  periodPreset: TaskResultPeriodPreset;
  onPeriodChange: (period: TaskResultPeriodPreset) => void;
};

export type TaskResultDashboardViewModel = {
  periodPreset: TaskResultPeriodPreset;
  onPeriodChange: (period: TaskResultPeriodPreset) => void;
  data: TaskResultDashboardData | null;
  loadState: DashboardLoadState;
  error: string | null;
  isEmpty: boolean;
};

export function useTaskResultDashboardViewModel(
  input: TaskResultDashboardViewModelInput
): TaskResultDashboardViewModel {
  const { checklistService, useDashboardUiState } = useContext(
    TaskResultDashboardViewModelContext
  );
  const { data, loadState, error, setLoading, setSuccess, setError } = useDashboardUiState();

  const requestIdRef = useRef(0);

  useEffect(() => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setLoading();

    void checklistService
      .getTaskResultDashboard(input.periodPreset)
      .then((next) => {
        if (requestIdRef.current === requestId) {
          setSuccess(next);
        }
      })
      .catch((err: unknown) => {
        if (requestIdRef.current === requestId) {
          setError(getErrorMessage(err, 'Failed to load task result dashboard'));
        }
      });
  }, [checklistService, input.periodPreset, setLoading, setSuccess, setError]);

  return {
    periodPreset: input.periodPreset,
    onPeriodChange: input.onPeriodChange,
    data,
    loadState,
    error,
    isEmpty: loadState === 'success' && data !== null && isDashboardEmpty(data),
  };
}
