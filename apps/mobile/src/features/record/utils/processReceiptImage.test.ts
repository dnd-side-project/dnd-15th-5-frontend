import { recognizeReceipt } from '@/features/record/apis/clients';
import { normalizeReceiptImage } from '@/native/normalizeReceiptImage';

import { processReceiptImage } from './processReceiptImage';

jest.mock('@/features/record/apis/clients', () => ({ recognizeReceipt: jest.fn() }));
jest.mock('@/native/normalizeReceiptImage', () => ({ normalizeReceiptImage: jest.fn() }));

const mockRecognizeReceipt = jest.mocked(recognizeReceipt);
const mockNormalizeReceiptImage = jest.mocked(normalizeReceiptImage);

describe('processReceiptImage', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('정규화된 영수증을 OCR로 보내고 이미지 URI와 인식 결과를 반환한다', async () => {
    const image = { uri: 'file://original.jpg', width: 2000, height: 3000 };
    mockNormalizeReceiptImage.mockResolvedValue({ uri: 'file://normalized.jpg' });
    mockRecognizeReceipt.mockResolvedValue({
      receiptImageId: 15,
      storeName: '카페 차차',
      amount: 12000,
    });

    const processing = processReceiptImage(image);
    await jest.runAllTimersAsync();

    await expect(processing).resolves.toEqual({
      uri: 'file://normalized.jpg',
      receiptImageId: 15,
      storeName: '카페 차차',
      amount: 12000,
    });
    expect(mockRecognizeReceipt).toHaveBeenCalledWith('file://normalized.jpg');
  });
});
