import { useNavigate } from 'react-router-dom';

import { useOpenVisitedPlaceOnMap } from '@/features/map';
import { VisitedPlaceSearch } from '@/features/shop';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import { BackButton } from '@/shared/ui/back-button';

export default function MapSearchPage() {
  const navigate = useNavigate();
  const { openVisitedPlaceOnMap } = useOpenVisitedPlaceOnMap();

  const handleSelectPlace = async (placeId: string) => {
    await openVisitedPlaceOnMap(placeId, 'preserveZoom');
    navigate(ROUTE_PATHS.home);
  };

  return (
    <main className="flex min-h-full flex-col">
      <BackButton onClick={() => navigate(-1)} />

      <div className="mt-4">
        <VisitedPlaceSearch onSelectPlace={(placeId) => void handleSelectPlace(placeId)} />
      </div>
    </main>
  );
}
