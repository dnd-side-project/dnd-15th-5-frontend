import { useLocation, useNavigate } from 'react-router-dom';

import { ManualRecordForm } from '@/features/record';
import { PlaceCard } from '@/features/shop';
import type { ShopSearchResult } from '@/features/shop';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';

type ManualRecordLocationState = {
  shop?: ShopSearchResult;
};

export default function ManualRecordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { shop } = (location.state as ManualRecordLocationState | null) ?? {};

  return (
    <main>
      <ManualRecordForm
        selectedShop={
          shop ? (
            <PlaceCard thumbnailSrc={shop.photoUrl} title={shop.name} location={shop.address} />
          ) : null
        }
        onBack={() => navigate(-1)}
        onChangeShop={() => navigate(ROUTE_PATHS.recordShopSearch)}
        onSelectShop={() =>
          navigate(ROUTE_PATHS.recordShopSearch, {
            replace: true,
            state: { replacedManualRecord: true },
          })
        }
      />
    </main>
  );
}
