import type { NeighborhoodSearchState } from '@/features/map/apis/hooks/useNeighborhoodSearch';

type NeighborhoodSearchResultsProps = {
  searchTerm: string;
  searchState: NeighborhoodSearchState;
  isSelecting: boolean;
  onSelect: (address: string, administrativeDongCode: string) => void;
};

const renderMatchedNeighborhood = (address: string, keyword: string) => {
  const matchStart = address.indexOf(keyword);
  if (!keyword || matchStart === -1) return address;

  const matchEnd = matchStart + keyword.length;
  return (
    <>
      {address.slice(0, matchStart)}
      <span className="text-primary-500">{address.slice(matchStart, matchEnd)}</span>
      {address.slice(matchEnd)}
    </>
  );
};

export default function NeighborhoodSearchResults({
  searchTerm,
  searchState,
  isSelecting,
  onSelect,
}: NeighborhoodSearchResultsProps) {
  return (
    <ul className="flex flex-col gap-4 py-8">
      {searchState.status === 'error' && (
        <li className="py-3 text-body-02-regular text-neutral-400">
          동네를 검색하지 못했어요. 다시 시도해주세요.
        </li>
      )}
      {searchState.status === 'success' && searchState.results.length === 0 && (
        <li className="flex flex-col gap-2 py-3 text-center text-body-02-regular text-neutral-500">
          <p className="text-body-02-medium">검색 결과가 없어요</p>
          <p>동네 이름을 다시 입력하거나 지도로 찾아보세요.</p>
        </li>
      )}
      {searchState.status === 'success' &&
        searchState.results.map((result) => (
          <li key={result.id}>
            <button
              type="button"
              disabled={isSelecting}
              className="block w-full text-left text-body-01-medium leading-6 text-neutral-700"
              onClick={() => onSelect(result.address, result.id)}
            >
              {renderMatchedNeighborhood(result.address, searchTerm)}
            </button>
          </li>
        ))}
    </ul>
  );
}
