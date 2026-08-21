import { GoogleMapView, HomeBottomSheet } from '@/features/map';

export default function HomePage() {
  return (
    <div className="mobile-frame fixed inset-0 z-0 flex flex-col">
      <GoogleMapView />
      <HomeBottomSheet />
    </div>
  );
}
