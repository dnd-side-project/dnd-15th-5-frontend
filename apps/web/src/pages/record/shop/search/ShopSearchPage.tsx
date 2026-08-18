import { useNavigate } from 'react-router-dom';

import { ShopSearch } from '@/features/shop';
import type { ShopSearchResult } from '@/features/shop';
import { ChevronLeftIcon } from '@/shared/assets/icons';

export default function ShopSearchPage() {
  const navigate = useNavigate();

  // TODO: 수기 입력 플로우 구현 시 선택한 장소를 전달하는 방식(router state vs 전역 상태) 확정 필요
  const handleSelectShop = (_shop: ShopSearchResult) => {
    navigate(-1);
  };

  return (
    <main>
      {/* TODO: 공통 헤더 컴포넌트 나오면 교체 */}
      <button type="button" onClick={() => navigate(-1)} aria-label="뒤로 가기" className="py-3">
        <ChevronLeftIcon className="size-6 text-neutral-700" aria-hidden="true" />
      </button>
      <ShopSearch onSelectShop={handleSelectShop} />
    </main>
  );
}
