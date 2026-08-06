import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';

import type { ChecklistService } from '../contracts';
import { FixtureChecklistService } from '../data/ChecklistService';
import { ChecklistServiceProvider } from '../shell/ChecklistServiceContext';
import { ChecklistQuickView } from './ChecklistQuickView';
import { QuickViewUiStateProvider } from './QuickViewUiState';

describe(ChecklistQuickView.name, () => {
  it('shows idle empty state when nothing is selected', () => {
    render(
      <Providers>
        <ChecklistQuickView checklistId={null} />
      </Providers>
    );
    expect(screen.getByText('No checklist selected')).toBeInTheDocument();
  });

  it('renders grouped OEC fixture results for a selected checklist', async () => {
    render(
      <Providers>
        <ChecklistQuickView checklistId="fixture-route1" />
      </Providers>
    );

    await waitFor(() => expect(screen.getByText('7th Floor')).toBeInTheDocument());
    expect(screen.getByText('Diffuser Scraper')).toBeInTheDocument();
    expect(screen.getByText('General Condition')).toBeInTheDocument();
    expect(screen.getByText('Not OK')).toBeInTheDocument();
    expect(screen.getAllByText(/155°F/).length).toBeGreaterThan(0);
  });

  it('shows an error alert when loading fails', async () => {
    const service: ChecklistService = {
      getKpis: vi.fn(async () => ({
        toDo: 0,
        ongoing: 0,
        done: 0,
        overdue: 0,
        withNotOk: 0,
      })),
      searchChecklists: vi.fn(async () => []),
      getResults: vi.fn(async () => {
        throw new Error('boom');
      }),
    };

    render(
      <Providers service={service}>
        <ChecklistQuickView checklistId="fixture-route1" />
      </Providers>
    );

    await waitFor(() => expect(screen.getByText('boom')).toBeInTheDocument());
  });
});

function Providers({
  children,
  service = new FixtureChecklistService(),
}: {
  children: ReactNode;
  service?: ChecklistService;
}) {
  return (
    <ChecklistServiceProvider checklistService={service}>
      <QuickViewUiStateProvider>{children}</QuickViewUiStateProvider>
    </ChecklistServiceProvider>
  );
}
