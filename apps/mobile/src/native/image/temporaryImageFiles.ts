import { File, Paths } from 'expo-file-system';

const temporaryImageUris = new Set<string>();

/** 촬영 또는 이미지 변환으로 직접 생성한 파일만 등록합니다. 갤러리 입력 원본은 등록하지 않습니다. */
export const trackTemporaryImage = (uri: string) => {
  temporaryImageUris.add(uri);
};

/** 선택기가 반환한 앱 캐시 복사본만 등록하며, 사진 보관함의 원본 URI는 보존합니다. */
export const trackPickedImage = (uri: string) => {
  const cacheUri = `${Paths.cache.uri.replace(/\/$/, '')}/`;
  if (uri.startsWith(cacheUri)) trackTemporaryImage(uri);
};

/** 등록한 파일의 사용이 끝나면 한 번만 삭제하며, 정리 실패는 처리 결과를 바꾸지 않습니다. */
export const releaseTemporaryImage = (uri: string | null | undefined) => {
  if (!uri || !temporaryImageUris.delete(uri)) return;
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {
    // INFO: 운영체제가 먼저 정리했거나 삭제에 실패해도 촬영·OCR 결과는 유지합니다.
  }
};
