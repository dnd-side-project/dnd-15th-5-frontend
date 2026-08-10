import { domToBlob } from 'modern-screenshot';
import { useCallback, useRef, useState } from 'react';

/**
 * 지정한 DOM 영역을 2배 해상도의 PNG로 변환해 다운로드한다.
 *
 * `captureRef`는 실제로 렌더링된 요소에 연결해야 하며 `display: none`인 요소는 사용할 수 없다.
 * 폰트 로딩이 끝난 뒤 이미지를 생성하고, 중복 요청과 변환 실패 상태를 함께 관리한다.
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
        scale: 2,
      });
      const imageUrl = URL.createObjectURL(imageBlob);
      const downloadLink = document.createElement('a');

      downloadLink.download = fileName;
      downloadLink.href = imageUrl;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      window.setTimeout(() => URL.revokeObjectURL(imageUrl), 1000);
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
