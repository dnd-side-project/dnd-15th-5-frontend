import { useEffect, useState } from 'react';

import { useRecommendationLocationActions } from '@/features/map/hooks/useRecommendationLocationActions';
import { useLocationSelectionStore } from '@/features/map/stores/locationSelectionStore';
import { RecommendationLocationPinIcon } from '@/shared/assets/icons';
import { BottomSheet } from '@/shared/ui/bottom-sheet';
import { Button } from '@/shared/ui/button';

const LOCATION_HINT_DURATION_MS = 4_000;

type MapLocationSelectionOverlayProps = {
  onConfirm: () => void;
};

export default function MapLocationSelectionOverlay({
  onConfirm,
}: MapLocationSelectionOverlayProps) {
  const clearDraftSelection = useLocationSelectionStore((state) => state.clearDraftSelection);
  const draftSelection = useLocationSelectionStore((state) => state.draftSelection);
  const { confirmLocation, isSaving, hasSaveError } = useRecommendationLocationActions();
  const [showLocationHint, setShowLocationHint] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(
      () => setShowLocationHint(false),
      LOCATION_HINT_DURATION_MS
    );
    return () => window.clearTimeout(timeoutId);
  }, []);

  // 시스템 뒤로가기로 화면을 벗어날 때도 확정 전 좌표를 비웁니다.
  useEffect(() => clearDraftSelection, [clearDraftSelection]);

  const handleConfirmLocation = () => {
    const draft = useLocationSelectionStore.getState().draftSelection;
    if (draft?.status !== 'ready') {
      return;
    }

    confirmLocation(draft, onConfirm);
  };

  return (
    <section
      aria-label="위치 선택"
      className="pointer-events-none fixed inset-0 z-bottom-sheet mx-auto flex max-w-120 flex-col justify-end"
    >
      {/* 핀 끝을 지도 중심에 고정해 주소 조회 좌표와 일치시킵니다. */}
      <RecommendationLocationPinIcon
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 size-11 -translate-x-1/2 -translate-y-full text-primary-500 drop-shadow-map-selection-pin"
      />
      <BottomSheet
        snapPoint="medium"
        fitContent
        showHandle={false}
        contentClassName="pointer-events-auto flex flex-col gap-5 pt-6 pb-[calc(var(--spacing-page-bottom)+env(safe-area-inset-bottom))]"
      >
        {showLocationHint && (
          <p
            role="status"
            className="pointer-events-none absolute bottom-full left-1/2 mb-4 w-max max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-16 bg-neutral-600/80 px-7.5 py-4 text-center text-body-02-regular text-neutral-00"
          >
            지도를 움직여 원하는 동네를 선택해 주세요
          </p>
        )}
        <div className="flex items-center gap-2 px-2">
          <RecommendationLocationPinIcon
            aria-hidden="true"
            className="size-6 shrink-0 text-neutral-600"
          />
          <p
            aria-live="polite"
            className="min-w-0 truncate text-title-02-semibold text-neutral-700"
          >
            {draftSelection?.status === 'ready' ? draftSelection.address : '주소를 확인하고 있어요'}
          </p>
        </div>
        <Button
          type="button"
          disabled={draftSelection?.status !== 'ready'}
          isLoading={isSaving}
          onClick={handleConfirmLocation}
        >
          이 동네로 가게 추천
        </Button>
        {hasSaveError && (
          <p role="alert" className="text-body-02-regular text-neutral-600">
            동네를 저장하지 못했어요. 다시 시도해주세요.
          </p>
        )}
      </BottomSheet>
    </section>
  );
}
