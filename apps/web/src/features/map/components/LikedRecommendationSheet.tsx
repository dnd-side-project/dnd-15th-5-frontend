import { useHomeBottomSheetStore } from '@/features/map/stores/homeBottomSheetStore';
import { useShopRecommendationStore } from '@/features/map/stores/shopRecommendationStore';
import { getDistrict, getGoogleMapsPlaceUrl } from '@/features/map/utils/recommendation';
import { BlueLocationPinIcon, LikeIcon } from '@/shared/assets/icons';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import { LinkButton } from '@/shared/ui/button';
import { PlaceTagCard } from '@/shared/ui/card';

import type { ShopRecommendation } from '../types';

type LikedRecommendationSheetProps = {
  recommendation: ShopRecommendation;
};

/** 좋아요 지도 마커를 선택했을 때 보여주는 가게 요약과 기록 바로가기입니다. */
export default function LikedRecommendationSheet({
  recommendation,
}: LikedRecommendationSheetProps) {
  const toggleLikedRecommendation = useShopRecommendationStore(
    (state) => state.toggleLikedRecommendation
  );
  const showHome = useHomeBottomSheetStore((state) => state.showHome);
  const { id, place, thumbnailSrc } = recommendation;

  const handleUnlike = () => {
    toggleLikedRecommendation(id);
    showHome();
  };

  return (
    <section aria-labelledby={`liked-recommendation-${id}`}>
      <h2 id={`liked-recommendation-${id}`} className="sr-only">
        {place.name}
      </h2>

      <div className="relative pr-10">
        <PlaceTagCard
          thumbnailSrc={thumbnailSrc}
          thumbnailSize="large"
          title={place.name}
          tags={[
            { label: getDistrict(place.address), icon: BlueLocationPinIcon },
            { label: place.category },
          ]}
          footer={
            <a
              href={getGoogleMapsPlaceUrl(place.name, place.address)}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex px-4 py-1.5 items-center justify-center rounded-08 border border-neutral-200 text-caption-01-medium text-neutral-500 outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
            >
              지도앱에서 확인하기
            </a>
          }
        />
        <button
          type="button"
          aria-label={`${place.name} 좋아요 해제`}
          onClick={handleUnlike}
          className="absolute top-0 right-1 flex size-8 items-center justify-center rounded-full text-primary-500 outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
        >
          <LikeIcon aria-hidden="true" className="size-5" />
        </button>
      </div>

      <LinkButton to={ROUTE_PATHS.record} size="large" className="mt-4">
        기록하기
      </LinkButton>
    </section>
  );
}
