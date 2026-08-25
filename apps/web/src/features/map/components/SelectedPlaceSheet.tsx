import { AddIcon, LocationPinIcon } from '@/shared/assets/icons';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import { LinkButton } from '@/shared/ui/button';
import { Chip } from '@/shared/ui/chip';
import { RegularShopBadge } from '@/shared/ui/regular-shop-badge';
import { StickerCollection } from '@/shared/ui/sticker-collection';

import type { MapPlaceDetail } from '../types';

type SelectedPlaceSheetProps = {
  place: MapPlaceDetail;
};

/** 선택한 지도 스티커에 연결된 장소 요약과 최근 획득 스티커를 표시합니다. */
export default function SelectedPlaceSheet({ place }: SelectedPlaceSheetProps) {
  return (
    <section aria-labelledby={`selected-place-${place.id}`}>
      <div className="flex items-center gap-2.5">
        <h2
          id={`selected-place-${place.id}`}
          className="min-w-0 truncate text-title-02-semibold text-neutral-700"
        >
          {place.name}
        </h2>
        {place.isRegular && <RegularShopBadge />}
      </div>

      <div className="mt-2 flex min-w-0 items-center gap-2">
        <Chip>{place.category}</Chip>
        <span aria-hidden="true" className="text-caption-01-medium text-neutral-500">
          |
        </span>
        <p className="flex min-w-0 items-center gap-1 text-caption-01-regular text-neutral-500">
          <LocationPinIcon aria-hidden="true" className="shrink-0" />
          <span className="truncate">{place.address}</span>
        </p>
      </div>

      <StickerCollection
        stickers={place.stickerImages}
        maxItems={5}
        ariaLabel="최근 획득한 스티커"
        className="mt-4"
      />

      <div className="mt-4 flex gap-4 pb-2">
        <LinkButton to={ROUTE_PATHS.shopDetail(place.id)} size="large" className="min-w-0 flex-1">
          상세보기
        </LinkButton>
        <LinkButton
          to={ROUTE_PATHS.record}
          variant="icon-primary"
          size="large"
          aria-label={`${place.name} 소비 기록 추가`}
          className="size-13.5"
        >
          <AddIcon aria-hidden="true" />
        </LinkButton>
      </div>
    </section>
  );
}
