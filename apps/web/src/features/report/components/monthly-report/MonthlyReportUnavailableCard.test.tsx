import { render, screen } from '@testing-library/react';

import MonthlyReportUnavailableCard from './MonthlyReportUnavailableCard';

describe('MonthlyReportUnavailableCard', () => {
  it('선택한 월을 회전 기능이 없는 물음표 카드로 표시한다', () => {
    render(<MonthlyReportUnavailableCard selectedMonth={{ month: 6, year: 2026 }} />);

    expect(screen.getByRole('article', { name: '6월 리포트 미생성 카드' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '6월 리포트가 없어요' })).toBeInTheDocument();
    expect(screen.getByText('다음 달 리포트를 위해 기록해 주세요')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
