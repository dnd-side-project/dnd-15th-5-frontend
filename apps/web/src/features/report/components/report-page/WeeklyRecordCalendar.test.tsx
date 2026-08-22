import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import WeeklyRecordCalendar from './WeeklyRecordCalendar';

const records = [
  { day: '월', date: 18, dateValue: '2026-08-18', count: 2 },
  { day: '화', date: 19, dateValue: '2026-08-19' },
  { day: '수', date: 20, dateValue: '2026-08-20', count: 1, isFuture: true },
] as const;

describe('WeeklyRecordCalendar', () => {
  it('기록이 있는 지난 날짜만 해당 날짜 소비내역 링크로 제공한다', () => {
    render(
      <MemoryRouter>
        <WeeklyRecordCalendar
          historyPath="/report/history"
          periodLabel="8월 18일부터 20일까지"
          records={records}
        />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: '2026-08-18 소비 기록 2개 보기' })).toHaveAttribute(
      'href',
      '/report/history?date=2026-08-18'
    );
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });
});
