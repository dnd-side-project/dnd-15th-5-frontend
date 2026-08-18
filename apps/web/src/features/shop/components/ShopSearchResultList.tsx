import ShopSearchResultItem from './ShopSearchResultItem';

import type { ShopSearchResult } from '../types';

type ShopSearchResultListProps = {
  shops: ShopSearchResult[];
  isLoading: boolean;
  isError: boolean;
  hasKeyword: boolean;
  onSelect: (shop: ShopSearchResult) => void;
};

/**
 * 장소 검색 결과 목록.
 *
 * 검색어가 없으면 아무것도 렌더링하지 않고, 로딩·에러·빈 결과 상태를 내부에서 처리한다.
 */
export default function ShopSearchResultList({
  shops,
  isLoading,
  isError,
  hasKeyword,
  onSelect,
}: ShopSearchResultListProps) {
  // TODO: 디자인 확정되면 로딩·에러·빈 상태 UI 교체
  if (!hasKeyword) {
    return null;
  }

  if (isLoading) {
    return <p className="py-6 text-center text-body-02-regular text-neutral-500">검색 중...</p>;
  }

  if (isError) {
    return (
      <p className="py-6 text-center text-body-02-regular text-neutral-500">검색에 실패했습니다</p>
    );
  }

  if (shops.length === 0) {
    return (
      <p className="py-6 text-center text-body-02-regular text-neutral-500">검색 결과가 없습니다</p>
    );
  }

  return (
    <ul>
      {shops.map((shop) => (
        <ShopSearchResultItem key={shop.id} shop={shop} onSelect={onSelect} />
      ))}
    </ul>
  );
}
