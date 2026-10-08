/**
 * 스티커로 쓸 사진에서 배경을 제거합니다.
 *
 * NOTE: 배경 제거 엔진을 정하기 전이라 원본 이미지를 그대로 반환한다.
 * 엔진을 연결할 때 이 함수만 교체한다.
 */
export const removeStickerBackground = async (image: Blob, signal: AbortSignal): Promise<Blob> => {
  if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
  return image;
};
