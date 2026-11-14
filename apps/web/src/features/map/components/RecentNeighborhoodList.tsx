import type { RecentNeighborhood } from '@/features/map/apis/hooks/useRecentNeighborhoods';
import { useLocationSelectionStore } from '@/features/map/stores/locationSelectionStore';
import { CloseIcon, LocationPinOutlineIcon } from '@/shared/assets/icons';
import { Spinner } from '@/shared/ui/spinner';

type RecentNeighborhoodListProps = {
  neighborhoods: RecentNeighborhood[];
  isLoading: boolean;
  hasError: boolean;
  isSelecting: boolean;
  removingId: number | undefined;
  onSelect: (neighborhood: RecentNeighborhood) => void;
  onRemove: (id: number) => void;
};

export default function RecentNeighborhoodList({
  neighborhoods,
  isLoading,
  hasError,
  isSelecting,
  removingId,
  onSelect,
  onRemove,
}: RecentNeighborhoodListProps) {
  const position = useLocationSelectionStore((state) => state.confirmedPosition);
  const address = useLocationSelectionStore((state) => state.confirmedAddress);
  const confirmedId = useLocationSelectionStore((state) => state.confirmedNeighborhoodId);
  const currentNeighborhood = position
    ? (neighborhoods.find((town) => town.id === confirmedId) ??
      neighborhoods.find(
        (town) =>
          town.position.lat === position.lat &&
          town.position.lng === position.lng &&
          (!address || town.address === address)
      ))
    : neighborhoods[0];

  return (
    <>
      <h1 className="mt-8 text-body-01-semibold text-neutral-700">최근 설정한 동네</h1>
      {isLoading && (
        <div
          role="status"
          aria-label="최근 동네 불러오는 중"
          className="flex justify-center pt-8 pb-4"
        >
          <Spinner className="size-4 text-neutral-500" />
        </div>
      )}
      {hasError && (
        <p role="alert" className="mt-4 text-body-02-regular text-neutral-600">
          최근 동네 목록을 갱신하지 못했어요.
        </p>
      )}
      {neighborhoods.length > 0 && (
        <ul className="mt-3 pr-4">
          {neighborhoods.map((neighborhood) => (
            <li
              key={neighborhood.id}
              className="flex min-h-16.5 items-center gap-2.5 border-b border-neutral-100 last:border-0"
            >
              <span aria-hidden="true" className="flex size-5 shrink-0 items-center justify-center">
                <LocationPinOutlineIcon />
              </span>
              <button
                type="button"
                className="min-w-0 flex-1 truncate py-4 text-left text-body-01-semibold text-neutral-700"
                disabled={isSelecting || removingId === neighborhood.id}
                onClick={() => onSelect(neighborhood)}
              >
                {neighborhood.address}
                {currentNeighborhood?.id === neighborhood.id && (
                  <span className="ml-2 text-label-01-medium text-primary-500">
                    현재 설정된 동네
                  </span>
                )}
              </button>
              <button
                type="button"
                aria-label={`${neighborhood.address} 최근 동네에서 삭제`}
                className="flex size-6 shrink-0 items-center justify-center text-neutral-400"
                disabled={isSelecting || removingId !== undefined}
                onClick={() => onRemove(neighborhood.id)}
              >
                <CloseIcon aria-hidden="true" className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {!isLoading && !hasError && neighborhoods.length === 0 && (
        <p className="mt-4 text-body-02-regular text-neutral-400">선택한 동네가 여기에 표시돼요</p>
      )}
    </>
  );
}
