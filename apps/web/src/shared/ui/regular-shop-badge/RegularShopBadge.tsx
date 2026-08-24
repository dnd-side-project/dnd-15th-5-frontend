import { CrownIcon } from '@/shared/assets/icons';

/** 사용자가 단골로 등록한 매장임을 표시합니다. */
export function RegularShopBadge() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-16 bg-primary-100 px-2 py-1 text-label-01-semibold text-primary-500">
      <CrownIcon aria-hidden="true" className="size-4" />
      나의 단골
    </span>
  );
}
