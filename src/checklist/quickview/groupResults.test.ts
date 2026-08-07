import { describe, expect, it } from 'vitest';

import type { ChecklistResultRow } from '../contracts';

import { groupResultsBySectionAndEquipment } from './groupResults';

describe(groupResultsBySectionAndEquipment.name, () => {
  it('groups rows by section then equipment', () => {
    const rows: ChecklistResultRow[] = [
      {
        id: '1',
        label: 'General Condition',
        section: '7th Floor',
        equipment: 'Diffuser Scraper',
        assetExternalId: '301112080',
        outcome: 'NotOK',
      },
      {
        id: '2',
        label: 'Motor Temp',
        section: '7th Floor',
        equipment: 'Diffuser Scraper',
        outcome: 'Unset',
        reading: { value: 155, unit: '°F', threshold: '>170' },
      },
      {
        id: '3',
        label: 'Oil Level',
        section: '7th Floor',
        equipment: 'Diffuser Gearbox',
        outcome: 'OK',
      },
      {
        id: '4',
        label: 'Clean',
        section: 'Chip Bin Floor',
        equipment: 'Chip Bin',
        outcome: 'OK',
      },
    ];

    const groups = groupResultsBySectionAndEquipment(rows);

    expect(groups).toHaveLength(2);
    expect(groups[0]?.section).toBe('7th Floor');
    expect(groups[0]?.equipmentGroups).toHaveLength(2);
    expect(groups[0]?.equipmentGroups[0]?.equipment).toBe('Diffuser Scraper');
    expect(groups[0]?.equipmentGroups[0]?.rows).toHaveLength(2);
    expect(groups[0]?.equipmentGroups[0]?.assetExternalId).toBe('301112080');
    expect(groups[1]?.section).toBe('Chip Bin Floor');
  });

  it('uses fallback labels when section or equipment is missing', () => {
    const groups = groupResultsBySectionAndEquipment([
      { id: '1', label: 'Loose item', outcome: 'OK' },
    ]);
    expect(groups).toEqual([
      {
        section: 'General',
        equipmentGroups: [{ equipment: 'Tasks', assetExternalId: undefined, rows: expect.any(Array) }],
      },
    ]);
  });
});
