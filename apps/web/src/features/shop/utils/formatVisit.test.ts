import { formatFirstVisitedDate, formatVisitDate } from './formatVisit';

describe('formatFirstVisitedDate', () => {
  const now = new Date(2026, 7, 20);

  it('값이 없으면 대시로 표시한다', () => {
    expect(formatFirstVisitedDate(undefined, now)).toBe('-');
  });

  it('날짜 형식이 아니면 원본 문자열을 그대로 보여준다', () => {
    expect(formatFirstVisitedDate('invalid-date', now)).toBe('invalid-date');
  });

  it('오늘이면 오늘로 표시한다', () => {
    expect(formatFirstVisitedDate('2026-08-20', now)).toBe('오늘');
  });

  it('7일 미만이면 일 단위로 표시한다', () => {
    expect(formatFirstVisitedDate('2026-08-19', now)).toBe('1일 전');
    expect(formatFirstVisitedDate('2026-08-14', now)).toBe('6일 전');
  });

  it('7일 이상 30일 미만이면 주 단위로 표시한다', () => {
    expect(formatFirstVisitedDate('2026-08-13', now)).toBe('1주일 전');
    expect(formatFirstVisitedDate('2026-08-07', now)).toBe('1주일 전');
    expect(formatFirstVisitedDate('2026-08-06', now)).toBe('2주일 전');
    expect(formatFirstVisitedDate('2026-07-22', now)).toBe('4주일 전');
  });

  it('30일 이상 1년 미만이면 달 단위로 표시한다', () => {
    expect(formatFirstVisitedDate('2026-07-21', now)).toBe('1달 전');
    expect(formatFirstVisitedDate('2026-07-20', now)).toBe('1달 전');
    expect(formatFirstVisitedDate('2025-09-20', now)).toBe('11달 전');
  });

  it('1년 이상이면 년 단위로 표시한다', () => {
    expect(formatFirstVisitedDate('2025-08-20', now)).toBe('1년 전');
    expect(formatFirstVisitedDate('2024-08-20', now)).toBe('2년 전');
  });
});

describe('formatVisitDate', () => {
  const now = new Date(2026, 7, 20);

  it('값이 없으면 대시로 표시한다', () => {
    expect(formatVisitDate(undefined, now)).toBe('-');
  });

  it('날짜 형식이 아니면 원본 문자열을 그대로 보여준다', () => {
    expect(formatVisitDate('invalid-date', now)).toBe('invalid-date');
  });

  it('올해 방문 기록이면 연도 없이 월일만 표시한다', () => {
    expect(formatVisitDate('2026-08-23', now)).toBe('8월 23일');
  });

  it('올해가 아닌 방문 기록이면 연도를 함께 표시한다', () => {
    expect(formatVisitDate('2025-08-23', now)).toBe('2025년 8월 23일');
    expect(formatVisitDate('2027-01-01', now)).toBe('2027년 1월 1일');
  });
});
