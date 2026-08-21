import type { ReportPreference, SpendingMonth, SpendingRecordGroup } from './types';

export const MOCK_REPORT_PREFERENCE = {
  title: '골목 야간반장',
  description: `정해진 동네, 익숙한 가게를 밤에
즐겨 찾는 편이에요. 새로운 곳보다 아는
곳에서 확실한 만족을 얻는 타입이에요.`,
  tags: ['야행성', '단골', '규칙적'],
  metrics: [
    { key: 'shop', value: 76 },
    { key: 'area', value: 76 },
    { key: 'time', value: 86 },
    { key: 'routine', value: 79 },
  ],
} as const satisfies ReportPreference;

export const MOCK_SPENDING_MONTHS = [
  { year: 2026, month: 7 },
  { year: 2026, month: 6 },
  { year: 2026, month: 5 },
  { year: 2026, month: 4 },
  { year: 2026, month: 3 },
  { year: 2026, month: 2 },
  { year: 2026, month: 1 },
  { year: 2025, month: 12 },
  { year: 2025, month: 11 },
  { year: 2025, month: 10 },
] as const satisfies readonly SpendingMonth[];

export const MOCK_SPENDING_RECORD_GROUPS = [
  {
    dateLabel: '22일 목요일',
    records: [
      {
        id: 'record-01',
        shopName: '투썸플레이스',
        amount: 5500,
        paidAtLabel: '2026.07.22 · 오전',
        category: '카페',
      },
      {
        id: 'record-02',
        shopName: '투썸플레이스',
        amount: 5500,
        paidAtLabel: '2026.07.22 · 오전',
        category: '카페',
      },
      {
        id: 'record-03',
        shopName: '투썸플레이스',
        amount: 5500,
        paidAtLabel: '2026.07.22 · 오전',
        category: '카페',
      },
    ],
  },
  {
    dateLabel: '21일 수요일',
    records: [
      {
        id: 'record-04',
        shopName: '투썸플레이스',
        amount: 5500,
        paidAtLabel: '2026.07.21 · 오전',
        category: '카페',
      },
    ],
  },
  {
    dateLabel: '20일 화요일',
    records: [
      {
        id: 'record-05',
        shopName: '투썸플레이스',
        amount: 5500,
        paidAtLabel: '2026.07.20 · 오전',
        category: '카페',
      },
      {
        id: 'record-06',
        shopName: '투썸플레이스',
        amount: 5500,
        paidAtLabel: '2026.07.20 · 오전',
        category: '카페',
      },
      {
        id: 'record-07',
        shopName: '투썸플레이스',
        amount: 5500,
        paidAtLabel: '2026.07.20 · 오전',
        category: '카페',
      },
    ],
  },
] as const satisfies readonly SpendingRecordGroup[];
