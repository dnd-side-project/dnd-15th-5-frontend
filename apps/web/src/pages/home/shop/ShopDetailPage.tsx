import { useNavigate, useParams } from 'react-router-dom';

import { useOpenVisitedPlaceOnMap } from '@/features/map';
import { ShopDetail } from '@/features/shop';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import { BackButton } from '@/shared/ui/back-button';

export default function ShopDetailPage() {
  const navigate = useNavigate();
  const { shopId } = useParams();
  const placeId = Number(shopId);
  const { openVisitedPlaceOnMap } = useOpenVisitedPlaceOnMap();

  const handleViewOnMap = async () => {
    if (!shopId) return;
    await openVisitedPlaceOnMap(shopId);
    navigate(ROUTE_PATHS.home);
  };

  const handleBack = () => {
    const historyIndex = window.history.state?.idx;
    if (typeof historyIndex === 'number' && historyIndex > 0) {
      navigate(-1);
      return;
    }

    navigate(ROUTE_PATHS.home, { replace: true });
  };

  return (
    <main>
      <ShopDetail
        placeId={placeId}
        onViewOnMap={() => void handleViewOnMap()}
        headerContent={<BackButton onClick={handleBack} />}
      />
    </main>
  );
}
