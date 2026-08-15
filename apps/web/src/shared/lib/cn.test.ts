import { cn } from './cn';

describe('cn', () => {
  it('타이포그래피와 텍스트 색상 클래스를 함께 유지한다', () => {
    expect(cn('text-body-01-semibold', 'text-neutral-700')).toBe(
      'text-body-01-semibold text-neutral-700'
    );
  });

  it('같은 타이포그래피 그룹에서는 마지막 클래스를 적용한다', () => {
    expect(cn('text-body-01-medium', 'text-body-01-semibold', 'text-neutral-900')).toBe(
      'text-body-01-semibold text-neutral-900'
    );
  });

  it('기본 글자 크기로 타이포그래피 토큰을 재정의할 수 있다', () => {
    expect(cn('text-body-01-semibold', 'text-sm', 'text-neutral-700')).toBe(
      'text-sm text-neutral-700'
    );
  });
});
