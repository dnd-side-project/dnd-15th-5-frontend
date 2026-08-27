import { Skeleton } from '@/shared/ui/skeleton';

/** 히어로 배경을 유지한 채 월간 취향 카드 영역만 표시하는 로딩 화면입니다. */
export default function MonthlyReportCardSkeleton() {
  return (
    <section aria-hidden className="mt-4.5 flex flex-col items-center">
      <Skeleton className="h-93.75 w-69 rounded-15 bg-primary-100/90 shadow-report-preference-card" />
      <div className="mt-6.25 flex items-center gap-3.75">
        <Skeleton className="h-9.25 w-42 rounded-full bg-neutral-200" />
        <Skeleton className="size-10 rounded-full bg-neutral-200" />
      </div>
    </section>
  );
}
