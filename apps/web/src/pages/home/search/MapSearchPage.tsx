import { useNavigate } from 'react-router-dom';

import { RecordedPlaceSearch } from '@/features/map';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import { BackButton } from '@/shared/ui/back-button';

export default function MapSearchPage() {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-full flex-col">
      <BackButton onClick={() => navigate(-1)} />

      <div className="mt-4">
        <RecordedPlaceSearch onSelectPlace={() => navigate(ROUTE_PATHS.home)} />
      </div>
    </main>
  );
}
