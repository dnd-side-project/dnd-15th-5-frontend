import { useLocation, useNavigate } from 'react-router-dom';

import {
  GoogleMapView,
  MapLocationSelectionOverlay,
  useRecommendationLocationActions,
} from '@/features/map';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import PageHeader from '@/shared/layout/PageHeader';

export default function RecommendationLocationMapPage() {
  const navigate = useNavigate();
  const { resetSelection } = useRecommendationLocationActions();
  const { state: entry } = useLocation();

  const handleBackToSearch = () => {
    resetSelection();
    if (entry === 'search' || entry === 'homeThroughSearch') {
      navigate(-1);
    } else {
      navigate(ROUTE_PATHS.homeRecommendationSearch, { replace: true });
    }
  };

  const handleReturnHome = () => {
    if (entry === 'homeThroughSearch') {
      // 홈에서 동네 검색과 지도 선택을 차례로 열었으므로 두 단계를 돌아갑니다.
      navigate(-2);
    } else {
      navigate(ROUTE_PATHS.home, { replace: true });
    }
  };

  return (
    <main className="mobile-frame fixed inset-0 z-0 flex flex-col">
      <GoogleMapView isSelectingLocation />
      <PageHeader
        onBack={handleBackToSearch}
        backButtonLabel="동네 검색으로 돌아가기"
        className="pointer-events-none absolute inset-x-4 top-[env(safe-area-inset-top)] z-20"
        backButtonClassName="pointer-events-auto"
      />
      <MapLocationSelectionOverlay onConfirm={handleReturnHome} />
    </main>
  );
}
