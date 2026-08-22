import { cn } from '@/shared/lib/cn';

import type { WeeklyRecord } from '../../types';

type WeeklyRecordCalendarProps = {
  periodLabel: string;
  records: readonly WeeklyRecord[];
};

/** 일주일간의 날짜별 소비 기록 수를 달력 형태로 보여줍니다. */
export default function WeeklyRecordCalendar({ periodLabel, records }: WeeklyRecordCalendarProps) {
  return (
    <ol
      aria-label={`${periodLabel} 소비 기록`}
      className="grid grid-cols-7 gap-1 rounded-16 bg-primary-50 px-3 py-3.25"
    >
      {records.map(({ day, date, count, isFuture, isToday }) => (
        <li
          className={cn(
            'flex h-23.25 min-w-0 flex-col items-center justify-between rounded-05 px-1 py-2 text-center',
            isToday && 'bg-primary-100'
          )}
          key={date}
        >
          <div className="flex flex-col items-center gap-1">
            <span className="text-body-02-medium text-neutral-500">{day}</span>
            <span
              aria-current={isToday ? 'date' : undefined}
              className={cn(
                'flex size-8 items-center justify-center rounded-full text-body-01-medium',
                isToday
                  ? 'bg-primary-400 text-neutral-00'
                  : isFuture
                    ? 'text-neutral-400'
                    : 'text-neutral-900'
              )}
            >
              {date}
            </span>
          </div>
          <span className="h-3 text-label-01-medium text-neutral-500">
            {count ? `+${count}` : ''}
          </span>
        </li>
      ))}
    </ol>
  );
}
