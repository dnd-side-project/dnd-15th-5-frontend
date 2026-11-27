import { recognizeReceipt } from '@/features/record/apis/clients';
import { MINIMUM_RECEIPT_SCAN_DURATION_MS } from '@/features/record/constants';
import { releaseTemporaryImage } from '@/native/image/temporaryImageFiles';
import { normalizeReceiptImage } from '@/native/receipt/normalizeReceiptImage';

/** OCR 실패 시 변환 파일을 정리합니다. 성공한 파일은 반환받은 화면에서 사용 후 해제합니다. */
export const processReceiptImage = async (image: Parameters<typeof normalizeReceiptImage>[0]) => {
  const minimumDuration = new Promise<void>((resolve) => {
    setTimeout(resolve, MINIMUM_RECEIPT_SCAN_DURATION_MS);
  });

  let normalizedUri: string | undefined;
  try {
    const normalizedImage = await normalizeReceiptImage(image);
    normalizedUri = normalizedImage.uri;
    const recognizedReceipt = await recognizeReceipt(normalizedImage.uri);

    return { uri: normalizedImage.uri, ...recognizedReceipt };
  } catch (error) {
    releaseTemporaryImage(normalizedUri);
    throw error;
  } finally {
    await minimumDuration;
  }
};
