import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  NeighborhoodSearchResults,
  RecentNeighborhoodList,
  useNeighborhoodSearch,
  useRecentNeighborhoods,
  useRecommendationLocationActions,
} from '@/features/map';
import type { NeighborhoodResult } from '@/features/map';
import { RecommendationLocationPinIcon } from '@/shared/assets/icons';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import PageHeader from '@/shared/layout/PageHeader';
import { PlaceSearchInput } from '@/shared/ui/place-search';

export default function RecommendationLocationSearchPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const fromHome = state === 'home';

  const { confirmLocation, resetSelection } = useRecommendationLocationActions();
  const { recentNeighborhoods, addRecentNeighborhood, removeRecentNeighborhood } =
    useRecentNeighborhoods();
  const { searchTerm, searchState, searchNeighborhoods } = useNeighborhoodSearch();
  const [appliedKeyword, setAppliedKeyword] = useState<{ keyword: string }>();

  const handleReturnHome = () => {
    if (fromHome) {
      navigate(-1);
    } else {
      navigate(ROUTE_PATHS.home, { replace: true });
    }
  };

  const handleOpenMap = () => {
    resetSelection();
    navigate(ROUTE_PATHS.homeRecommendationMap, {
      state: fromHome ? 'homeThroughSearch' : 'search',
    });
  };

  const handleClose = () => {
    resetSelection();
    handleReturnHome();
  };

  const handleSelectNeighborhood = ({ address, position }: NeighborhoodResult) => {
    addRecentNeighborhood(address);
    confirmLocation(position);
    handleReturnHome();
  };

  return (
    <main className="mobile-frame fixed inset-0 z-30 mx-auto flex max-w-120 flex-col bg-neutral-00 px-4 pt-[env(safe-area-inset-top)]">
      <PageHeader onBack={handleClose} />
      <PlaceSearchInput
        placeholder="동네를 검색해주세요"
        onSearch={searchNeighborhoods}
        appliedKeyword={appliedKeyword}
        inputClassName="text-body-01-semibold placeholder:font-normal"
        searchIconClassName="size-7.5 text-neutral-500"
      />

      <section className="min-h-0 flex-1 overflow-y-auto" aria-live="polite">
        {!searchTerm ? (
          <RecentNeighborhoodList
            neighborhoods={recentNeighborhoods}
            onSelect={(address) => setAppliedKeyword({ keyword: address })}
            onRemove={removeRecentNeighborhood}
          />
        ) : (
          <NeighborhoodSearchResults
            searchTerm={searchTerm}
            searchState={searchState}
            onSelect={handleSelectNeighborhood}
          />
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
