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
import { useHasUnreadNotificationQuery } from '@/features/notification';
import ConsumptionRecordActions from '@/features/record/components/ConsumptionRecordActions';
import ConsumptionSticker from '@/features/record/components/ConsumptionSticker';
import { FrequentShopSummary, SpendingHistory } from '@/features/report';
import { SelectedPlaceSheet } from '@/features/shop';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import {
  getConsumptionScrollDate,
  getConsumptionScrollId,
} from '@/shared/utils/consumptionNavigation';

import type { CreatedConsumptionPlace } from '@chapchap/shared/record';

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { hasUnreadNotification } = useHasUnreadNotificationQuery();
  const { stickers } = useVisitedPlaceStickersQuery();
  const { openVisitedPlaceOnMap } = useOpenVisitedPlaceOnMap();
  const stateCreatedPlace = (location.state as { createdPlace?: CreatedConsumptionPlace } | null)
    ?.createdPlace;
  const receiptCreatedPlace = parseCreatedConsumptionPlace(searchParams);
  const createdPlace = stateCreatedPlace ?? receiptCreatedPlace;
  const recordMethod = stateCreatedPlace ? 'manual' : receiptCreatedPlace ? 'receipt' : undefined;
  const handleCreatedConsumptionResult = useCallback(() => {
    navigate(ROUTE_PATHS.home, { replace: true, state: null });
  }, [navigate]);
  const handleFrequentShopSelect = useCallback(
    (placeId: number) => {
      void openVisitedPlaceOnMap(String(placeId));
    },
    [openVisitedPlaceOnMap]
  );
  const handleSelectedPlaceExpand = useCallback(
    (placeId: string) => {
      navigate(ROUTE_PATHS.shopDetail(placeId), { state: { fromMapSheet: true } });
    },
    [navigate]
  );

  const handleOpenRecommendationSearch = () => {
    navigate(ROUTE_PATHS.homeRecommendationSearch, { state: 'home' });
  };

  useCreatedConsumptionResult({
    createdPlace,
    recordMethod,
    onHandled: handleCreatedConsumptionResult,
  });

  return (
    <ConsumptionRecordActions>
      {(actions) => (
        <div className="mobile-frame fixed inset-0 z-0 flex flex-col">
          <GoogleMapView />
          <HomeMapOverlay
            hasUnreadNotification={hasUnreadNotification}
            onOpenRecommendationSearch={handleOpenRecommendationSearch}
          />
          <HomeBottomSheet
            onOpenRecommendationSearch={handleOpenRecommendationSearch}
            onSelectedPlaceExpand={handleSelectedPlaceExpand}
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
                {...actions}
                scrollToDate={getConsumptionScrollDate(location.state)}
                scrollToConsumptionId={getConsumptionScrollId(location.state)}
                autoScrollToDate={false}
                renderRecordSticker={(consumptionId) => (
                  <ConsumptionSticker consumptionId={consumptionId} size="large" />
                )}
                contentBottomPaddingClassName="pb-28"
                headerContent={headerContent}
                headerContentGapClassName="mt-2"
                headerDescription="작성한 소비기록을 확인해보세요"
              />
            )}
          />
        </div>
      )}
    </ConsumptionRecordActions>
  );
}
