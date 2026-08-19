import { formatAmount, sanitizeAmount } from './amount';

describe('amount utilities', () => {
  it('숫자가 아닌 문자를 제거하고 불필요한 앞자리 0을 정리한다', () => {
    expect(sanitizeAmount('0012abc-000')).toBe('12000');
  });

  it('큰 금액도 정밀도 손실 없이 세 자리마다 쉼표를 표시한다', () => {
    expect(formatAmount('12345678901234567890')).toBe('12,345,678,901,234,567,890');
  });
});
