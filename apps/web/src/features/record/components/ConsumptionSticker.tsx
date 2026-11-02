import { useState } from 'react';

import { useConsumptionStickerQuery } from '@/features/record/apis/hooks/useConsumptionStickerQuery';

type ConsumptionStickerProps = {
  consumptionId: number;
};

/** 방문 기록에 사용한 사진·기본 스티커를 투명 배경과 원래 비율로 표시합니다. */
export default function ConsumptionSticker({ consumptionId }: ConsumptionStickerProps) {
  const { data: image, isPending } = useConsumptionStickerQuery(consumptionId);
  const [failedImage, setFailedImage] = useState<string | null>(null);
  if (isPending)
    return (
      <span
        role="status"
        aria-label="스티커 불러오는 중"
        className="size-10 shrink-0 animate-pulse rounded-08 bg-neutral-100 motion-reduce:animate-none"
      />
    );
  if (!image || image === failedImage)
    return (
      <span
        role="img"
        aria-label="기록 스티커 없음"
        className="grid size-10 shrink-0 place-items-center text-neutral-400"
      >
        —
      </span>
    );
  return (
    <img
      src={image}
      alt="기록에 사용한 스티커"
      data-mp-block=""
      loading="lazy"
      className="size-10 shrink-0 object-contain"
      onError={() => setFailedImage(image)}
    />
  );
}
