import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { MOCK_MAP_STICKERS, useHomeBottomSheetStore, useMapFocusStore } from '@/features/map';
import { createMockShopDetailData, ShopDetail } from '@/features/shop';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import { BackButton } from '@/shared/ui/back-button';

export default function ShopDetailPage() {
  const navigate = useNavigate();
  const { shopId } = useParams();
  const placeId = Number(shopId);
  const showHome = useHomeBottomSheetStore((state) => state.showHome);
  const showSelectedPlace = useHomeBottomSheetStore((state) => state.showSelectedPlace);
  const setSelectedPlaceFocus = useMapFocusStore((state) => state.setSelectedPlaceFocus);
  const selectedMapSticker = useMemo(
    () => MOCK_MAP_STICKERS.find((item) => item.place.id === shopId),
    [shopId]
  );
  const mockData = useMemo(() => {
    return selectedMapSticker ? createMockShopDetailData(selectedMapSticker) : undefined;
  }, [selectedMapSticker]);

  const handleViewOnMap = () => {
    if (selectedMapSticker) {
      showSelectedPlace(selectedMapSticker.id);
      setSelectedPlaceFocus(selectedMapSticker.position);
    } else {
      showHome();
    }

    navigate(ROUTE_PATHS.home);
  };

  return (
    <main>
      <ShopDetail
        placeId={placeId}
        mockData={mockData}
        onViewOnMap={handleViewOnMap}
        headerContent={<BackButton onClick={() => navigate(-1)} />}
      />
    </main>
  );
}
