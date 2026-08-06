import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ChecklistPage } from './ChecklistPage';

describe(ChecklistPage.name, () => {
  it('wires host state into overview stub and loads quick view results', async () => {
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

    expect(screen.getByText('Search: Digester')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('General Condition')).toBeInTheDocument());
    expect(screen.getByText('Not OK')).toBeInTheDocument();
  });
});
