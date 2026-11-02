import { useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import {
  toShopSearchResult,
  useOpenVisitedPlaceOnMap,
  useVisitedPlaceStickersQuery,
} from '@/features/map';
import { ShopDetail } from '@/features/shop';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import { usePrefersReducedMotion } from '@/shared/hooks/usePrefersReducedMotion';
import { BackButton } from '@/shared/ui/back-button';
import { getRecordShopFromLocationState } from '@/shared/utils/recordNavigation';

const DETAIL_ENTER_DURATION_MS = 160;
const DETAIL_ENTER_OFFSET_PX = 8;
const DETAIL_ENTER_EASING = 'cubic-bezier(0.2, 0.8, 0.2, 1)';

type ShopDetailPageState = {
  fromMapSheet?: boolean;
};

export default function ShopDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromMapSheet = (location.state as ShopDetailPageState | null)?.fromMapSheet === true;
  const { shopId } = useParams();
  const pageRef = useRef<HTMLElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const placeId = Number(shopId);
  const { openVisitedPlaceOnMap } = useOpenVisitedPlaceOnMap();
  const { stickers } = useVisitedPlaceStickersQuery();
  const recordShop =
    getRecordShopFromLocationState(location.state) ??
    toShopSearchResult(stickers.find(({ id }) => id === shopId));

  useLayoutEffect(() => {
    if (!fromMapSheet || prefersReducedMotion) return;
    const animation = pageRef.current?.animate?.(
      [
        { opacity: 0, transform: `translateY(${DETAIL_ENTER_OFFSET_PX}px)` },
        { opacity: 1, transform: 'none' },
      ],
      { duration: DETAIL_ENTER_DURATION_MS, easing: DETAIL_ENTER_EASING }
    );
    return () => animation?.cancel();
  }, [fromMapSheet, prefersReducedMotion, shopId]);

  const focusThisShopOnMap = async () => {
    if (!shopId) return;
    await openVisitedPlaceOnMap(shopId);
  };

  const handleViewOnMap = async () => {
    await focusThisShopOnMap();
    navigate(ROUTE_PATHS.home);
  };

  const handleBack = async () => {
    // NOTE: 뒤로 가기로 홈에 돌아왔을 때도 이 매장의 바텀시트가 뜨므로, 지도 포커스도 함께 맞춘다.
    // 되돌아갈 히스토리가 없어 홈으로 직접 이동하는 경우도 마찬가지다.
    await focusThisShopOnMap();

    const historyIndex = window.history.state?.idx;
    if (typeof historyIndex === 'number' && historyIndex > 0) {
      navigate(-1);
      return;
    }

    navigate(ROUTE_PATHS.home, { replace: true });
  };

  return (
    <main ref={pageRef}>
      <ShopDetail
        placeId={placeId}
        recordShop={recordShop}
        onViewOnMap={() => void handleViewOnMap()}
        headerContent={<BackButton onClick={() => void handleBack()} />}
      />
    </main>
  );
}
