import { GoogleMapView, HomeBottomSheet, HomeMapOverlay } from '@/features/map';
import { FrequentShopSummary, SpendingHistory } from '@/features/report';

export default function HomePage() {
  return (
    <div className="mobile-frame fixed inset-0 z-0 flex flex-col">
      <GoogleMapView />
      <HomeMapOverlay />
      <HomeBottomSheet
        renderFrequentShops={(headerContent) => (
          <FrequentShopSummary headerContent={headerContent} />
        )}
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
