import {
  StickerDartImage,
  StickerPizzaImage,
  StickerSpecialImage,
} from '@/shared/assets/images/stickers';

import type { ReportPageMockData, ReportPreference } from './types';

export const MOCK_REPORT_PAGE = {
  monthLabel: '8월',
  monthlyAdditionalStickerCount: 3,
  monthlyRecordCount: 8,
  monthlyStickerImages: [
    StickerDartImage,
    StickerSpecialImage,
    StickerDartImage,
    StickerPizzaImage,
    StickerDartImage,
  ],
  recentDiscovery: ['“요즘 올빼미 모드 켜졌나요?', '밤 활동 비중이 훌쩍 늘었어요🌙“'],
  weeklyPeriodLabel: '8월 18일부터 24일까지',
  weeklyRecords: [
    { day: '일', date: 18, count: 3 },
    { day: '월', date: 19, count: 2 },
    { day: '화', date: 20 },
    { day: '수', date: 21 },
    { day: '목', date: 22, count: 2, isToday: true },
    { day: '금', date: 23, isFuture: true },
    { day: '토', date: 24, count: 5, isFuture: true },
  ],
} as const satisfies ReportPageMockData;

export const MOCK_EMPTY_REPORT_PAGE = {
  ...MOCK_REPORT_PAGE,
  monthlyAdditionalStickerCount: 0,
  monthlyRecordCount: 0,
  monthlyStickerImages: [],
  recentDiscovery: null,
} as const satisfies ReportPageMockData;

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
