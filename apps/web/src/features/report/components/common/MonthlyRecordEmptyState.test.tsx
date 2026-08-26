import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import MonthlyRecordEmptyState from './MonthlyRecordEmptyState';

jest.mock('@/shared/assets/images/state', () => ({
  EmptyStateImage: 'img-empty.png',
  ErrorStateImage: 'img-error.png',
}));

describe('MonthlyRecordEmptyState', () => {
  const renderEmptyState = (isPastMonth: boolean) =>
    render(
      <MemoryRouter>
        <MonthlyRecordEmptyState
          isPastMonth={isPastMonth}
          selectedMonth={{ month: 7, year: 2026 }}
        />
      </MemoryRouter>
    );

  it('현재 달이면 소비 기록 작성을 안내한다', () => {
    renderEmptyState(false);

    expect(screen.getByRole('heading', { name: '아직 기록이 없어요' })).toBeInTheDocument();
    expect(
      screen.getByText('소비 기록을 작성해보세요. 빈 공간이 채워질 거예요.')
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '소비 기록 작성하기' })).toHaveAttribute(
      'href',
      '/record'
    );
  });

  it('지난달이면 선택한 월의 기록 작성을 안내한다', () => {
    renderEmptyState(true);

    expect(screen.getByRole('heading', { name: '7월에는 기록이 없어요' })).toBeInTheDocument();
    expect(screen.getByText('지난 소비를 기록하면 빈 공간이 채워질 거예요.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '7월 기록 추가하기' })).toHaveAttribute(
      'href',
      '/record?yearMonth=2026-07'
    );
  });
});
