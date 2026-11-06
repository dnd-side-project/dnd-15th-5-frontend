import { useId, useState } from 'react';

import { REPORT_CATEGORY_COLOR_CLASS_NAMES } from '@/features/report/constants';
import { ChevronUpIcon } from '@/shared/assets/icons';
import { cn } from '@/shared/lib/cn';

const CATEGORIES = [
  { name: '카페', percentage: 40, count: 12 },
  { name: '편의점/마트', percentage: 20, count: 6 },
  { name: '음식점', percentage: 12, count: 1 },
  { name: '쇼핑', percentage: 10, count: 1 },
  { name: '기타', percentage: 5, count: 1 },
  { name: '미용/뷰티', percentage: 5, count: 1 },
  { name: '운동', percentage: 4, count: 1 },
  { name: '취미/놀거리', percentage: 4, count: 1 },
] as const;

/** 메인 리포트의 카테고리 비율과 금액·방문 횟수를 표시합니다. 현재는 시안 예시 데이터입니다. */
export default function ReportCategoryDistribution() {
  const detailsId = useId();
  const [isExpanded, setIsExpanded] = useState(false);
  const visibleCategories = isExpanded ? CATEGORIES : CATEGORIES.slice(0, 4);

  return (
    <section className="rounded-16 bg-neutral-00 px-3 py-4" aria-label="카테고리 분포도">
      <h2 className="text-body-01-semibold text-neutral-700">카테고리 분포도</h2>
      <div
        className="mt-5.5 flex h-5.5 overflow-hidden rounded-full"
        role="img"
        aria-label={CATEGORIES.map(({ name, percentage }) => `${name} ${percentage}%`).join(', ')}
      >
        {CATEGORIES.map(({ name, percentage }) => (
          <span
            key={name}
            className={cn(
              REPORT_CATEGORY_COLOR_CLASS_NAMES[name],
              'border-r border-neutral-00 last:border-r-0'
            )}
            style={{ flex: percentage }}
          />
        ))}
      </div>
      <ul id={detailsId} className="mt-6 flex flex-col gap-3">
        {visibleCategories.map(({ name, percentage, count }) => (
          <li key={name} className="flex items-center gap-3">
            <span
              aria-hidden
              className={cn(
                'size-2.5 shrink-0 rounded-full',
                REPORT_CATEGORY_COLOR_CLASS_NAMES[name]
              )}
            />
            <div className="min-w-0 flex-1">
              <p className="text-body-02-semibold text-neutral-600">
                {name} {percentage}%
              </p>
              <p className="text-caption-01-regular text-neutral-500">128,500원</p>
            </div>
            <span className="text-body-02-semibold text-neutral-700">{count}회</span>
          </li>
        ))}
      </ul>
      <div className="relative mt-4 h-1.25">
        <button
          type="button"
          aria-expanded={isExpanded}
          aria-controls={detailsId}
          aria-label={isExpanded ? '카테고리 접기' : '카테고리 전체 보기'}
          onClick={() => setIsExpanded((value) => !value)}
          className="absolute top-1/2 left-1/2 flex w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center py-4 text-neutral-500 focus-visible:outline-2 focus-visible:outline-primary-500"
        >
          <ChevronUpIcon aria-hidden className={cn('h-2', !isExpanded && 'rotate-180')} />
        </button>
      </div>
    </section>
  );
}
