import { useNavigate } from 'react-router-dom';

import { useOpenVisitedPlaceOnMap } from '@/features/map';
import { VisitedPlaceSearch } from '@/features/shop';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import PageHeader from '@/shared/layout/PageHeader';

export default function MapSearchPage() {
  const navigate = useNavigate();
  const { openVisitedPlaceOnMap } = useOpenVisitedPlaceOnMap();

  const handleSelectPlace = async (placeId: string) => {
    await openVisitedPlaceOnMap(placeId, 'preserveZoom');
    navigate(ROUTE_PATHS.home);
  };

  return (
    <main className="flex min-h-full flex-col">
      <PageHeader onBack={() => navigate(-1)} backButtonClassName="left-0" />

      <div>
        <VisitedPlaceSearch onSelectPlace={(placeId) => void handleSelectPlace(placeId)} />
      </div>
    </main>
  );
}
