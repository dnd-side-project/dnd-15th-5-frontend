import { useGetPlaceDetail } from '@/features/shop/apis/queries';
import { AddIcon, LocationPinIcon } from '@/shared/assets/icons';
import { getStickerImageByName } from '@/shared/assets/images/stickers';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import { LinkButton } from '@/shared/ui/button';
import { Chip } from '@/shared/ui/chip';
import { RegularShopBadge } from '@/shared/ui/regular-shop-badge';
import { Spinner } from '@/shared/ui/spinner';
import { StateView } from '@/shared/ui/state-view';
import { StickerCollection } from '@/shared/ui/sticker-collection';

type SelectedPlaceSheetProps = {
  placeId: string;
};

/** 선택한 지도 스티커에 연결된 장소 요약과 최근 획득 스티커를 표시합니다. */
export default function SelectedPlaceSheet({ placeId }: SelectedPlaceSheetProps) {
  const numericPlaceId = Number(placeId);
  const isValidPlaceId = Number.isSafeInteger(numericPlaceId) && numericPlaceId > 0;
  const query = useGetPlaceDetail(numericPlaceId, { query: { enabled: isValidPlaceId } });

  if (!isValidPlaceId) {
    return (
      <StateView
        variant="error"
        headingAs="h1"
        title="가게 정보를 찾을 수 없어요"
        description="지도에서 가게를 다시 선택해주세요."
        actionLabel="지도로 돌아가기"
        to={ROUTE_PATHS.home}
        className="py-6"
      />
    );
  }

  if (query.isPending) {
    return (
      <div
        role="status"
        aria-label="가게 요약 불러오는 중"
        className="flex min-h-40 items-center justify-center"
      >
        <Spinner className="size-6 text-primary-500" />
      </div>
    );
  }

  const place = query.data?.data;
  if (query.isError || !place?.placeId || !place.placeName) {
    return (
      <StateView
        variant="error"
        headingAs="h1"
        title="가게 정보를 불러오지 못했어요"
        description="잠시 후 다시 시도해주세요."
        actionLabel="다시 불러오기"
        onAction={() => void query.refetch()}
        className="py-6"
      />
    );
  }

  const stickerImages = (place.recentStickers ?? []).flatMap((sticker) => {
    const image = getStickerImageByName(sticker.itemName);
    return image ? [image] : [];
  });

  return (
    <section aria-labelledby={`selected-place-${place.placeId}`}>
      <div className="flex items-center gap-2.5">
        <h1
          id={`selected-place-${place.placeId}`}
          className="min-w-0 truncate text-title-02-semibold text-neutral-700"
        >
          {place.placeName}
        </h1>
        {place.isRegular === true && <RegularShopBadge />}
      </div>

      <div className="mt-2 flex min-w-0 items-center gap-2">
        <Chip>{place.category ?? '기타'}</Chip>
        <span aria-hidden="true" className="text-caption-01-medium text-neutral-500">
          |
        </span>
        <p className="flex min-w-0 items-center gap-1 text-caption-01-regular text-neutral-500">
          <LocationPinIcon aria-hidden="true" className="shrink-0" />
          <span className="truncate">{place.address ?? ''}</span>
        </p>
      </div>

      <StickerCollection
        stickers={stickerImages}
        maxItems={5}
        ariaLabel="최근 획득한 스티커"
        className="mt-4"
      />

      <div className="mt-4 flex gap-4 pb-2">
        <LinkButton
          to={ROUTE_PATHS.shopDetail(String(place.placeId))}
          size="large"
          className="min-w-0 flex-1"
        >
          상세보기
        </LinkButton>
        <LinkButton
          to={ROUTE_PATHS.record}
          variant="icon-primary"
          size="large"
          aria-label={`${place.placeName} 소비 기록 추가`}
          className="size-13.5"
        >
          <AddIcon aria-hidden="true" />
        </LinkButton>
      </div>
    </section>
  );
}
