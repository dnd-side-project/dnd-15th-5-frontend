import { Camera } from 'expo-camera';
import { router } from 'expo-router';

let isOpening = false;

/**
 * 영수증 촬영 화면을 연다.
 *
 * 카메라 권한이 없으면 화면을 열지 않고 오류를 던진다.
 * 촬영 결과는 웹으로 돌아오지 않고, 촬영 화면 자체가 다음 네이티브 화면으로 이어간다.
 *
 * NOTE: 웹이 같은 요청을 짧은 간격으로 중복해서 보내도(예: 리액트 StrictMode의 effect 이중 실행)
 * 촬영 화면이 두 번 쌓이지 않도록 이미 여는 중이면 조용히 무시한다.
 */
export const openReceiptCamera = async (): Promise<{ opened: true }> => {
  if (isOpening) {
    return { opened: true };
  }

  isOpening = true;

  try {
    const permission = await Camera.requestCameraPermissionsAsync();

    if (!permission.granted) {
      throw new Error('카메라 권한이 필요합니다');
    }

    router.push('/camera');

    return { opened: true };
  } finally {
    isOpening = false;
  }
};
