import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import MonthlyReportEmptyState from './MonthlyReportEmptyState';

describe('MonthlyReportEmptyState', () => {
  it('선택한 월의 리포트 생성 정책을 안내한다', () => {
    render(
      <MemoryRouter>
        <MonthlyReportEmptyState selectedMonth={{ month: 6, year: 2026 }} />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('heading', { name: '6월 리포트가 생성되지 않았어요' })
    ).toBeInTheDocument();
    expect(screen.getByText(/월간 리포트는 매월 1일에/)).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
