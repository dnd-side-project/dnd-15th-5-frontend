import { Children, createContext, isValidElement, useContext, useRef, useState } from 'react';
import { DayButton, DayPicker, Week } from 'react-day-picker';
import { ko } from 'react-day-picker/locale';

import { useReportCalendarNavigation } from '@/features/report/hooks/useReportCalendarNavigation';
import {
  getSampleDailyRecords,
  getSampleRecord,
} from '@/features/report/utils/reportCalendarSampleRecords';
import { ChevronRightIcon } from '@/shared/assets/icons';
import { cn } from '@/shared/lib/cn';
import { SegmentedToggle } from '@/shared/ui/segmented-toggle';

import ReportDailyRecordsSheet from './ReportDailyRecordsSheet';

import type { DayButtonProps, DayProps, WeekProps } from 'react-day-picker';

const CalendarContext = createContext<{
  cursor: Date;
  sampleMonth: Date;
  view: 'week' | 'month';
} | null>(null);

function StickerDayButton({ day, modifiers, children, className, ...props }: DayButtonProps) {
  const context = useContext(CalendarContext)!;
  const record = getSampleRecord(day.date, context.sampleMonth);
  return (
    <DayButton
      {...props}
      day={day}
      modifiers={modifiers}
      tabIndex={
        context.view === 'week'
          ? day.date.toDateString() === context.cursor.toDateString()
            ? 0
            : -1
          : props.tabIndex
      }
      aria-label={`${props['aria-label']}, 기록 ${record?.count ?? 0}개`}
      className={cn(
        className,
        'relative flex h-20 w-full flex-col items-center overflow-hidden rounded-10 border border-transparent py-1 text-caption-01-medium text-neutral-600 outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
        record && 'bg-primary-50',
        modifiers.selected && 'border-primary-500 bg-primary-100'
      )}
    >
      <span
        className={cn(
          'flex items-center justify-center rounded-full',
          modifiers.today ? 'size-4.5 bg-primary-500 text-neutral-00' : 'size-5'
        )}
      >
        {children}
      </span>
      {record && <img alt="" className="mt-auto h-12 w-9 object-contain" src={record.image} />}
      {record && record.count > 1 && (
        <span className="absolute right-0 bottom-0 flex h-4 items-center rounded-tl-10 bg-neutral-600 px-1 py-0.5 text-caption-01-medium text-neutral-00">
          +{record.count - 1}
        </span>
      )}
    </DayButton>
  );
}

function CalendarWeekRow(props: WeekProps) {
  const { cursor, view } = useContext(CalendarContext)!;
  const containsCursor = props.week.days.some(
    ({ date }) => date.toDateString() === cursor.toDateString()
  );
  if (view === 'week' && !containsCursor) {
    // DayPicker가 이동 대상으로 지정한 날짜를 먼저 렌더링해야 버튼이 포커스를 받을 수 있다.
    const containsFocusTarget = Children.toArray(props.children).some(
      (child) => isValidElement<DayProps>(child) && child.props.modifiers?.focused
    );
    if (!containsFocusTarget) return <></>;
  }
  return <Week {...props} />;
}

/** 월·주 단위로 스티커 기록을 확인하는 달력입니다. 현재 월에 시안 예시 기록을 표시합니다. */
export default function ReportStickerCalendar() {
  const { today, cursor, view, setView, year, month, endMonth, getNavigationDate, updateCursor } =
    useReportCalendarNavigation();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [sheetDate, setSheetDate] = useState<Date>();
  const sheetTrigger = useRef<HTMLButtonElement>(null);
  const closeSheet = () => {
    setSheetDate(undefined);
    sheetTrigger.current?.focus();
  };

  return (
    <section aria-label="스티커 기록 달력" className="rounded-16 bg-neutral-00 px-3 py-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={view === 'month' ? '이전 달' : '이전 주'}
            onClick={() => updateCursor(getNavigationDate(-1))}
            className="flex size-8 items-center justify-center rounded-08 text-neutral-600 focus-visible:outline-2 focus-visible:outline-primary-500"
          >
            <ChevronRightIcon aria-hidden className="size-5 rotate-180 [&>path]:stroke-2" />
          </button>
          <h2 aria-live="polite" className="text-body-01-medium text-neutral-700">
            {year}년 {month + 1}월
          </h2>
          <button
            type="button"
            aria-label={view === 'month' ? '다음 달' : '다음 주'}
            onClick={() => updateCursor(getNavigationDate(1))}
            disabled={getNavigationDate(1) > endMonth}
            className="flex size-8 items-center justify-center text-neutral-600 focus-visible:outline-2 focus-visible:outline-primary-500 disabled:cursor-default disabled:text-neutral-300"
          >
            <ChevronRightIcon aria-hidden className="size-5 [&>path]:stroke-2" />
          </button>
        </div>
        <SegmentedToggle
          options={[
            { label: 'W', value: 'week' },
            { label: 'M', value: 'month' },
          ]}
          value={view}
          onValueChange={setView}
          ariaLabel="달력 보기 방식"
          variant="compact"
          className="w-18 shrink-0"
        />
      </div>
      <CalendarContext.Provider value={{ cursor, sampleMonth: today, view }}>
        <DayPicker
          mode="single"
          locale={ko}
          weekStartsOn={0}
          month={cursor}
          endMonth={endMonth}
          disabled={{ after: endMonth }}
          onMonthChange={updateCursor}
          selected={selectedDate}
          onSelect={setSelectedDate}
          onDayClick={(date, _modifiers, event) => {
            if (event.currentTarget instanceof HTMLButtonElement) {
              sheetTrigger.current = event.currentTarget;
            }
            setSheetDate(date);
          }}
          onDayFocus={updateCursor}
          showOutsideDays={view === 'week'}
          hideNavigation
          components={{ DayButton: StickerDayButton, Week: CalendarWeekRow }}
          className="mt-4"
          classNames={{
            months: 'w-full',
            month: 'w-full',
            month_caption: 'sr-only',
            month_grid: 'w-full table-fixed border-separate border-spacing-1',
            weekday:
              'py-2 text-center text-caption-01-medium text-neutral-500 first:text-red last:text-primary-500',
            day: 'p-0 align-top',
            hidden: 'invisible',
            footer: 'sr-only',
          }}
          footer={
            selectedDate
              ? `${selectedDate.getFullYear()}년 ${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일 선택됨`
              : undefined
          }
        />
      </CalendarContext.Provider>
      {sheetDate && (
        <ReportDailyRecordsSheet
          date={sheetDate}
          records={getSampleDailyRecords(sheetDate, today)}
          onClose={closeSheet}
        />
      )}
    </section>
  );
}
