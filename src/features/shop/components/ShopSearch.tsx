import { useState } from 'react';

import { useShopSearchQuery } from '../api';

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
  const { data: shops, isFetching, isError } = useShopSearchQuery(keyword);

  return (
    <>
      <ShopSearchInput onSearch={setKeyword} />
      <ShopSearchResultList
        shops={shops ?? []}
        isLoading={isFetching}
        isError={isError}
        hasKeyword={keyword.trim().length > 0}
        onSelect={onSelectShop}
      />
    </>
  );
}
