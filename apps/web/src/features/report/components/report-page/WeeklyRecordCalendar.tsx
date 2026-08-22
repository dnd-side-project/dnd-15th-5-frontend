import { Link } from 'react-router-dom';

import { cn } from '@/shared/lib/cn';

import type { WeeklyRecord } from '../../types';

type WeeklyRecordCalendarProps = {
  historyPath: string;
  periodLabel: string;
  records: readonly WeeklyRecord[];
};

type WeeklyRecordCellContentProps = {
  record: WeeklyRecord;
};

function WeeklyRecordCellContent({ record }: WeeklyRecordCellContentProps) {
  const { count, date, day, isFuture, isToday } = record;

  return (
    <>
      <div className="flex flex-col items-center gap-1">
        <span className="text-body-02-medium text-neutral-500">{day}</span>
        <span
          aria-current={isToday ? 'date' : undefined}
          className={cn(
            'flex size-8 items-center justify-center rounded-full text-body-01-medium transition-colors',
            isToday
              ? 'bg-primary-400 text-neutral-00 group-hover:text-primary-600'
              : isFuture
                ? 'text-neutral-400'
                : 'text-neutral-900 group-hover:bg-primary-200 group-hover:text-primary-600'
          )}
        >
          {date}
        </span>
      </div>
      <span className="h-3 text-label-01-medium text-neutral-500">{count ? `+${count}` : ''}</span>
    </>
  );
}

/** 일주일간의 날짜별 소비 기록 수를 달력 형태로 보여줍니다. */
export default function WeeklyRecordCalendar({
  historyPath,
  periodLabel,
  records,
}: WeeklyRecordCalendarProps) {
  return (
    <ol
      aria-label={`${periodLabel} 소비 기록`}
      className="grid grid-cols-7 gap-1 rounded-16 bg-primary-50 px-3 py-3.25"
    >
      {records.map((record) => {
        const { count, dateValue, isFuture, isToday } = record;
        const isClickable = Boolean(count) && !isFuture;
        const cellClassName =
          'flex h-full w-full flex-col items-center justify-between rounded-05 px-1 py-2 text-center';

        return (
          <li
            className={cn('h-23.25 min-w-0 rounded-05', isToday && 'bg-primary-100')}
            key={dateValue}
          >
            {isClickable ? (
              <Link
                aria-label={`${dateValue} 소비 기록 ${count}개 보기`}
                className={cn(
                  cellClassName,
                  'group active:bg-primary-100 focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-inset focus-visible:outline-none'
                )}
                to={`${historyPath}?date=${dateValue}`}
              >
                <WeeklyRecordCellContent record={record} />
              </Link>
            ) : (
              <div className={cellClassName}>
                <WeeklyRecordCellContent record={record} />
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
