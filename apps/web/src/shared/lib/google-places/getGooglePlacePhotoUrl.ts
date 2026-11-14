import { IS_PRODUCTION } from '@/shared/lib/env';

const PHOTO_DAILY_LIMIT = 100;
const PHOTO_USAGE_STORAGE_KEY = 'chapchap_google_places_photo_usage';
const KOREA_TIME_OFFSET_MS = 9 * 60 * 60 * 1000;

const reservePhotoRequest = (): boolean => {
  const date = new Date(Date.now() + KOREA_TIME_OFFSET_MS).toISOString().slice(0, 10);
  const storedUsage = window.localStorage.getItem(PHOTO_USAGE_STORAGE_KEY);
  let count = 0;

  if (storedUsage !== null) {
    const usage: unknown = JSON.parse(storedUsage);
    if (
      typeof usage !== 'object' ||
      usage === null ||
      !('date' in usage) ||
      typeof usage.date !== 'string' ||
      !('count' in usage) ||
      typeof usage.count !== 'number' ||
      !Number.isSafeInteger(usage.count) ||
      usage.count < 0
    ) {
      return false;
    }
    if (usage.date === date) count = usage.count;
  }

  if (count >= PHOTO_DAILY_LIMIT) return false;

  window.localStorage.setItem(PHOTO_USAGE_STORAGE_KEY, JSON.stringify({ date, count: count + 1 }));
  return true;
};

/**
 * 배포 환경에서 브라우저·오리진별 사진 URL 생성을 한국 시간 하루 100건으로 제한합니다.
 * 새로고침 후에도 사용량을 유지하며 Web Locks로 같은 오리진의 탭 간 차감을 직렬화합니다.
 * 저장소나 잠금을 사용할 수 없으면 사진을 생략합니다. 실패한 요청도 할당량에 포함합니다.
 * 사진과 URL은 저장하지 않으며, 개발 환경에는 제한을 적용하지 않습니다.
 */
export const getGooglePlacePhotoUrl = async (
  photo: google.maps.places.Photo,
  maxWidth: number
): Promise<string | null> => {
  try {
    if (!IS_PRODUCTION) return photo.getURI({ maxWidth }) || null;

    if (!navigator.locks) return null;

    return await navigator.locks.request(PHOTO_USAGE_STORAGE_KEY, () =>
      reservePhotoRequest() ? photo.getURI({ maxWidth }) || null : null
    );
  } catch {
    return null;
  }
};
