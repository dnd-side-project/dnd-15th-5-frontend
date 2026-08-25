import {
  addMonth,
  formatMonthLabel,
  formatYearMonth,
  getCurrentMonth,
  getMonthDifference,
  isBeforeMonth,
  isSameMonth,
  isValidYearMonth,
  parseYearMonth,
} from './yearMonth';

describe('yearMonth utils', () => {
  it('날짜에서 현재 연월을 추출한다', () => {
    expect(getCurrentMonth(new Date(2026, 7, 25))).toEqual({ year: 2026, month: 8 });
  });

  it('연도 경계를 넘어 월을 이동한다', () => {
    expect(addMonth({ year: 2026, month: 12 }, 1)).toEqual({ year: 2027, month: 1 });
    expect(addMonth({ year: 2026, month: 1 }, -1)).toEqual({ year: 2025, month: 12 });
  });

  it('연월의 동일 여부와 이전 여부를 비교한다', () => {
    expect(isSameMonth({ year: 2026, month: 7 }, { year: 2026, month: 7 })).toBe(true);
    expect(isBeforeMonth({ year: 2025, month: 12 }, { year: 2026, month: 1 })).toBe(true);
    expect(isBeforeMonth({ year: 2026, month: 2 }, { year: 2026, month: 1 })).toBe(false);
  });

  it('연월 사이의 개월 수 차이를 계산한다', () => {
    expect(getMonthDifference({ year: 2026, month: 8 }, { year: 2025, month: 12 })).toBe(8);
  });

  it('연월을 API 및 화면 표시 형식으로 변환한다', () => {
    const month = { year: 2026, month: 7 };

    expect(formatYearMonth(month)).toBe('2026-07');
    expect(formatMonthLabel(month)).toBe('2026년 7월');
  });

  it('YYYY-MM 문자열을 연월로 변환하고 유효성을 확인한다', () => {
    expect(parseYearMonth('2026-07')).toEqual({ year: 2026, month: 7 });
    expect(isValidYearMonth('2026-07')).toBe(true);
  });

  it.each([undefined, null, '', '2026-7', '2026-00', '2026-13', '26-07'])(
    '잘못된 연월은 null을 반환한다',
    (value) => {
      expect(parseYearMonth(value)).toBeNull();
      expect(isValidYearMonth(value)).toBe(false);
    }
  );
});
