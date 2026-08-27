import { useCallback } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import {
  GoogleMapView,
  HomeBottomSheet,
  HomeMapOverlay,
  parseCreatedConsumptionPlace,
  useCreatedConsumptionResult,
} from '@/features/map';
import { useHasUnreadNotificationQuery } from '@/features/notification';
import { FrequentShopSummary, SpendingHistory } from '@/features/report';
import { SelectedPlaceSheet } from '@/features/shop';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';

import type { CreatedConsumptionPlace } from '@chapchap/shared/record';

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { hasUnreadNotification } = useHasUnreadNotificationQuery();
  const createdPlace =
    (location.state as { createdPlace?: CreatedConsumptionPlace } | null)?.createdPlace ??
    parseCreatedConsumptionPlace(searchParams);
  const handleCreatedConsumptionResult = useCallback(() => {
    navigate(ROUTE_PATHS.home, { replace: true, state: null });
  }, [navigate]);

  useCreatedConsumptionResult({
    createdPlace,
    onHandled: handleCreatedConsumptionResult,
  });

  return (
    <div className="mobile-frame fixed inset-0 z-0 flex flex-col">
      <GoogleMapView />
      <HomeMapOverlay hasUnreadNotification={hasUnreadNotification} />
      <HomeBottomSheet
        renderFrequentShops={(headerContent) => (
          <FrequentShopSummary headerContent={headerContent} />
        )}
        renderSelectedPlace={(placeId) => <SelectedPlaceSheet placeId={placeId} />}
        renderSpendingHistory={(headerContent) => (
          <SpendingHistory
            headerContent={headerContent}
            headerContentGapClassName="mt-4"
            headerDescription="이번달 작성한 소비기록을 확인해보세요"
          />
        )}
      />
    </div>
  );
}
