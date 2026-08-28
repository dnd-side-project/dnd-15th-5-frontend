import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import MonthlyReportUnavailableCard from './MonthlyReportUnavailableCard';

describe('MonthlyReportUnavailableCard', () => {
  it('카드가 없는 월을 최신 리포트 이동 버튼과 함께 표시한다', async () => {
    const onViewCurrentReport = jest.fn();
    const user = userEvent.setup();

    render(
      <MonthlyReportUnavailableCard
        onViewCurrentReport={onViewCurrentReport}
        selectedMonth={{ month: 6, year: 2026 }}
      />
    );

    expect(screen.getByRole('article', { name: '6월 리포트 미생성 카드' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '생성된 카드가 없어요' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '이번달 리포트 보러가기' }));

    expect(onViewCurrentReport).toHaveBeenCalledTimes(1);
  });
});
