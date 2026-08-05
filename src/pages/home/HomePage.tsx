import { GoogleMapView } from '@/features/map';

export default function HomePage() {
  return (
    <div className="relative h-screen w-full">
      <h1 className="absolute top-4 left-1/2 z-10 -translate-x-1/2 rounded bg-white px-3 py-2">
        지도 홈 페이지
      </h1>
      <GoogleMapView />
    </div>
  );
}
