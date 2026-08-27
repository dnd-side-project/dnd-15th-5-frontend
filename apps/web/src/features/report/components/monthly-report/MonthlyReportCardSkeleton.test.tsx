import { render } from '@testing-library/react';

import MonthlyReportCardSkeleton from './MonthlyReportCardSkeleton';

describe('MonthlyReportCardSkeleton', () => {
  it('카드와 액션 영역의 로딩 배치를 표시한다', () => {
    const { container } = render(<MonthlyReportCardSkeleton />);

    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(3);
  });
});
