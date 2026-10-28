import { useNavigate } from 'react-router-dom';

import LikedPlacesList from '@/features/map/components/liked-places/LikedPlacesList';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';

export default function LikedPlacesPage() {
  const navigate = useNavigate();
  const handleBack = () => {
    const historyIndex = window.history.state?.idx;

    if (typeof historyIndex === 'number' && historyIndex > 0) {
      navigate(-1);
      return;
    }

    navigate(ROUTE_PATHS.myPage, { replace: true });
  };

  return <LikedPlacesList onBack={handleBack} />;
}
