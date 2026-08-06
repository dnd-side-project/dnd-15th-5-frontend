import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_ERROR_MESSAGE = '카메라를 실행하지 못했어요. 잠시 후 다시 시도해 주세요.';

const getCameraErrorMessage = (error: unknown) => {
  if (error instanceof DOMException && error.name === 'NotAllowedError') {
    return '카메라 권한이 필요해요. 기기 설정에서 카메라 접근을 허용해 주세요.';
  }

  if (error instanceof DOMException && error.name === 'NotFoundError') {
    return '사용할 수 있는 카메라를 찾지 못했어요.';
  }

  return DEFAULT_ERROR_MESSAGE;
};

export const useReceiptCamera = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cameraRequestIdRef = useRef(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    cameraRequestIdRef.current += 1;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsCameraReady(false);
  }, []);

  const startCamera = useCallback(async () => {
    const requestId = cameraRequestIdRef.current + 1;
    cameraRequestIdRef.current = requestId;

    if (!navigator.mediaDevices?.getUserMedia) {
      setErrorMessage('이 환경에서는 카메라를 사용할 수 없어요.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: 'environment' },
        },
      });

      if (requestId !== cameraRequestIdRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      setErrorMessage(null);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraReady(true);
      }
    } catch (error) {
      setErrorMessage(getCameraErrorMessage(error));
    }
  }, []);

  useEffect(() => {
    const animationFrameId = window.requestAnimationFrame(() => void startCamera());

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const takePhoto = () => {
    const video = videoRef.current;

    if (!video || !isCameraReady || video.videoWidth === 0 || video.videoHeight === 0) {
      setErrorMessage(DEFAULT_ERROR_MESSAGE);
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');

    if (!context) {
      setErrorMessage(DEFAULT_ERROR_MESSAGE);
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    setPhotoUrl(canvas.toDataURL('image/jpeg', 0.9));
    stopCamera();
  };

  const selectPhoto = (file?: File) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setErrorMessage('이미지 파일만 선택할 수 있어요.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoUrl(typeof reader.result === 'string' ? reader.result : null);
      setErrorMessage(null);
      stopCamera();
    };
    reader.onerror = () => setErrorMessage('사진을 불러오지 못했어요.');
    reader.readAsDataURL(file);
  };

  const retakePhoto = () => {
    setPhotoUrl(null);
    void startCamera();
  };

  return {
    errorMessage,
    isCameraReady,
    photoUrl,
    retakePhoto,
    selectPhoto,
    startCamera,
    stopCamera,
    takePhoto,
    videoRef,
  };
};
