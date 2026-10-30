/** 테두리가 포함된 기본 스티커 PNG를 추가 합성 없이 불러와 원본을 유지합니다. */
export const loadDefaultSticker = async (image: string, signal: AbortSignal) => {
  const response = await fetch(image, { signal });
  if (!response.ok) throw new Error('기본 스티커를 불러오지 못했어요. 다시 시도해주세요.');
  const stickerBlob = await response.blob();
  signal.throwIfAborted();
  return stickerBlob;
};
