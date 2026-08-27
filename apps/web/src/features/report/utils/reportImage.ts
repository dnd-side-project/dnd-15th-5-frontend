import { domToBlob } from 'modern-screenshot';

const OBJECT_URL_REVOKE_DELAY_MS = 1_000;
const REPORT_IMAGE_CAPTURE_SCALE = 2;

/** 이미지 저장과 카카오톡 공유에 사용할 리포트 카드 PNG를 생성합니다. */
export const captureReportImageBlob = async (element: HTMLElement) => {
  await document.fonts.ready;

  return domToBlob(element, { scale: REPORT_IMAGE_CAPTURE_SCALE });
};

/** Kakao 이미지 업로드 API가 요구하는 FileList 형태로 PNG Blob을 변환합니다. */
export const createImageFileList = (blob: Blob, fileName: string) => {
  const dataTransfer = new DataTransfer();

  dataTransfer.items.add(new File([blob], fileName, { type: 'image/png' }));

  return dataTransfer.files;
};

/** PNG Blob을 네이티브 브리지로 전달할 수 있는 Base64 문자열로 변환한다. */
export const convertBlobToBase64 = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('이미지를 읽지 못했습니다'));
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('이미지를 변환하지 못했습니다'));
        return;
      }

      const base64 = reader.result.split(',')[1];

      if (!base64) {
        reject(new Error('이미지를 변환하지 못했습니다'));
        return;
      }

      resolve(base64);
    };
    reader.readAsDataURL(blob);
  });

/** PNG Blob을 브라우저의 파일 다운로드로 저장하고 임시 URL을 정리한다. */
export const downloadBlob = (blob: Blob, fileName: string) => {
  const imageUrl = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');

  downloadLink.download = fileName;
  downloadLink.href = imageUrl;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  window.setTimeout(() => URL.revokeObjectURL(imageUrl), OBJECT_URL_REVOKE_DELAY_MS);
};
