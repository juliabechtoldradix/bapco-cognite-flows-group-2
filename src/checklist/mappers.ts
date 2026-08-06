import type {
  ChecklistResultOutcome,
  ChecklistResultRow,
  ChecklistStatus,
  ChecklistSummary,
  RouteKey,
} from './contracts';

export type ApmChecklistProps = {
  title?: string | null;
  status?: string | null;
  endTime?: string | number | null;
  labels?: string[] | null;
  description?: string | null;
};

export type ApmChecklistItemProps = {
  title?: string | null;
  status?: string | null;
  order?: number | null;
  labels?: string[] | null;
  description?: string | null;
  note?: string | null;
};

export type ApmMeasurementProps = {
  title?: string | null;
  type?: string | null;
  order?: number | null;
  numericReading?: number | null;
  stringReading?: string | null;
  min?: number | null;
  max?: number | null;
};

const ROUTE_TITLE_TO_KEY: ReadonlyArray<{ match: string; routeKey: RouteKey }> = [
  { match: 'route one', routeKey: 'route1' },
  { match: 'route two', routeKey: 'route2' },
  { match: 'route three', routeKey: 'route3' },
  { match: 'route four', routeKey: 'route4' },
];

export function mapInFieldStatusToUi(
  status: string | null | undefined,
  endTime: string | number | null | undefined,
  nowMs: number = Date.now()
): ChecklistStatus {
  const normalized = (status ?? '').trim().toLowerCase();

  if (normalized === 'done' || normalized === 'completed') {
    return 'Done';
  }

  const dueMs = parseTimestampMs(endTime);
  const isPastDue = dueMs !== null && dueMs < nowMs;
  if (isPastDue) {
    return 'Overdue';
  }

  if (
    normalized === 'ongoing' ||
    normalized === 'in progress' ||
    normalized === 'inprogress' ||
    normalized === 'started'
  ) {
    return 'Ongoing';
  }

  // Ready / To Do / ToDo / unknown → ToDo
  return 'ToDo';
}

export function mapItemStatusToOutcome(
  status: string | null | undefined
): ChecklistResultOutcome {
  const normalized = (status ?? '').trim().toLowerCase();
  if (normalized === 'ok') return 'OK';
  if (normalized === 'not ok' || normalized === 'notok' || normalized === 'not_ok') {
    return 'NotOK';
  }
  if (normalized === 'yes') return 'Yes';
  if (normalized === 'no') return 'No';
  if (normalized === 'blocked') return 'Blocked';
  return 'Unset';
}

export function isNotOkOutcome(outcome: ChecklistResultOutcome): boolean {
  return outcome === 'NotOK' || outcome === 'No' || outcome === 'Blocked';
}

export function isNotOkItemStatus(status: string | null | undefined): boolean {
  return isNotOkOutcome(mapItemStatusToOutcome(status));
}

export function resolveRouteKey(title: string | null | undefined): RouteKey | undefined {
  if (!title) return undefined;
  const lower = title.toLowerCase();
  for (const entry of ROUTE_TITLE_TO_KEY) {
    if (lower.includes(entry.match)) {
      return entry.routeKey;
    }
  }
  return undefined;
}

export function mapChecklistToSummary(
  id: string,
  props: ApmChecklistProps,
  hasNotOk: boolean,
  nowMs: number = Date.now()
): ChecklistSummary {
  return {
    id,
    name: props.title?.trim() || id,
    status: mapInFieldStatusToUi(props.status, props.endTime, nowMs),
    hasNotOk,
    routeKey: resolveRouteKey(props.title),
  };
}

export function mapChecklistItemToResultRow(
  id: string,
  props: ApmChecklistItemProps,
  measurement?: ApmMeasurementProps | null
): ChecklistResultRow {
  const labels = props.labels ?? [];
  const sectionRaw = labelValue(labels, 'zone:');
  const equipmentRaw = labelValue(labels, 'equipment:');
  const section = sectionRaw ? normalizeSectionLabel(sectionRaw) : undefined;
  const equipment = equipmentRaw ? normalizeDisplayText(equipmentRaw) : undefined;
  const outcome = mapItemStatusToOutcome(props.status);

  const row: ChecklistResultRow = {
    id,
    label: normalizeDisplayText(props.title?.trim() || id),
    outcome,
  };

  if (section) row.section = section;
  if (equipment) row.equipment = equipment;

  if (measurement?.numericReading !== null && measurement?.numericReading !== undefined) {
    const unit =
      labelValue(labels, 'unit:') ??
      (typeof measurement.type === 'string' && measurement.type.trim()
        ? measurement.type
        : undefined);
    row.reading = {
      value: measurement.numericReading,
      unit: unit ?? '',
      threshold:
        measurement.min !== null && measurement.min !== undefined
          ? `>${measurement.min}`
          : measurement.max !== null && measurement.max !== undefined
            ? `<${measurement.max}`
            : undefined,
    };
  }

  return row;
}

export function labelValue(labels: readonly string[], prefix: string): string | null {
  const found = labels.find((label) => label.toLowerCase().startsWith(prefix.toLowerCase()));
  if (!found) return null;
  return found.slice(prefix.length).trim() || null;
}

/**
 * Repairs common UTF-8→Windows-1252 mojibake (e.g. "â" → em dash).
 */
export function normalizeDisplayText(value: string): string {
  return value
    // UTF-8 em/en dash misread as Windows-1252 (control bytes or euro glyph)
    .replace(/\u00e2\u0080\u0094/g, '—')
    .replace(/\u00e2\u0080\u0093/g, '–')
    .replace(/\u00e2\u20ac\u0094/g, '—')
    .replace(/\u00e2\u20ac\u0093/g, '–')
    .replace(/â/g, '—')
    .replace(/â/g, '–')
    .replace(/â/g, '\u2019')
    .replace(/â/g, '\u201C')
    .replace(/â/g, '\u201D')
    .trim();
}

/**
 * Excel "Exceptions:" note rows were sometimes concatenated into zone labels
 * (e.g. "Exceptions — 2nd Floor Bleach Plant"). Keep the floor/zone name.
 */
export function normalizeSectionLabel(value: string): string {
  const repaired = normalizeDisplayText(value);
  const withoutExceptions = repaired
    .replace(/^Exceptions\s*[:：]?\s*[—–\-:]\s*/i, '')
    .replace(/^Exceptions\s*[:：]\s*/i, '')
    .trim();
  if (withoutExceptions) {
    return withoutExceptions;
  }
  return repaired.replace(/[:：]\s*$/, '').trim() || repaired;
}

function parseTimestampMs(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    // CDF timestamps may be ms since epoch
    return value < 1e12 ? value * 1000 : value;
  }
  const parsed = Date.parse(String(value));
  return Number.isNaN(parsed) ? null : parsed;
}
