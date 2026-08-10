import { domToBlob } from 'modern-screenshot';
import { useCallback, useRef, useState } from 'react';

import { isNativeApp, requestToNative } from '@/shared/lib/bridge';

import { REPORT_IMAGE_CAPTURE_SCALE } from '../constants';
import { convertBlobToBase64, downloadBlob } from '../utils/reportImage';

/**
 * 지정한 DOM 영역을 2배 해상도의 PNG로 변환해 저장한다.
 *
 * `captureRef`는 실제로 렌더링된 요소에 연결해야 하며 `display: none`인 요소는 사용할 수 없다.
 * 앱 WebView에서는 기기의 사진 보관함에 저장하고, 일반 브라우저에서는 파일로 다운로드한다.
 * 폰트 로딩이 끝난 뒤 이미지를 생성하며 중복 요청과 저장 실패 상태를 함께 관리한다.
 *
 * @param fileName 다운로드할 PNG 파일명
 * @returns 캡처 대상 ref, 다운로드 함수, 진행 상태와 실패 상태
 */
export const useReportImageDownload = (fileName: string) => {
  const captureRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [hasDownloadError, setHasDownloadError] = useState(false);

  const downloadImage = useCallback(async () => {
    if (!captureRef.current || isDownloading) return;

    setIsDownloading(true);
    setHasDownloadError(false);

    try {
      await document.fonts.ready;

      const imageBlob = await domToBlob(captureRef.current, {
        scale: REPORT_IMAGE_CAPTURE_SCALE,
      });

      if (isNativeApp()) {
        // NOTE: blob URL은 웹 런타임에서만 유효하므로 네이티브에는 Base64 데이터로 전달한다.
        const base64 = await convertBlobToBase64(imageBlob);
        await requestToNative('saveImage', { base64, fileName });
        return;
      }

      downloadBlob(imageBlob, fileName);
    } catch {
      setHasDownloadError(true);
    } finally {
      setIsDownloading(false);
    }
  }, [fileName, isDownloading]);

  return {
    captureRef,
    downloadImage,
    hasDownloadError,
    isDownloading,
  };
};
