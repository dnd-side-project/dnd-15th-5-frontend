import { render, screen } from '@testing-library/react';

import ReportContentSkeleton from './ReportContentSkeleton';

describe('ReportContentSkeleton', () => {
  it('주간 기록의 일곱 칸을 실제 포커스 영역 높이로 표시한다', () => {
    const { container } = render(<ReportContentSkeleton variant="weekly" />);

    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
    expect(container.firstChild?.childNodes).toHaveLength(7);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
