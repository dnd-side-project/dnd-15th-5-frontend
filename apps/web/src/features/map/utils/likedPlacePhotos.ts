/** 좋아요 매장의 중복 사진과 빈 URL을 제거합니다. */
export const getLikedPlacePhotoUrls = (photoUrls?: string[]): string[] => [
  ...new Set(photoUrls?.map((url) => url.trim()).filter(Boolean) ?? []),
];
