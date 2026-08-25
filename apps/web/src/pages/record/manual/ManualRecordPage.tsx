import { useLocation, useNavigate } from 'react-router-dom';

import { ManualRecordForm } from '@/features/record';
import type { ShopSearchResult } from '@/features/shop';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import { PlaceCard } from '@/shared/ui/card';

type ManualRecordLocationState = {
  shop?: ShopSearchResult;
};

export default function ManualRecordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { shop } = (location.state as ManualRecordLocationState | null) ?? {};

  // TODO: 공통 모달·확인창 디자인 확정 후 기록 이탈 안내와 하단 선택 버튼 추가
  const handleBack = () => navigate(-1);

  return (
    <main>
      <ManualRecordForm
        selectedShop={
          shop ? (
            <PlaceCard thumbnailSrc={shop.photoUrl} title={shop.name} location={shop.address} />
          ) : null
        }
        onBack={handleBack}
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
