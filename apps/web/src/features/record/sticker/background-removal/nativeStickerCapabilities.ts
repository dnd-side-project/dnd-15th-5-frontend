import { requestToNative } from '@/shared/lib/bridge';

/** 구형 앱도 아는 ping으로 지원 여부를 먼저 확인해, 알 수 없는 요청을 오래 기다리지 않습니다. */
export const assertNativeStickerBackground = async () => {
  const capabilities = await requestToNative('ping', { sentAt: Date.now() });
  if (capabilities.nativeStickerBackground !== true) {
    throw new Error('네이티브 누끼 기능이 없는 앱 빌드예요. 새 개발 빌드를 설치해주세요.');
  }
};
