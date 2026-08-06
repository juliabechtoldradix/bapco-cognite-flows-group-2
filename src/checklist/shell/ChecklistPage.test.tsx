import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ChecklistPage } from './ChecklistPage';

describe(ChecklistPage.name, () => {
  it('wires host state into overview and loads quick view results', async () => {
    const syncInternalState = vi.fn(() => Promise.resolve(true));
    render(
      <ChecklistPage
        api={{ syncInternalState }}
        initialState={JSON.stringify({
          searchQuery: 'Digester',
          selectedChecklistId: 'fixture-route1',
        })}
      />
    );

    await waitFor(() => expect(screen.getByTestId('checklist-search')).toHaveValue('Digester'));
    await waitFor(() => expect(screen.getByText('General Condition')).toBeInTheDocument());
    expect(screen.getByTestId('checklist-quickview')).toHaveTextContent('Not OK');
  });
});
