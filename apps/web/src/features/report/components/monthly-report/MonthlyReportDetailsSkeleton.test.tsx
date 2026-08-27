import { render } from '@testing-library/react';

import MonthlyReportDetailsSkeleton from './MonthlyReportDetailsSkeleton';

describe('MonthlyReportDetailsSkeleton', () => {
  it('상세 리포트의 다섯 개 섹션 배치를 유지한다', () => {
    const { container } = render(<MonthlyReportDetailsSkeleton />);

    expect(container.querySelectorAll('section')).toHaveLength(5);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(10);
  });
});
