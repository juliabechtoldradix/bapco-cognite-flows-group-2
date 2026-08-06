import type { ChecklistResultOutcome } from '../contracts';

export function formatOutcomeLabel(outcome: ChecklistResultOutcome): string {
  switch (outcome) {
    case 'NotOK':
      return 'Not OK';
    case 'OK':
      return 'OK';
    case 'Yes':
      return 'Yes';
    case 'No':
      return 'No';
    case 'Blocked':
      return 'Blocked';
    case 'Unset':
      return 'Unset';
  }
}

export function outcomeBadgeVariant(
  outcome: ChecklistResultOutcome
): 'success' | 'error' | 'warning' | 'secondary' | 'gray' {
  switch (outcome) {
    case 'OK':
    case 'Yes':
      return 'success';
    case 'NotOK':
    case 'No':
      return 'error';
    case 'Blocked':
      return 'warning';
    case 'Unset':
      return 'secondary';
  }
}
