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

  const focusThisShopOnMap = async () => {
    if (!shopId) return;
    await openVisitedPlaceOnMap(shopId);
  };

  const handleViewOnMap = async () => {
    await focusThisShopOnMap();
    navigate(ROUTE_PATHS.home);
  };

  const handleBack = async () => {
    // NOTE: 뒤로 가기로 홈에 돌아왔을 때도 이 매장의 바텀시트가 뜨므로, 지도 포커스도 함께 맞춘다.
    // 되돌아갈 히스토리가 없어 홈으로 직접 이동하는 경우도 마찬가지다.
    await focusThisShopOnMap();

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
        headerContent={<BackButton onClick={() => void handleBack()} />}
      />
    </main>
  );
}
