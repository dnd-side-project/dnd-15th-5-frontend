import { Spinner } from '@/shared/ui/spinner';

import StickerReveal from './StickerReveal';

type StickerGenerationStageProps = {
  original: string;
  sticker?: string;
  isProcessing: boolean;
  message: string;
  isPaused?: boolean;
  onRevealComplete?: () => void;
  onRevealError: () => void;
};

/**
 * 원본 사진 위에 스티커 생성 진행 상태와 결과 모션을 표시합니다.
 *
 * 가져온 사진은 이 화면만 단독으로 사용하며, 버튼 없이 모션 완료·실패를 상위에 알립니다.
 */
export default function StickerGenerationStage({
  original,
  sticker,
  isProcessing,
  message,
  isPaused,
  onRevealComplete,
  onRevealError,
}: StickerGenerationStageProps) {
  return (
    <section
      aria-label="스티커 생성"
      className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden"
    >
      {original && (
        <img
          src={original}
          alt="선택한 원본 사진"
          className="absolute inset-0 size-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-neutral-900/60" />
      {sticker && (
        <StickerReveal
          src={sticker}
          isPaused={isPaused || isProcessing}
          onComplete={onRevealComplete}
          onError={onRevealError}
        />
      )}
      {isProcessing && (
        <div
          role="status"
          aria-label="스티커 생성 중"
          className="relative flex flex-col items-center gap-5 px-8 text-center"
        >
          <Spinner className="size-8 motion-reduce:animate-none" />
          <p>{message}</p>
        </div>
      )}
    </section>
  );
}
