import { createInitialVisitDateTimeForMonth } from './createInitialVisitDateTimeForMonth';

describe('createInitialVisitDateTimeForMonth', () => {
  const now = new Date(2026, 7, 25, 14);

  it('과거 월이면 해당 월의 마지막 날 오후를 반환한다', () => {
    expect(createInitialVisitDateTimeForMonth('2026-07', now)).toEqual({
      date: new Date(2026, 6, 31),
      period: 'afternoon',
    });
  });

  it('윤년 2월의 마지막 날을 반환한다', () => {
    expect(createInitialVisitDateTimeForMonth('2024-02', now).date).toEqual(new Date(2024, 1, 29));
  });

  it('현재 또는 미래 월이면 현재 날짜를 반환한다', () => {
    expect(createInitialVisitDateTimeForMonth('2026-08', now).date).toBe(now);
    expect(createInitialVisitDateTimeForMonth('2026-09', now).date).toBe(now);
  });

  it.each([null, '', '2026-7', '2026-00', '2026-13'])(
    '잘못된 연월이면 현재 방문 일시를 반환한다',
    (yearMonth) => {
      expect(createInitialVisitDateTimeForMonth(yearMonth, now)).toEqual({
        date: now,
        period: 'afternoon',
      });
    }
  );
});
