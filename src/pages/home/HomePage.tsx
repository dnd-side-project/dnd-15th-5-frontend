import { GoogleMapView } from '@/features/map';
import MobileLayout from '@/shared/layout/MobileLayout';

export default function HomePage() {
  return (
    <MobileLayout noPadding>
      <div className="h-screen w-full">
        <GoogleMapView />
      </div>
    </MobileLayout>
  );
}
