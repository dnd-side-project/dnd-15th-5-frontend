import { useState } from 'react';

import { useShopSearchQuery } from '@/features/shop/apis/queries/useShopSearchQuery';

import ShopSearchInput from './ShopSearchInput';
import ShopSearchResultList from './ShopSearchResultList';

import type { ShopSearchResult } from '../types';

type ShopSearchProps = {
  onSelectShop: (shop: ShopSearchResult) => void;
};

/**
 * 장소 검색 화면의 본문. 검색어 상태를 관리하고 검색 결과를 렌더링한다.
 */
export default function ShopSearch({ onSelectShop }: ShopSearchProps) {
  const [keyword, setKeyword] = useState('');
  const { query, isLibraryLoading, isLibraryError } = useShopSearchQuery(keyword);
  const { data: shops, isFetching, isError, refetch } = query;

  const handleSearch = (nextKeyword: string) => {
    const trimmedNextKeyword = nextKeyword.trim();

    // 같은 검색어를 다시 제출하면 검색어 상태가 그대로여서 쿼리가 다시 실행되지 않으므로 직접 재요청한다
    if (trimmedNextKeyword.length > 0 && trimmedNextKeyword === keyword.trim()) {
      refetch();
      return;
    }

    setKeyword(nextKeyword);
  };

  return (
    <>
      <ShopSearchInput onSearch={handleSearch} />
      <ShopSearchResultList
        shops={shops ?? []}
        isLoading={isFetching || isLibraryLoading}
        isError={isError || isLibraryError}
        hasKeyword={keyword.trim().length > 0}
        onSelect={onSelectShop}
      />
    </>
  );
}
