import { formatTimePeriod } from './formatTimePeriod';

describe('formatTimePeriod', () => {
  it.each([
    ['00:00:00', '오전'],
    ['11:59:59', '오전'],
    ['12:00:00', '오후'],
    ['23:59:59', '오후'],
    ['09:30', '오전'],
    ['14:30:00.123', '오후'],
  ])('%s의 오전·오후를 구분한다', (time, expected) => {
    expect(formatTimePeriod(time)).toBe(expected);
  });

  it.each([undefined, '', 'invalid', '24:00:00', '09:60:00', '12:30:60'])(
    '누락되거나 유효하지 않은 시각은 생략한다: %s',
    (time) => {
      expect(formatTimePeriod(time)).toBeUndefined();
    }
  );
});
