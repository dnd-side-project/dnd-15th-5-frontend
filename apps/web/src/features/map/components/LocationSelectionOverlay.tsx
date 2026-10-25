import { useHomeBottomSheetStore } from '@/features/map/stores/homeBottomSheetStore';
import { useLocationSelectionStore } from '@/features/map/stores/locationSelectionStore';

/** 가게 추천 버튼에서 진입하는 위치 선택 화면의 기본 UI입니다. */
export default function LocationSelectionOverlay() {
  const showRecommendation = useHomeBottomSheetStore((state) => state.showRecommendation);
  const selectedPosition = useLocationSelectionStore((state) => state.selectedPosition);
  const confirmSelectedPosition = useLocationSelectionStore(
    (state) => state.confirmSelectedPosition
  );

  const handleConfirmLocation = () => {
    if (!selectedPosition) {
      return;
    }

    confirmSelectedPosition();
    showRecommendation();
  };

  return (
    <section
      aria-label="위치 선택"
      className="pointer-events-none fixed inset-0 z-20 mx-auto flex max-w-120 flex-col justify-end"
    >
      <div className="pointer-events-auto mx-4 mb-[calc(env(safe-area-inset-bottom)+1rem)] rounded-16 bg-neutral-00 p-4 shadow-lg">
        <p className="text-body-02-medium text-neutral-700">
          {selectedPosition
            ? '선택한 위치로 가게를 추천해드릴게요'
            : '지도에서 원하는 위치를 눌러주세요'}
        </p>
        <button
          type="button"
          disabled={!selectedPosition}
          onClick={handleConfirmLocation}
          className="mt-3 flex h-12 w-full items-center justify-center rounded-12 bg-primary-500 text-body-01-semibold text-neutral-00 disabled:cursor-not-allowed disabled:bg-neutral-200"
        >
          위치 확정
        </button>
      </div>
    </section>
  );
}
