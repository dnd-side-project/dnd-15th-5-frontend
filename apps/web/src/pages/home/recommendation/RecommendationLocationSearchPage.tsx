import { useLocation, useNavigate } from 'react-router-dom';

import {
  NeighborhoodSearchResults,
  RecentNeighborhoodList,
  useLocationSelectionStore,
  useNeighborhoodSearch,
  useRecentNeighborhoods,
  useRecommendationLocationActions,
  useResolveNeighborhoodPosition,
} from '@/features/map';
import { RecommendationLocationPinIcon } from '@/shared/assets/icons';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import PageHeader from '@/shared/layout/page-header';
import { PlaceSearchInput } from '@/shared/ui/place-search';

export default function RecommendationLocationSearchPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const fromHome = state === 'home';

  const { confirmLocation, isSaving, hasSaveError } = useRecommendationLocationActions();
  const {
    recentNeighborhoods,
    isLoading: isLoadingRecent,
    hasError: hasRecentError,
    removingId,
    removeRecentNeighborhood,
  } = useRecentNeighborhoods();
  const clearDraftSelection = useLocationSelectionStore((state) => state.clearDraftSelection);
  const { searchTerm, searchState, searchNeighborhoods } = useNeighborhoodSearch();
  const {
    mutate: resolvePosition,
    reset: resetPositionLookup,
    isPending: isResolvingPosition,
    isError: hasPositionError,
  } = useResolveNeighborhoodPosition();

  const handleReturnHome = () => {
    if (fromHome) {
      navigate(-1);
    } else {
      navigate(ROUTE_PATHS.home, { replace: true });
    }
  };

  const handleOpenMap = () => {
    clearDraftSelection();
    navigate(ROUTE_PATHS.homeRecommendationMap, {
      state: fromHome ? 'homeThroughSearch' : 'search',
    });
  };

  const handleClose = () => {
    clearDraftSelection();
    handleReturnHome();
  };

  const handleSearch = (keyword: string) => {
    resetPositionLookup();
    searchNeighborhoods(keyword);
  };

  const handleSelectNeighborhood = (address: string, administrativeDongCode: string) => {
    resolvePosition(address, {
      onSuccess: (position) => {
        confirmLocation({ address, administrativeDongCode, position }, handleReturnHome);
      },
    });
  };

  return (
    <main className="mobile-frame fixed inset-0 mx-auto flex max-w-120 flex-col bg-neutral-00 px-4 pt-[env(safe-area-inset-top)]">
      <PageHeader onBack={handleClose} />
      <PlaceSearchInput
        placeholder="동네를 검색해주세요"
        onSearch={handleSearch}
        inputClassName="text-body-01-semibold placeholder:font-normal"
        searchIconClassName="size-7.5 text-neutral-500"
      />

      <section
        className="min-h-0 flex-1 overflow-y-auto"
        aria-live="polite"
        aria-busy={
          (searchTerm ? searchState.status === 'loading' : isLoadingRecent) || isResolvingPosition
        }
      >
        {!searchTerm ? (
          <RecentNeighborhoodList
            neighborhoods={recentNeighborhoods}
            isLoading={isLoadingRecent}
            hasError={hasRecentError}
            isSelecting={isSaving}
            removingId={removingId}
            onSelect={(neighborhood) => confirmLocation(neighborhood, handleReturnHome)}
            onRemove={removeRecentNeighborhood}
          />
        ) : (
          <NeighborhoodSearchResults
            searchTerm={searchTerm}
            searchState={searchState}
            isSelecting={isResolvingPosition || isSaving}
            onSelect={handleSelectNeighborhood}
          />
        )}
        {hasPositionError && (
          <p className="text-center text-body-02-regular text-neutral-500">
            동네 위치를 확인하지 못했어요. 다시 선택하거나 지도로 찾아보세요.
          </p>
        )}
        {hasSaveError && (
          <p role="alert" className="text-center text-body-02-regular text-neutral-600">
            동네를 저장하지 못했어요. 다시 선택해주세요.
          </p>
        )}
      </section>

      <footer className="flex shrink-0 justify-center pt-3 pb-[max(2.625rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={handleOpenMap}
          className="flex h-12 items-center gap-1.5 rounded-32 bg-primary-50 pr-5 pl-4 text-body-01-medium text-neutral-700"
        >
          <RecommendationLocationPinIcon aria-hidden="true" className="size-5 text-primary-400" />
          지도로 찾기
        </button>
      </footer>
    </main>
  );
}
