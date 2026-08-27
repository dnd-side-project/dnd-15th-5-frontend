import { render, screen } from '@testing-library/react';

import SpendingHistorySkeleton from './SpendingHistorySkeleton';

describe('SpendingHistorySkeleton', () => {
  it('날짜별 소비내역과 같은 구조의 최초 로딩 상태를 표시한다', () => {
    const { container } = render(<SpendingHistorySkeleton />);

    expect(screen.getByRole('status', { name: '소비내역 불러오는 중' })).toBeInTheDocument();
    expect(container.querySelectorAll('section')).toHaveLength(3);
    expect(container.querySelectorAll('.size-15')).toHaveLength(7);
  });
});
