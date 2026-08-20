import { normalizeReceiptImage } from '@/native/normalizeReceiptImage';

import { MINIMUM_RECEIPT_SCAN_DURATION_MS } from '../constants';

type ServerErrorResponse = {
  response?: {
    data?: {
      message?: unknown;
    };
  };
};

/** 서버 형태의 오류에서 사용자에게 보여줄 영수증 처리 메시지를 안전하게 추출한다. */
export const getReceiptProcessingErrorMessage = (error: unknown) => {
  if (typeof error !== 'object' || error === null) {
    return null;
  }

  const message = (error as ServerErrorResponse).response?.data?.message;

  return typeof message === 'string' && message.trim() ? message : null;
};

// TODO: OCR API 계약 확정 후 정규화된 이미지를 전송하고 인식 결과를 함께 반환한다.
/** 영수증 이미지를 정규화하고 스캔 화면의 최소 노출 시간을 보장한다. */
export const processReceiptImage = async (image: Parameters<typeof normalizeReceiptImage>[0]) => {
  const minimumDuration = new Promise<void>((resolve) => {
    setTimeout(resolve, MINIMUM_RECEIPT_SCAN_DURATION_MS);
  });

  try {
    return await normalizeReceiptImage(image);
  } finally {
    await minimumDuration;
  }
};
