import { recognizeReceipt } from '@/features/record/apis/clients';
import { MINIMUM_RECEIPT_SCAN_DURATION_MS } from '@/features/record/constants';
import { normalizeReceiptImage } from '@/native/normalizeReceiptImage';

/** 영수증 이미지를 정규화해 OCR 처리하고 스캔 화면의 최소 노출 시간을 보장한다. */
export const processReceiptImage = async (image: Parameters<typeof normalizeReceiptImage>[0]) => {
  const minimumDuration = new Promise<void>((resolve) => {
    setTimeout(resolve, MINIMUM_RECEIPT_SCAN_DURATION_MS);
  });

  try {
    const normalizedImage = await normalizeReceiptImage(image);
    const recognizedReceipt = await recognizeReceipt(normalizedImage.uri);

    return { uri: normalizedImage.uri, ...recognizedReceipt };
  } finally {
    await minimumDuration;
  }
};
