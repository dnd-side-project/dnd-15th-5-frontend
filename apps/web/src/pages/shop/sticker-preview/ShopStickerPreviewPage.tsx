import { useNavigate } from 'react-router-dom';

import { useDefaultStickerImage } from '@/features/record/sticker/useDefaultStickerImage';
import type { PlaceDetailResponse, PlaceVisitResponse } from '@/features/shop/apis/dto';
import ShopDetailView from '@/features/shop/components/shop-detail/ShopDetailView';
import coffee from '@/shared/assets/images/ios-stickers/coffee.png';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import { BackButton } from '@/shared/ui/back-button';
import { Spinner } from '@/shared/ui/spinner';
import { StateView } from '@/shared/ui/state-view';

const PREVIEW_STICKER_COUNT = 6;
const PREVIEW_PLACE = {
  placeId: 101,
  placeName: '챱챱 카페 · 미리보기',
  category: '카페',
  address: '커피 이모지를 붙여보는 샘플 가게',
  isRegular: false,
  stats: {
    firstVisitedDate: '2026-10-10',
    monthlyVisitCount: PREVIEW_STICKER_COUNT,
    totalVisitCount: PREVIEW_STICKER_COUNT,
  },
} satisfies PlaceDetailResponse;
const PREVIEW_VISITS = Array.from({ length: PREVIEW_STICKER_COUNT }, (_, index) => ({
  visitedAt: `2026-10-${15 - index}`,
  amount: 4500,
})) satisfies PlaceVisitResponse[];
const handlePreviewHistory = () => {};

export default function ShopStickerPreviewPage() {
  const navigate = useNavigate();
  const { imageUrl, error, retry } = useDefaultStickerImage(coffee);

  if (error) {
    return (
      <StateView
        variant="error"
        headingAs="h1"
        title="스티커를 불러오지 못했어요"
        description={error}
        actionLabel="다시 시도"
        onAction={retry}
        className="pt-30"
      />
    );
  }
  if (!imageUrl) {
    return (
      <div
        role="status"
        aria-label="커피 스티커 준비 중"
        className="flex min-h-dvh items-center justify-center"
      >
        <Spinner className="size-8 text-primary-500" />
      </div>
    );
  }

  return (
    <main className="px-4">
      <ShopDetailView
        headerContent={<BackButton onClick={() => navigate(ROUTE_PATHS.record)} />}
        onViewOnMap={() => navigate(ROUTE_PATHS.home)}
        placeId={PREVIEW_PLACE.placeId}
        place={PREVIEW_PLACE}
        stickerImages={Array.from({ length: PREVIEW_STICKER_COUNT }, () => imageUrl)}
        newestStickerIndex={PREVIEW_STICKER_COUNT - 1}
        visitHistory={{
          visits: PREVIEW_VISITS,
          isLoading: false,
          isError: false,
          isFetchNextPageError: false,
          hasNextPage: false,
          isFetchingNextPage: false,
          onLoadMore: handlePreviewHistory,
          onRetry: handlePreviewHistory,
        }}
      />
    </main>
  );
}
