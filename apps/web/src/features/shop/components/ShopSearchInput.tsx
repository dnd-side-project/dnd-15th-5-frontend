import { useEffect, useRef, useState } from 'react';

import { SearchIcon } from '@/shared/assets/icons';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';

import { SHOP_SEARCH_DEBOUNCE_MS } from '../constants';

import type { FormEvent } from 'react';

type ShopSearchInputProps = {
  onSearch: (keyword: string) => void;
};

/**
 * 장소 검색어 입력창.
 *
 * 입력이 멈추면 잠시 후 자동으로 `onSearch`를 호출한다. 기다리지 않고 바로 검색하려면
 * 엔터 또는 검색 버튼으로 제출한다.
 */
export default function ShopSearchInput({ onSearch }: ShopSearchInputProps) {
  const [keyword, setKeyword] = useState('');
  const debouncedKeyword = useDebouncedValue(keyword, SHOP_SEARCH_DEBOUNCE_MS);

  // NOTE: onSearch를 effect 의존성에 그대로 넣으면, onSearch가 새로 리렌더될 때마다(예: 검색
  // 결과가 바뀌어 부모가 다시 렌더될 때) 같은 키워드로 다시 호출돼 불필요한 재요청을 만든다.
  // ref로 최신 콜백만 읽어서 debouncedKeyword가 실제로 바뀔 때만 호출한다.
  const onSearchRef = useRef(onSearch);
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  useEffect(() => {
    onSearchRef.current(debouncedKeyword);
  }, [debouncedKeyword]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(keyword);
  };

  return (
    <form
      role="search"
      onSubmit={handleSearchSubmit}
      className="flex min-h-14 items-center gap-2 rounded-08 bg-neutral-50 px-4 focus-within:ring-2 focus-within:ring-primary-300"
    >
      <input
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        placeholder="장소를 검색해주세요"
        className="min-w-0 flex-1 bg-transparent text-body-01-regular text-neutral-700 outline-none placeholder:text-neutral-500"
      />
      <button
        type="submit"
        aria-label="검색"
        className="flex size-6 shrink-0 items-center justify-center"
      >
        <SearchIcon className="size-6 text-neutral-500" aria-hidden="true" />
      </button>
    </form>
  );
}
