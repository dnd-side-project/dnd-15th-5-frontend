import { useState } from 'react';

import { useSearchTowns } from '@/features/map/apis/queries';

type NeighborhoodResult = {
  address: string;
  id: string;
};

export type NeighborhoodSearchState =
  { status: 'idle' | 'loading' | 'error' } | { status: 'success'; results: NeighborhoodResult[] };

/** 검색어별로 백엔드의 행정동 검색 결과를 조회합니다. */
export const useNeighborhoodSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const query = useSearchTowns({ keyword: searchTerm }, { query: { enabled: !!searchTerm } });

  const searchNeighborhoods = (keyword: string) => {
    const normalizedKeyword = keyword.trim();
    if (normalizedKeyword && normalizedKeyword === searchTerm) {
      void query.refetch();
      return;
    }
    setSearchTerm(normalizedKeyword);
  };

  let searchState: NeighborhoodSearchState = { status: 'idle' };
  if (searchTerm) {
    if (query.isPending) {
      searchState = { status: 'loading' };
    } else if (query.isError) {
      searchState = { status: 'error' };
    } else {
      const results = (query.data?.data?.towns ?? []).flatMap((town) => {
        const id = town.administrativeDongCode;
        const address =
          town.fullName?.trim() ||
          [town.sidoName, town.sigunguName, town.dongName].filter(Boolean).join(' ');

        return id && address ? [{ id, address }] : [];
      });
      searchState = { status: 'success', results };
    }
  }

  return { searchTerm, searchState, searchNeighborhoods };
};
