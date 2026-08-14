import { useState } from 'react';

import { SearchIcon } from '@/shared/assets/icons';

import type { FormEvent } from 'react';

type ShopSearchInputProps = {
  onSearch: (keyword: string) => void;
};

/**
 * 장소 검색어 입력창.
 *
 * 입력 중에는 검색하지 않고, 엔터 또는 검색 버튼으로 제출할 때만 `onSearch`를 호출한다.
 */
export default function ShopSearchInput({ onSearch }: ShopSearchInputProps) {
  const [keyword, setKeyword] = useState('');

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(keyword);
  };

  return (
    // TODO: 디자인 확정되면 스타일 수정
    <form
      onSubmit={handleSearchSubmit}
      className="flex items-center gap-2 bg-neutral-100 px-4 py-3"
    >
      <input
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        placeholder="장소를 검색해주세요"
        className="min-w-0 flex-1 bg-transparent"
      />
      <button type="submit" aria-label="검색">
        <SearchIcon className="size-6 text-neutral-500" aria-hidden="true" />
      </button>
    </form>
  );
}
