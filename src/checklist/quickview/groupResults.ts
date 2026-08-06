import type { ChecklistResultRow } from '../contracts';

export type ResultEquipmentGroup = {
  equipment: string;
  assetExternalId?: string;
  rows: ChecklistResultRow[];
};

export type ResultSectionGroup = {
  section: string;
  equipmentGroups: ResultEquipmentGroup[];
};

/**
 * Groups flat result rows by section, then equipment (OEC route shape).
 */
export function groupResultsBySectionAndEquipment(
  rows: ChecklistResultRow[]
): ResultSectionGroup[] {
  const sectionOrder: string[] = [];
  const sections = new Map<string, Map<string, ResultEquipmentGroup>>();

  for (const row of rows) {
    const section = row.section?.trim() || 'General';
    const equipment = row.equipment?.trim() || 'Tasks';

    if (!sections.has(section)) {
      sectionOrder.push(section);
      sections.set(section, new Map());
    }

    const equipmentMap = sections.get(section);
    if (!equipmentMap) {
      continue;
    }

    const existing = equipmentMap.get(equipment);
    if (existing) {
      existing.rows.push(row);
      if (!existing.assetExternalId && row.assetExternalId) {
        existing.assetExternalId = row.assetExternalId;
      }
      continue;
    }

    equipmentMap.set(equipment, {
      equipment,
      assetExternalId: row.assetExternalId,
      rows: [row],
    });
  }

  return sectionOrder.map((section) => {
    const equipmentMap = sections.get(section);
    return {
      section,
      equipmentGroups: equipmentMap ? Array.from(equipmentMap.values()) : [],
    };
  });
}
