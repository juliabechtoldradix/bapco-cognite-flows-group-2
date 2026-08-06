import type { ChecklistStatus, RouteKey } from '../contracts';

export type FixtureTaskKind = 'okNotOk' | 'yesNo' | 'measure';

export type FixtureTask = {
  label: string;
  kind: FixtureTaskKind;
  unit: string | null;
  threshold: string | null;
};

export type FixtureEquipment = {
  name: string;
  assetExternalId: string | null;
  tasks: FixtureTask[];
};

export type FixtureSection = {
  name: string;
  equipment: FixtureEquipment[];
};

export type OecRouteFixture = {
  routeKey: RouteKey;
  id: string;
  name: string;
  status: ChecklistStatus;
  hasNotOk: boolean;
  sections: FixtureSection[];
};

/**
 * Slim samples derived from references/A Line OEC Routes.xlsx
 * (Kamyr System Operator Equipment Care — 4 A Line routes).
 */
export const OEC_ROUTE_FIXTURES: readonly OecRouteFixture[] = [
  {
    routeKey: 'route1',
    id: 'fixture-route1',
    name: 'Route One - IV/Kamyr Digester/Diffuser',
    status: 'ToDo',
    hasNotOk: true,
    sections: [
      {
        name: '7th Floor',
        equipment: [
          {
            name: 'Diffuser Scraper',
            assetExternalId: '301112080',
            tasks: [
              { label: 'General Condition', kind: 'okNotOk', unit: null, threshold: null },
              { label: 'Motor Temp', kind: 'measure', unit: '°F', threshold: '>170' },
              { label: 'Motor', kind: 'okNotOk', unit: null, threshold: null },
              { label: 'IB Bearing Temp', kind: 'measure', unit: '°F', threshold: '>170' },
            ],
          },
          {
            name: 'Diffuser Gearbox',
            assetExternalId: '301112080',
            tasks: [
              { label: 'Oil Level', kind: 'okNotOk', unit: null, threshold: null },
              { label: 'Guarding', kind: 'okNotOk', unit: null, threshold: null },
              { label: 'Drive Belts', kind: 'okNotOk', unit: null, threshold: null },
            ],
          },
        ],
      },
      {
        name: '6th Floor',
        equipment: [
          {
            name: 'Digester Top Separator',
            assetExternalId: null,
            tasks: [
              { label: 'Oil Level', kind: 'okNotOk', unit: null, threshold: null },
              { label: 'Guarding', kind: 'okNotOk', unit: null, threshold: null },
              { label: 'Motor', kind: 'okNotOk', unit: null, threshold: null },
              { label: 'IB Bearing Temp', kind: 'measure', unit: '°F', threshold: '>170' },
            ],
          },
        ],
      },
    ],
  },
  {
    routeKey: 'route2',
    id: 'fixture-route2',
    name: 'Route Two - Feed System',
    status: 'Ongoing',
    hasNotOk: false,
    sections: [
      {
        name: 'CHIP BIN',
        equipment: [
          {
            name: 'Top of Chip Bin & Belts',
            assetExternalId: null,
            tasks: [
              {
                label: 'Unusual noises on belt/wipes etc?',
                kind: 'yesNo',
                unit: null,
                threshold: null,
              },
              { label: 'Hoses rolled up', kind: 'yesNo', unit: null, threshold: 'Cleaned?' },
              {
                label: 'Sawdust built up on top of chip bin',
                kind: 'yesNo',
                unit: null,
                threshold: 'Cleaned?',
              },
              {
                label: 'Sawdust built up to roller',
                kind: 'yesNo',
                unit: null,
                threshold: 'Cleaned?',
              },
            ],
          },
          {
            name: 'Chip Bin Gyrators',
            assetExternalId: '291104080',
            tasks: [
              { label: 'Loose Bolts', kind: 'yesNo', unit: null, threshold: null },
              { label: 'Missing Bolts', kind: 'yesNo', unit: null, threshold: null },
              { label: 'Gyrators Misaligned', kind: 'yesNo', unit: null, threshold: null },
              { label: 'Running', kind: 'yesNo', unit: null, threshold: null },
            ],
          },
        ],
      },
      {
        name: 'LOW PRESSURE FEEDER',
        equipment: [
          {
            name: 'Low Pressure Feeder',
            assetExternalId: '291106080',
            tasks: [
              { label: 'General Condition', kind: 'okNotOk', unit: null, threshold: null },
              { label: 'Motor Temp', kind: 'measure', unit: '°F', threshold: '>170F' },
              { label: 'Motor', kind: 'okNotOk', unit: null, threshold: null },
              { label: 'IB Bearing Temp', kind: 'measure', unit: '°F', threshold: '>170F' },
            ],
          },
          {
            name: 'Low Pressure Feeder Gearbox',
            assetExternalId: '291106080',
            tasks: [
              { label: 'Oil Level', kind: 'okNotOk', unit: null, threshold: null },
              { label: 'Guarding', kind: 'okNotOk', unit: null, threshold: null },
              { label: 'Drive Belts', kind: 'okNotOk', unit: null, threshold: null },
            ],
          },
        ],
      },
    ],
  },
  {
    routeKey: 'route3',
    id: 'fixture-route3',
    name: 'Route Three - Blow Heat/Stripper/Turpentine',
    status: 'Done',
    hasNotOk: true,
    sections: [
      {
        name: 'Chip Bin Floor',
        equipment: [
          {
            name: 'Chip Bin',
            assetExternalId: null,
            tasks: [
              { label: 'General Condition', kind: 'okNotOk', unit: null, threshold: null },
              { label: 'Clean', kind: 'okNotOk', unit: null, threshold: null },
              { label: 'Associated Piping', kind: 'okNotOk', unit: null, threshold: null },
            ],
          },
          {
            name: '1B Flash Tank',
            assetExternalId: null,
            tasks: [
              { label: 'General Condition', kind: 'okNotOk', unit: null, threshold: null },
              { label: 'Associated Piping', kind: 'okNotOk', unit: null, threshold: null },
            ],
          },
        ],
      },
      {
        name: 'Top 2 Floors (#2 Stripper Area)',
        equipment: [
          {
            name: 'Primary Condenser',
            assetExternalId: null,
            tasks: [
              { label: 'General Condition', kind: 'okNotOk', unit: null, threshold: null },
              { label: 'Associated Piping', kind: 'okNotOk', unit: null, threshold: null },
            ],
          },
          {
            name: 'Secondary Condenser',
            assetExternalId: null,
            tasks: [
              { label: 'General Condition', kind: 'okNotOk', unit: null, threshold: null },
              { label: 'Associated Piping', kind: 'okNotOk', unit: null, threshold: null },
            ],
          },
        ],
      },
    ],
  },
  {
    routeKey: 'route4',
    id: 'fixture-route4',
    name: 'Route Four - A Line Screen and Washing',
    status: 'Overdue',
    hasNotOk: false,
    sections: [
      {
        name: '2nd Floor Bleach Plant',
        equipment: [
          {
            name: 'A1 Screen',
            assetExternalId: null,
            tasks: [
              { label: 'General Condition', kind: 'okNotOk', unit: null, threshold: null },
              { label: 'Plugged', kind: 'yesNo', unit: null, threshold: null },
            ],
          },
          {
            name: 'A2 Screen',
            assetExternalId: null,
            tasks: [
              { label: 'General Condition', kind: 'okNotOk', unit: null, threshold: null },
              { label: 'Plugged', kind: 'yesNo', unit: null, threshold: null },
            ],
          },
        ],
      },
    ],
  },
] as const;
