import { useGetConsumption } from '@/features/record/apis/queries';
import { getStickerImageByName } from '@/shared/assets/images/stickers';
import { isPositiveSafeInteger } from '@/shared/utils/isPositiveSafeInteger';

const STICKER_URL_STALE_TIME_MS = 60_000;

/** 방문 기록 ID별로 사진 스티커 URL 또는 선택한 기본 스티커 이미지를 제공합니다. */
export const useConsumptionStickerQuery = (consumptionId: number) =>
  useGetConsumption(consumptionId, {
    query: {
      enabled: isPositiveSafeInteger(consumptionId),
      // NOTE: 사진 URL은 2분간 유효하므로 그보다 짧게 캐시합니다.
      staleTime: STICKER_URL_STALE_TIME_MS,
      select: ({ data }) => {
        if (!data) return null;
        if (isPositiveSafeInteger(data.imageId)) return data.imageUrl || null;
        return getStickerImageByName(data.stickerName ?? undefined) ?? null;
      },
    },
  });
