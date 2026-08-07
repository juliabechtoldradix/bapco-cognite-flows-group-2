import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

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
    const user = userEvent.setup();
    render(
      <Providers>
        <ChecklistQuickView checklistId="fixture-route1" />
      </Providers>
    );

    const trigger = await screen.findByTestId('quickview-section-trigger-7th Floor');
    await user.click(trigger);
    await waitFor(() => expect(screen.getByText('Diffuser Scraper')).toBeInTheDocument());
    expect(screen.getByText('General Condition')).toBeInTheDocument();
    expect(screen.getByText('Not OK')).toBeInTheDocument();
    expect(screen.getAllByText(/155°F/).length).toBeGreaterThan(0);
  });


  it('starts section headers collapsed and expands on click', async () => {
    const user = userEvent.setup();
    render(
      <Providers>
        <ChecklistQuickView checklistId="fixture-route1" />
      </Providers>
    );

    const trigger = await screen.findByTestId('quickview-section-trigger-7th Floor');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));
    expect(screen.getByText('Diffuser Scraper')).toBeInTheDocument();

    await user.click(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
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
      getTaskResultDashboard: vi.fn(async () => ({
        period: '7d' as const,
        breakdown: { ok: 0, notOk: 0, other: 0 },
        series: [],
      })),
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
