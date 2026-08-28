import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ReportCardUnavailableImage } from '@/shared/assets/images/preference-card';

import MonthlyReportUnavailableCard from './MonthlyReportUnavailableCard';

describe('MonthlyReportUnavailableCard', () => {
  it('카드가 없는 월을 배경 이미지와 최신 리포트 이동 버튼으로 표시한다', async () => {
    const onViewCurrentReport = jest.fn();
    const user = userEvent.setup();

    render(
      <MonthlyReportUnavailableCard
        onViewCurrentReport={onViewCurrentReport}
        selectedMonth={{ month: 6, year: 2026 }}
      />
    );

    const card = screen.getByRole('article', { name: '6월 리포트 미생성 카드' });
    const image = card.querySelector('img');

    expect(image).toHaveAttribute('src', ReportCardUnavailableImage);
    expect(screen.getByRole('heading', { name: '생성된 카드가 없어요' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '최근 리포트 보러가기' }));

    expect(onViewCurrentReport).toHaveBeenCalledTimes(1);
  });

  it('선택한 월이 최신이면 최근 리포트 이동 버튼을 표시하지 않는다', () => {
    render(
      <MonthlyReportUnavailableCard
        isActionVisible={false}
        onViewCurrentReport={jest.fn()}
        selectedMonth={{ month: 7, year: 2026 }}
      />
    );

    expect(screen.getByRole('heading', { name: '생성된 카드가 없어요' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '최근 리포트 보러가기' })).not.toBeInTheDocument();
  });
});
