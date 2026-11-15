import { LocationPinIcon } from '@/shared/assets/icons';
import { Chip } from '@/shared/ui/chip';
import { Skeleton } from '@/shared/ui/skeleton';

const STICKER_SKELETON_COUNT = 5;

/** 선택한 가게의 요약·스티커·버튼 자리를 미리 표시합니다. */
export default function SelectedPlaceSheetSkeleton() {
  return (
    <div role="status" aria-label="가게 요약 불러오는 중">
      <div aria-hidden="true">
        <Skeleton className="h-6.5 w-40" />
        <div className="mt-2 flex min-w-0 items-center gap-2">
          <Chip>
            <Skeleton as="span" className="block h-[1lh] w-6" />
          </Chip>
          <span className="text-caption-01-medium text-neutral-500">|</span>
          <div className="flex min-w-0 items-center gap-1 text-caption-01-regular text-neutral-500">
            <LocationPinIcon className="shrink-0" />
            <Skeleton className="h-[1lh] w-36 max-w-full" />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-5 gap-4 rounded-16 bg-neutral-50 px-2.75 py-4">
          {Array.from({ length: STICKER_SKELETON_COUNT }, (_, index) => (
            <Skeleton key={index} className="size-13.75 justify-self-center rounded-full" />
          ))}
        </div>
        <div className="mt-4 flex gap-4 pb-2">
          <Skeleton className="h-13.5 min-w-0 flex-1 rounded-full" />
          <Skeleton className="size-13.5 shrink-0 rounded-full" />
        </div>
      </div>
    </div>
  );
}
