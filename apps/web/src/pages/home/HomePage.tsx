import { GoogleMapView, HomeBottomSheet, HomeMapOverlay } from '@/features/map';

export default function HomePage() {
  return (
    <div className="fixed inset-0 z-0 mx-auto flex max-w-120 flex-col">
      <GoogleMapView />
      <HomeMapOverlay />
      <HomeBottomSheet />
    </div>
  );
}
