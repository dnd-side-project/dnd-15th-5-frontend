import { Skeleton } from '@/shared/ui/skeleton';

const SKELETON_GROUP_COUNT = 2;
const STICKER_SKELETON_COUNT = 5;

/** 월별 스티커 기록을 불러오는 동안 날짜별 목록 구조를 유지합니다. */
export default function MonthlyStickerRecordListSkeleton() {
  return (
    <div aria-live="polite" className="flex flex-col gap-6.75 pb-8" role="status">
      <span className="sr-only">기록을 불러오는 중이에요</span>

      <div aria-hidden>
        {Array.from({ length: SKELETON_GROUP_COUNT }, (_, groupIndex) => (
          <div className={groupIndex > 0 ? 'mt-6.75' : undefined} key={groupIndex}>
            <Skeleton className="mb-2 h-5 w-24 rounded-05" />
            <div className="grid grid-cols-5 items-center gap-x-4 rounded-16 bg-neutral-50 px-2.75 py-4">
              {Array.from({ length: STICKER_SKELETON_COUNT }, (_, stickerIndex) => (
                <Skeleton
                  className="size-13.75 justify-self-center rounded-full bg-neutral-200"
                  key={stickerIndex}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
