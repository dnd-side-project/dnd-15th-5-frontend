import { parseSpendingMonthFromDate } from './parseSpendingMonthFromDate';

describe('parseSpendingMonthFromDate', () => {
  it('날짜 문자열에서 연도와 월을 추출한다', () => {
    expect(parseSpendingMonthFromDate('2026-08-22')).toEqual({ year: 2026, month: 8 });
  });

  it('윤년의 2월 29일을 허용한다', () => {
    expect(parseSpendingMonthFromDate('2024-02-29')).toEqual({ year: 2024, month: 2 });
  });

  it.each([
    undefined,
    '',
    '2026-13-22',
    '2026-8-22',
    '2026-08-00',
    '2026-08-32',
    '2026-02-29',
    '2026-04-31',
    '2100-02-29',
  ])('잘못된 날짜는 null을 반환한다', (value) => {
    expect(parseSpendingMonthFromDate(value)).toBeNull();
  });
});
