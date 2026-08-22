import {
  StickerDartImage,
  StickerPizzaImage,
  StickerSpecialImage,
} from '@/shared/assets/images/stickers';

import type {
  FrequentShop,
  ReportPageMockData,
  ReportPreference,
  SpendingMonth,
  SpendingRecordGroup,
} from './types';

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

export const MOCK_FREQUENT_SHOPS = [
  {
    id: 'frequent-shop-01',
    name: '투썸플레이스',
    district: '용산구',
    category: '카페',
    thumbnailSrc: null,
    monthlyVisitCount: 12,
    totalVisitCount: 28,
  },
  {
    id: 'frequent-shop-02',
    name: '투썸플레이스',
    district: '용산구',
    category: '카페',
    thumbnailSrc: null,
    monthlyVisitCount: 8,
    totalVisitCount: 20,
  },
  {
    id: 'frequent-shop-03',
    name: '투썸플레이스',
    district: '용산구',
    category: '카페',
    thumbnailSrc: null,
    monthlyVisitCount: 7,
    totalVisitCount: 18,
  },
  {
    id: 'frequent-shop-04',
    name: '투썸플레이스',
    district: '용산구',
    category: '카페',
    thumbnailSrc: null,
    monthlyVisitCount: 7,
    totalVisitCount: 16,
  },
  {
    id: 'frequent-shop-05',
    name: '투썸플레이스',
    district: '용산구',
    category: '카페',
    thumbnailSrc: null,
    monthlyVisitCount: 7,
    totalVisitCount: 14,
  },
  {
    id: 'frequent-shop-06',
    name: '투썸플레이스',
    district: '용산구',
    category: '카페',
    thumbnailSrc: null,
    monthlyVisitCount: 7,
    totalVisitCount: 12,
  },
  {
    id: 'frequent-shop-07',
    name: '투썸플레이스 장기 임시 휴업 안내',
    district: '용산구',
    category: '카페',
    thumbnailSrc: null,
    monthlyVisitCount: 7,
    totalVisitCount: 10,
  },
  {
    id: 'frequent-shop-08',
    name: '투썸플레이스 장기 임시 휴업 안내',
    district: '용산구',
    category: '카페',
    thumbnailSrc: null,
    monthlyVisitCount: 7,
    totalVisitCount: 9,
  },
] as const satisfies readonly FrequentShop[];
