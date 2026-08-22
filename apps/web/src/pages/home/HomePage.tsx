import { GoogleMapView, HomeBottomSheet } from '@/features/map';
import { SpendingHistory } from '@/features/report';

export default function HomePage() {
  return (
    <div className="mobile-frame fixed inset-0 z-0 flex flex-col">
      <GoogleMapView />
      <HomeBottomSheet
        renderSpendingHistory={(headerContent) => (
          <SpendingHistory headerContent={headerContent} headerContentGapClassName="mt-4" />
        )}
      />
    </div>
  );
}
