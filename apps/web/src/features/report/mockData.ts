import type { ReportPreference } from './types';

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
