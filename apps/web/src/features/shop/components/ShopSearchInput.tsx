import { useState } from 'react';

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
        {/* TODO: 아이콘 시스템 세팅되면 shared/assets의 ic-search.svg로 교체 */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="16.5" y1="16.5" x2="21" y2="21" strokeLinecap="round" />
        </svg>
      </button>
    </form>
  );
}
