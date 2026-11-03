import { Camera } from 'expo-camera';

const CAMERA_REQUEST_TIMEOUT_MS = 4 * 60_000;

type CameraExitResult = { status: 'cancelled' } | { status: 'permissionDenied' };
type CameraRequestOptions = {
  open: (requestId: string) => void;
  alreadyOpenMessage: string;
};

/** 카메라별 대기 요청을 격리하고 권한·시간 제한·늦은 결과 처리를 공통 관리합니다. */
export const createCameraRequest = <Result>({ open, alreadyOpenMessage }: CameraRequestOptions) => {
  type CameraResult = Result | CameraExitResult;
  let pending: {
    id: string;
    resolve: (result: CameraResult) => void;
    timer: ReturnType<typeof setTimeout>;
  } | null = null;
  let isOpening = false;

  const isActive = (id: string) => pending?.id === id;
  const finish = (id: string, result: CameraResult) => {
    if (!pending || pending.id !== id) return;
    const request = pending;
    pending = null;
    clearTimeout(request.timer);
    request.resolve(result);
  };

  const request = async (): Promise<CameraResult> => {
    if (isOpening || pending) throw new Error(alreadyOpenMessage);
    isOpening = true;
    try {
      const permission = await Camera.requestCameraPermissionsAsync();
      if (!permission.granted) return { status: 'permissionDenied' };
      return await new Promise<CameraResult>((resolve, reject) => {
        const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
        const timer = setTimeout(
          () => finish(id, { status: 'cancelled' }),
          CAMERA_REQUEST_TIMEOUT_MS
        );
        pending = { id, resolve, timer };
        try {
          open(id);
        } catch (error) {
          clearTimeout(timer);
          pending = null;
          reject(error);
        }
      });
    } finally {
      isOpening = false;
    }
  };

  return { request, finish, isActive };
};
