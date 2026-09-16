import type { MonthlyReport } from '@/features/report/types';

import { createMonthlyReportCarouselCards } from './monthlyReportCarousel';

const report: MonthlyReport = {
  adjacentCards: [
    { isUnavailable: true, month: { month: 5, year: 2026 } },
    { isUnavailable: true, month: { month: 7, year: 2026 } },
  ],
  categories: [],
  districts: [],
  month: { month: 6, year: 2026 },
  persona: {
    description: '설명',
    metrics: [],
    tags: [],
    title: '제목',
    variant: 'alley-explorer',
  },
  shops: [],
  summary: [],
  weekdayInsight: '',
  weekdaySpending: [],
};

describe('createMonthlyReportCarouselCards', () => {
  it('선택 가능한 범위 안의 카드를 과거부터 최신 순서로 만든다', () => {
    const cards = createMonthlyReportCarouselCards({
      reportData: report,
      selectableMonths: [
        { month: 7, year: 2026 },
        { month: 6, year: 2026 },
        { month: 5, year: 2026 },
      ],
      selectedMonth: { month: 6, year: 2026 },
    });

    expect(cards.map(({ id }) => id)).toEqual(['2026-05', '2026-06', '2026-07']);
    expect(cards[1]?.isUnavailable).toBe(false);
  });

  it('API가 여러 해에 걸쳐 제공한 인접 카드를 개수 제한 없이 모두 정렬한다', () => {
    const cards = createMonthlyReportCarouselCards({
      reportData: {
        ...report,
        adjacentCards: [
          { isUnavailable: true, month: { month: 3, year: 2026 } },
          { isUnavailable: true, month: { month: 10, year: 2025 } },
          { isUnavailable: true, month: { month: 2, year: 2026 } },
          { isUnavailable: true, month: { month: 12, year: 2025 } },
          { isUnavailable: true, month: { month: 11, year: 2025 } },
        ],
        month: { month: 1, year: 2026 },
      },
      selectableMonths: [
        { month: 3, year: 2026 },
        { month: 2, year: 2026 },
        { month: 1, year: 2026 },
        { month: 12, year: 2025 },
        { month: 11, year: 2025 },
        { month: 10, year: 2025 },
      ],
      selectedMonth: { month: 1, year: 2026 },
    });

    expect(cards.map(({ id }) => id)).toEqual([
      '2025-10',
      '2025-11',
      '2025-12',
      '2026-01',
      '2026-02',
      '2026-03',
    ]);
  });

  it('미리 조회한 인접 월의 바깥쪽 카드도 이동 전에 목록에 합친다', () => {
    const cards = createMonthlyReportCarouselCards({
      adjacentReportData: [
        {
          ...report,
          adjacentCards: [
            { isUnavailable: true, month: { month: 4, year: 2026 } },
            { isUnavailable: true, month: { month: 6, year: 2026 } },
          ],
          month: { month: 5, year: 2026 },
        },
      ],
      reportData: report,
      selectableMonths: [
        { month: 7, year: 2026 },
        { month: 6, year: 2026 },
        { month: 5, year: 2026 },
        { month: 4, year: 2026 },
      ],
      selectedMonth: { month: 6, year: 2026 },
    });

    expect(cards.map(({ id }) => id)).toEqual(['2026-04', '2026-05', '2026-06', '2026-07']);
  });

  it('응답에 선택한 달 카드가 없으면 빈 카드를 추가한다', () => {
    const cards = createMonthlyReportCarouselCards({
      reportData: report,
      selectableMonths: [{ month: 7, year: 2026 }],
      selectedMonth: { month: 7, year: 2026 },
    });

    expect(cards).toEqual([
      { id: '2026-07', isUnavailable: true, month: { month: 7, year: 2026 } },
    ]);
  });

  it('리포트가 없으면 카드도 만들지 않는다', () => {
    expect(
      createMonthlyReportCarouselCards({
        reportData: undefined,
        selectableMonths: [{ month: 7, year: 2026 }],
        selectedMonth: { month: 7, year: 2026 },
      })
    ).toEqual([]);
  });

  it('선택한 달의 리포트가 없어도 인접 카드와 현재 empty 카드를 유지한다', () => {
    const cards = createMonthlyReportCarouselCards({
      reportData: {
        adjacentCards: [
          { isUnavailable: true, month: { month: 3, year: 2026 } },
          {
            description: '설명',
            isUnavailable: false,
            metrics: [],
            month: { month: 5, year: 2026 },
            tags: [],
            title: '제목',
            variant: 'alley-explorer',
          },
        ],
        isUnavailable: true,
        month: { month: 4, year: 2026 },
      },
      selectableMonths: [
        { month: 5, year: 2026 },
        { month: 4, year: 2026 },
        { month: 3, year: 2026 },
      ],
      selectedMonth: { month: 4, year: 2026 },
    });

    expect(cards.map(({ id }) => id)).toEqual(['2026-03', '2026-04', '2026-05']);
    expect(cards[1]).toMatchObject({ isUnavailable: true, month: { month: 4, year: 2026 } });
    expect(cards[2]).toMatchObject({ isUnavailable: false, title: '제목' });
  });
});
