import { GoogleMapView, HomeBottomSheet } from '@/features/map';

export default function HomePage() {
  return (
    <div className="fixed top-0 right-0 bottom-0 left-0 z-0 mx-auto flex max-w-120 flex-col">
      <GoogleMapView />
      <HomeBottomSheet />
    </div>
  );
}
