import { useEffect, useRef, useState } from 'react';

import { useConsumptionStickerQuery } from '@/features/record/apis/hooks/useConsumptionStickerQuery';
import { cn } from '@/shared/lib/cn';

const MAX_IMAGE_RECOVERY_ATTEMPTS = 1;
const STICKER_PREFETCH_MARGIN = '120px 0px';

type ConsumptionStickerProps = {
  consumptionId: number;
  size?: 'default' | 'large';
};

/** 방문 기록에 사용한 사진·기본 스티커를 투명 배경과 원래 비율로 표시합니다. */
function ConsumptionStickerImage({ consumptionId, size = 'default' }: ConsumptionStickerProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(() => typeof IntersectionObserver === 'undefined');
  const {
    data: image,
    dataUpdatedAt,
    isPending,
    refetch,
  } = useConsumptionStickerQuery(consumptionId, isVisible);
  const [failedImage, setFailedImage] = useState<{ url: string; updatedAt: number } | null>(null);
  const [isRecovering, setIsRecovering] = useState(false);
  const [imageAttempt, setImageAttempt] = useState(0);
  const retryCount = useRef(0);
  useEffect(() => {
    if (isVisible || !containerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: STICKER_PREFETCH_MARGIN }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isVisible]);

  const handleImageError = async () => {
    if (!image || isRecovering) return;
    if (retryCount.current >= MAX_IMAGE_RECOVERY_ATTEMPTS) {
      setFailedImage({ url: image, updatedAt: dataUpdatedAt });
      return;
    }
    retryCount.current += 1;
    setIsRecovering(true);
    try {
      const refreshed = await refetch();
      if (refreshed.isError) setFailedImage({ url: image, updatedAt: refreshed.dataUpdatedAt });
      // NOTE: 같은 URL이 반환돼도 img를 다시 마운트해 일시적인 로딩 실패를 한 번 복구합니다.
      setImageAttempt((attempt) => attempt + 1);
    } finally {
      setIsRecovering(false);
    }
  };

  return (
    <span
      ref={containerRef}
      className={cn('inline-flex shrink-0', size === 'large' ? 'size-13' : 'size-10')}
    >
      {isPending || isRecovering ? (
        <span
          role="status"
          aria-label="스티커 불러오는 중"
          className="size-full shrink-0 animate-pulse rounded-08 bg-neutral-100 motion-reduce:animate-none"
        />
      ) : !image || (image === failedImage?.url && dataUpdatedAt === failedImage.updatedAt) ? (
        <span
          role="img"
          aria-label="기록 스티커 없음"
          className="grid size-full shrink-0 place-items-center text-neutral-400"
        >
          —
        </span>
      ) : (
        <img
          key={imageAttempt}
          src={image}
          alt="기록에 사용한 스티커"
          data-mp-block=""
          loading="lazy"
          className="size-full shrink-0 object-contain"
          onLoad={() => {
            retryCount.current = 0;
          }}
          onError={() => void handleImageError()}
        />
      )}
    </span>
  );
}

export default function ConsumptionSticker(props: ConsumptionStickerProps) {
  return <ConsumptionStickerImage key={props.consumptionId} {...props} />;
}
