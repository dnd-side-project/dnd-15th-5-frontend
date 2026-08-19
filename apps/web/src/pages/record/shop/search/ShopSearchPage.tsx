import { useLocation, useNavigate } from 'react-router-dom';

import type { ShopSearchLocationState } from '@/features/record';
import { ShopSearch } from '@/features/shop';
import type { ShopSearchResult } from '@/features/shop';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import { BackButton } from '@/shared/ui/back-button';

export default function ShopSearchPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSelectShop = (shop: ShopSearchResult) => {
    navigate(ROUTE_PATHS.manualRecord, { state: { shop } });
  };

  const handleBack = () => {
    const state = location.state as ShopSearchLocationState | null;

    // 가게 미선택 상태의 수기 입력 화면에서 교체 이동(replace)해온 경우에만 돌아갈
    // 히스토리가 없다. 그 외에는 전부 일반 이동이라 navigate(-1)이 항상 맞는 위치로 돌아간다.
    if (state?.replacedManualRecord) {
      navigate(ROUTE_PATHS.record, { replace: true });
      return;
    }

    navigate(-1);
  };

  return (
    <main className="flex min-h-full flex-col">
      <BackButton onClick={handleBack} />

      <div className="mt-4">
        <ShopSearch onSelectShop={handleSelectShop} />
      </div>
    </main>
  );
}
