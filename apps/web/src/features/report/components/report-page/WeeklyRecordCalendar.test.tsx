import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

import WeeklyRecordCalendar from './WeeklyRecordCalendar';

const records = [
  { day: '월', date: 18, dateValue: '2026-08-18', count: 2 },
  { day: '화', date: 19, dateValue: '2026-08-19' },
  { day: '수', date: 20, dateValue: '2026-08-20', count: 1, isFuture: true },
] as const;

function HistoryLocationState() {
  const location = useLocation();
  const scrollToDate = (location.state as { scrollToDate?: string } | null)?.scrollToDate;

  return <p>{scrollToDate}</p>;
}

describe('WeeklyRecordCalendar', () => {
  it('기록이 있는 지난 날짜만 소비내역 링크로 제공하고 이동할 날짜를 전달한다', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Routes>
          <Route
            path="/"
            element={
              <WeeklyRecordCalendar
                historyPath="/report/history"
                periodLabel="8월 18일부터 20일까지"
                records={records}
              />
            }
          />
          <Route path="/report/history" element={<HistoryLocationState />} />
        </Routes>
      </MemoryRouter>
    );

    const historyLink = screen.getByRole('link', { name: '2026-08-18 소비 기록 2개 보기' });

    expect(historyLink).toHaveAttribute('href', '/report/history');
    expect(screen.getAllByRole('link')).toHaveLength(1);

    await user.click(historyLink);

    expect(screen.getByText('2026-08-18')).toBeInTheDocument();
  });
});
