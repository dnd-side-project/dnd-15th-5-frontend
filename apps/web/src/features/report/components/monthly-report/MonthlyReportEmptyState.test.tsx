import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import MonthlyReportEmptyState from './MonthlyReportEmptyState';

const mockAggregateMonthlyReport = jest.fn();
let mockIsDevelopment = true;

jest.mock('@/features/report/apis/hooks/useAggregateMonthlyReportMutation', () => ({
  useAggregateMonthlyReportMutation: () => ({
    aggregateMonthlyReport: mockAggregateMonthlyReport,
    isAggregatingMonthlyReport: false,
  }),
}));
jest.mock('@/shared/lib/env', () => ({
  get IS_DEVELOPMENT() {
    return mockIsDevelopment;
  },
}));

describe('MonthlyReportEmptyState', () => {
  beforeEach(() => {
    mockAggregateMonthlyReport.mockClear();
  });

  afterEach(() => {
    mockIsDevelopment = true;
  });

  it('개발 환경에서 배치 실행 버튼을 표시한다', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <MonthlyReportEmptyState selectedMonth={{ month: 6, year: 2026 }} />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: '개발용 리포트 생성' }));
    expect(mockAggregateMonthlyReport).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('개발 환경이 아니면 배치 실행 버튼을 표시하지 않는다', () => {
    mockIsDevelopment = false;

    render(
      <MemoryRouter>
        <MonthlyReportEmptyState selectedMonth={{ month: 6, year: 2026 }} />
      </MemoryRouter>
    );

    expect(screen.queryByRole('button', { name: '개발용 리포트 생성' })).not.toBeInTheDocument();
    expect(screen.queryByText(/리포트가 생성되지 않았어요/)).not.toBeInTheDocument();
  });
});
