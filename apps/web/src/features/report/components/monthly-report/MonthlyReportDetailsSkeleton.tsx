import { Skeleton } from '@/shared/ui/skeleton';

const SectionHeadingSkeleton = ({ hasDescription = false }: { hasDescription?: boolean }) => (
  <div>
    <Skeleton className="h-7 w-27 rounded-full" />
    {hasDescription && <Skeleton className="mt-2 h-4.5 w-64 rounded-full" />}
  </div>
);

/** 월간 리포트의 상세 섹션 배치를 유지하는 로딩 화면입니다. */
export default function MonthlyReportDetailsSkeleton() {
  return (
    <div aria-hidden className="relative flex flex-col gap-13.75 px-4.25 pt-10">
      <section>
        <SectionHeadingSkeleton />
        <div className="mt-3 grid h-23.25 grid-cols-3 items-center rounded-15 bg-neutral-50 px-4">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              className={`flex flex-col items-center gap-2 ${index === 0 ? '' : 'border-l border-neutral-200'}`}
              key={index}
            >
              <Skeleton className="h-4.5 w-14 rounded-full" />
              <Skeleton className="h-7 w-9 rounded-full" />
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeadingSkeleton hasDescription />
        <div className="mt-3 flex flex-col gap-3.75">
          <div className="h-37.5 rounded-16 bg-primary-50 p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-9.5 shrink-0 rounded-full bg-primary-100" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-5.5 w-2/5 rounded-full bg-primary-100" />
                <Skeleton className="h-4.5 w-3/5 rounded-full bg-primary-100" />
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              {Array.from({ length: 5 }, (_, index) => (
                <Skeleton className="size-15 rounded-full bg-primary-100" key={index} />
              ))}
            </div>
          </div>
          {Array.from({ length: 2 }, (_, index) => (
            <div
              className="flex h-18.75 items-center gap-3 rounded-16 bg-neutral-50 p-4"
              key={index}
            >
              <Skeleton className="h-10 w-9.5 shrink-0 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-5.5 w-2/5 rounded-full" />
                <Skeleton className="h-4.5 w-3/5 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeadingSkeleton hasDescription />
        <div className="mt-3 grid grid-cols-[1.2fr_1fr] gap-3.75">
          <Skeleton className="h-41.25 rounded-16 bg-primary-100" />
          <div className="flex flex-col gap-3.75">
            <Skeleton className="h-18.75 rounded-16" />
            <Skeleton className="h-18.75 rounded-16" />
          </div>
        </div>
      </section>

      <section>
        <SectionHeadingSkeleton />
        <Skeleton className="mt-3 h-9.75 w-full rounded-lg" />
        <div className="mt-4 flex gap-3">
          {Array.from({ length: 4 }, (_, index) => (
            <div className="flex items-center gap-1.5" key={index}>
              <Skeleton className="size-5 rounded-full" />
              <Skeleton className="h-4.5 w-10 rounded-full" />
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeadingSkeleton />
        <div className="mt-3 grid h-29.25 grid-cols-7 items-end gap-1">
          {[45, 70, 35, 82, 55, 100, 62].map((height, index) => (
            <div className="flex h-full flex-col items-center justify-end gap-1" key={index}>
              <Skeleton
                className="w-full max-w-11.25 rounded-lg"
                style={{ height: `${height}%` }}
              />
              <Skeleton className="h-4.5 w-4 rounded-full" />
            </div>
          ))}
        </div>
        <Skeleton className="mt-7 h-9 rounded-lg bg-primary-100" />
      </section>
    </div>
  );
}
