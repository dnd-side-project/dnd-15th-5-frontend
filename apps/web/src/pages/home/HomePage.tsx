import { useCallback } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import {
  GoogleMapView,
  HomeBottomSheet,
  HomeMapOverlay,
  parseCreatedConsumptionPlace,
  toShopSearchResult,
  useCreatedConsumptionResult,
  useOpenVisitedPlaceOnMap,
  useVisitedPlaceStickersQuery,
} from '@/features/map';
import { FrequentShopSummary, SpendingHistory } from '@/features/report';
import { SelectedPlaceSheet } from '@/features/shop';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';

import type { CreatedConsumptionPlace } from '@chapchap/shared/record';

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { stickers } = useVisitedPlaceStickersQuery();
  const { openVisitedPlaceOnMap } = useOpenVisitedPlaceOnMap();
  const createdPlace =
    (location.state as { createdPlace?: CreatedConsumptionPlace } | null)?.createdPlace ??
    parseCreatedConsumptionPlace(searchParams);
  const handleCreatedConsumptionResult = useCallback(() => {
    navigate(ROUTE_PATHS.home, { replace: true, state: null });
  }, [navigate]);
  const handleFrequentShopSelect = useCallback(
    (placeId: number) => {
      void openVisitedPlaceOnMap(String(placeId));
    },
    [openVisitedPlaceOnMap]
  );

  useCreatedConsumptionResult({
    createdPlace,
    onHandled: handleCreatedConsumptionResult,
  });

  return (
    <div className="mobile-frame fixed inset-0 z-0 flex flex-col">
      <GoogleMapView />
      <HomeMapOverlay />
      <HomeBottomSheet
        renderFrequentShops={(headerContent) => (
          <FrequentShopSummary
            headerContent={headerContent}
            onShopSelect={handleFrequentShopSelect}
          />
        )}
        renderSelectedPlace={(placeId) => (
          <SelectedPlaceSheet
            placeId={placeId}
            recordShop={toShopSearchResult(stickers.find(({ id }) => id === placeId))}
          />
        )}
        renderSpendingHistory={(headerContent) => (
          <SpendingHistory
            contentBottomPaddingClassName="pb-28"
            headerContent={headerContent}
            headerContentGapClassName="mt-2"
            headerDescription="이번달 작성한 소비기록을 확인해보세요"
          />
        )}
      />
    </div>
  );
}
