import { useState } from 'react';

export function useReportCalendarNavigation() {
  const [today] = useState(() => new Date());
  const [cursor, setCursor] = useState(today);
  const [view, setView] = useState<'week' | 'month'>('month');
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const endMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const getNavigationDate = (direction: number) =>
    view === 'month'
      ? new Date(year, month + direction, 1)
      : new Date(year, month, cursor.getDate() + direction * 7);
  const updateCursor = (date: Date) => {
    if (date <= endMonth) setCursor(date);
  };

  return { today, cursor, view, setView, year, month, endMonth, getNavigationDate, updateCursor };
}
