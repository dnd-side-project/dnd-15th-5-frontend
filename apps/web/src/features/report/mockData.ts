import type { FrequentShop, SpendingMonth, SpendingRecordGroup } from './types';

const MOCK_REPORT_PERSONAS = {
  nightWatch: {
    title: '골목 야간반장',
    variant: 'night-watch',
    tags: ['야행성', '단골형', '규칙적'],
    description:
      '정해진 동네, 익숙한 가게를 밤에 즐겨 찾는 편이에요. 새로운 곳보다 아는 곳에서 확실한 만족을 얻는 타입이에요.',
    metrics: [
      { leftLabel: '신규 탐색형', rightLabel: '단골 반복형', value: 76 },
      { leftLabel: '동네 확장형', rightLabel: '동네 집중형', value: 76 },
      { leftLabel: '낮소비형', rightLabel: '밤소비형', value: 86 },
      { leftLabel: '즉흥형', rightLabel: '규칙형', value: 79 },
    ],
  },
  foodNomad: {
    title: '미식 유목민',
    variant: 'food-nomad',
    tags: ['야행성', '유목형', '즉흥적'],
    description:
      '맛있는 곳이라면 어디든 찾아가요. 한곳에 머물기엔 궁금한 맛집이 너무 많아요. 오늘도 새로운 맛을 찾아 떠나는 타입이에요.',
    metrics: [
      { leftLabel: '신규 탐색형', rightLabel: '단골 반복형', value: 22 },
      { leftLabel: '동네 확장형', rightLabel: '동네 집중형', value: 34 },
      { leftLabel: '낮소비형', rightLabel: '밤소비형', value: 77 },
      { leftLabel: '즉흥형', rightLabel: '규칙형', value: 30 },
    ],
  },
  localRegular: {
    title: '동네 터줏대감',
    variant: 'local-regular',
    tags: ['낮 활동파', '단골형', '규칙적'],
    description:
      '익숙한 동네와 단골 가게를 자주 찾아요. 마음에 들면 꾸준히 찾는 편이에요. 사장님이 알아볼지도 모르는 찐 단골 타입이에요.',
    metrics: [
      { leftLabel: '신규 탐색형', rightLabel: '단골 반복형', value: 78 },
      { leftLabel: '동네 확장형', rightLabel: '동네 집중형', value: 67 },
      { leftLabel: '낮소비형', rightLabel: '밤소비형', value: 19 },
      { leftLabel: '즉흥형', rightLabel: '규칙형', value: 79 },
    ],
  },
  alleyExplorer: {
    title: '골목 발굴러',
    variant: 'alley-explorer',
    tags: ['낮 활동파', '단골형', '즉흥적'],
    description:
      '익숙한 동네에서도 새로운 가게를 찾아다녀요. 골목 속 숨은 맛집을 발견하는 재미를 즐겨요. 남들보다 먼저 찜해두는 타입이에요.',
    metrics: [
      { leftLabel: '신규 탐색형', rightLabel: '단골 반복형', value: 78 },
      { leftLabel: '동네 확장형', rightLabel: '동네 집중형', value: 77 },
      { leftLabel: '낮소비형', rightLabel: '밤소비형', value: 25 },
      { leftLabel: '즉흥형', rightLabel: '규칙형', value: 33 },
    ],
  },
} as const;

const MOCK_REPORT_DETAIL = {
  monthLabel: '7월',
  month: { year: 2026, month: 7 },
  persona: MOCK_REPORT_PERSONAS.localRegular,
  summary: [
    { label: '방문 횟수', value: 42 },
    { label: '동네 갯수', value: 6 },
    { label: '새 가게 수', value: 8 },
  ],
  shops: [
    { id: 'two-some-ttukseom', rank: 1, name: '투썸 플레이스 뚝섬지점', visits: 5, months: 4 },
    { id: 'aoi-cafe', rank: 2, name: '아오이 카페', visits: 3, months: 1 },
    { id: 'jangseung-malatang', rank: 3, name: '장승마라탕', visits: 2, months: 1 },
  ],
  districts: [
    { name: '연남동', visits: 5 },
    { name: '수서동', visits: 3 },
    { name: '계화효우동', visits: 2 },
  ],
  categories: [
    { category: '카페', percentage: 60 },
    { category: '음식점', percentage: 30 },
    { category: '운동', percentage: 10 },
  ],
  weekdaySpending: [
    { day: '월', amount: 26_000 },
    { day: '화', amount: 18_000 },
    { day: '수', amount: 56_000 },
    { day: '목', amount: 40_000 },
    { day: '금', amount: 96_000 },
    { day: '토', amount: 77_000 },
    { day: '일', amount: 52_000 },
  ],
  weekdayInsight: '당신의 소비는 금요일 저녁에 깨어나요 🌙',
} as const;

/** 최신 월부터 정렬된 월간 리포트 목록입니다. */
export const MOCK_MONTHLY_REPORTS = [
  MOCK_REPORT_DETAIL,
  {
    ...MOCK_REPORT_DETAIL,
    monthLabel: '6월',
    month: { year: 2026, month: 6 },
    persona: MOCK_REPORT_PERSONAS.nightWatch,
  },
  {
    ...MOCK_REPORT_DETAIL,
    monthLabel: '5월',
    month: { year: 2026, month: 5 },
    persona: MOCK_REPORT_PERSONAS.foodNomad,
  },
  {
    ...MOCK_REPORT_DETAIL,
    monthLabel: '4월',
    month: { year: 2026, month: 4 },
    persona: MOCK_REPORT_PERSONAS.alleyExplorer,
  },
] as const;

export const MOCK_SPENDING_MONTHS = [
  { year: 2026, month: 8 },
  { year: 2026, month: 7 },
  { year: 2026, month: 6 },
  { year: 2026, month: 5 },
  { year: 2026, month: 4 },
  { year: 2026, month: 3 },
  { year: 2026, month: 2 },
  { year: 2026, month: 1 },
  { year: 2025, month: 12 },
  { year: 2025, month: 11 },
] as const satisfies readonly SpendingMonth[];

export const MOCK_SPENDING_RECORD_GROUPS = [
  {
    dateLabel: '22일 목요일',
    dateValue: '2026-08-22',
    records: [
      {
        id: 'record-01',
        shopName: '투썸플레이스',
        amount: 5500,
        paidAtLabel: '2026.08.22 · 오전',
        category: '카페',
      },
      {
        id: 'record-02',
        shopName: '투썸플레이스',
        amount: 5500,
        paidAtLabel: '2026.08.22 · 오전',
        category: '카페',
      },
      {
        id: 'record-03',
        shopName: '투썸플레이스',
        amount: 5500,
        paidAtLabel: '2026.08.22 · 오전',
        category: '카페',
      },
    ],
  },
  {
    dateLabel: '21일 수요일',
    dateValue: '2026-08-21',
    records: [
      {
        id: 'record-04',
        shopName: '투썸플레이스',
        amount: 5500,
        paidAtLabel: '2026.08.21 · 오전',
        category: '카페',
      },
    ],
  },
  {
    dateLabel: '20일 화요일',
    dateValue: '2026-08-20',
    records: [
      {
        id: 'record-05',
        shopName: '투썸플레이스',
        amount: 5500,
        paidAtLabel: '2026.08.20 · 오전',
        category: '카페',
      },
      {
        id: 'record-06',
        shopName: '투썸플레이스',
        amount: 5500,
        paidAtLabel: '2026.08.20 · 오전',
        category: '카페',
      },
      {
        id: 'record-07',
        shopName: '투썸플레이스',
        amount: 5500,
        paidAtLabel: '2026.08.20 · 오전',
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
