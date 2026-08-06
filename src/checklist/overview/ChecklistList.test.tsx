import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { ChecklistSummary } from '../contracts';

import { ChecklistList } from './ChecklistList';

const sample: ChecklistSummary[] = [
  {
    id: 'fixture-route2',
    name: 'Route Two - Feed System',
    status: 'Ongoing',
    hasNotOk: false,
  },
  {
    id: 'fixture-route1',
    name: 'Route One - IV/Kamyr Digester/Diffuser',
    status: 'ToDo',
    hasNotOk: true,
  },
];

describe(ChecklistList.name, () => {
  it('renders loading state', () => {
    render(
      <ChecklistList
        checklists={[]}
        selectedId={null}
        onSelect={vi.fn()}
        state="loading"
        error={null}
        searchQuery=""
      />
    );
    expect(screen.getByTestId('checklist-list-loading')).toBeInTheDocument();
  });

  it('renders error state', () => {
    render(
      <ChecklistList
        checklists={[]}
        selectedId={null}
        onSelect={vi.fn()}
        state="error"
        error="Boom"
        searchQuery=""
      />
    );
    expect(screen.getByText('Boom')).toBeInTheDocument();
  });

  it('renders empty state for unmatched search', () => {
    render(
      <ChecklistList
        checklists={[]}
        selectedId={null}
        onSelect={vi.fn()}
        state="success"
        error={null}
        searchQuery="zzz"
      />
    );
    expect(screen.getByText('No checklists matched')).toBeInTheDocument();
  });

  it('renders checklist names and notifies on select', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <ChecklistList
        checklists={sample}
        selectedId="fixture-route2"
        onSelect={onSelect}
        state="success"
        error={null}
        searchQuery=""
      />
    );

    expect(screen.getByText('Route Two - Feed System')).toBeInTheDocument();
    expect(screen.getByText('Not OK')).toBeInTheDocument();
    expect(screen.getByTestId('checklist-item-fixture-route2').className).toContain(
      'bg-info-background'
    );

    await user.click(screen.getByTestId('checklist-item-fixture-route1'));
    expect(onSelect).toHaveBeenCalledWith('fixture-route1');
  });
});

