import { useNavigate } from 'react-router-dom';

import { ShopSearch } from '@/features/shop';
import type { ShopSearchResult } from '@/features/shop';

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
        {/* TODO: 아이콘 시스템 세팅되면 shared/assets의 ic-arrow-left.svg로 교체 */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <ShopSearch onSelectShop={handleSelectShop} />
    </main>
  );
}
