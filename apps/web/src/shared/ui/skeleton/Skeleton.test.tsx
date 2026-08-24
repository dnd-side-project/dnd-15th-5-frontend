import { render } from '@testing-library/react';

import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('기본 스타일과 접근성 속성을 적용한다', () => {
    const { container } = render(<Skeleton className="h-4 w-20" />);
    const skeleton = container.firstChild;

    expect(skeleton).toHaveClass('animate-pulse', 'rounded-08', 'bg-neutral-200', 'h-4', 'w-20');
    expect(skeleton).toHaveAttribute('aria-hidden', 'true');
  });

  it('문장 안에서 span 요소로 렌더링할 수 있다', () => {
    const { container } = render(<Skeleton as="span" />);

    expect(container.firstChild?.nodeName).toBe('SPAN');
  });
});
