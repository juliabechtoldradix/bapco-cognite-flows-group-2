import { Search } from '@cognite/aura/components/search';
import { useEffect, useState } from 'react';

export type ChecklistSearchProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  debounceMs: number;
  setTimeoutFn: (handler: () => void, timeout: number) => ReturnType<typeof setTimeout>;
  clearTimeoutFn: (id: ReturnType<typeof setTimeout>) => void;
};

export function ChecklistSearch({
  searchQuery,
  onSearchChange,
  debounceMs,
  setTimeoutFn,
  clearTimeoutFn,
}: ChecklistSearchProps) {
  const [draft, setDraft] = useState(searchQuery);
  const [prevSearchQuery, setPrevSearchQuery] = useState(searchQuery);

  // Sync draft when the host-synced query changes (reload / shared link / clear from parent).
  if (searchQuery !== prevSearchQuery) {
    setPrevSearchQuery(searchQuery);
    setDraft(searchQuery);
  }

  useEffect(() => {
    if (draft === searchQuery) {
      return;
    }

    const timer = setTimeoutFn(() => {
      onSearchChange(draft);
    }, debounceMs);

    return () => {
      clearTimeoutFn(timer);
    };
  }, [draft, searchQuery, debounceMs, onSearchChange, setTimeoutFn, clearTimeoutFn]);

  return (
    <Search
      value={draft}
      onChange={(event) => {
        setDraft(event.currentTarget.value);
      }}
      onClear={() => {
        setDraft('');
        onSearchChange('');
      }}
      placeholder="Search checklists"
      aria-label="Search checklists"
      data-testid="checklist-search"
    />
  );
}
