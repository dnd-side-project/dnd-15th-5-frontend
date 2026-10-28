/** 좋아요 매장의 중복 사진을 제거하고, 갤러리가 없으면 대표 사진으로 대체합니다. */
export const getLikedPlacePhotoUrls = (
  photoUrls?: string[],
  fallbackPhotoUrl?: string | null
): string[] => {
  const photos = photoUrls?.length ? photoUrls : fallbackPhotoUrl ? [fallbackPhotoUrl] : [];
  return [...new Set(photos)];
};
