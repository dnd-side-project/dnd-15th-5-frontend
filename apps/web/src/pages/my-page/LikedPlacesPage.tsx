import { useNavigate } from 'react-router-dom';

import LikedPlacesList from '@/features/map/components/liked-places/LikedPlacesList';

export default function LikedPlacesPage() {
  const navigate = useNavigate();

  return <LikedPlacesList onBack={() => navigate(-1)} />;
}
