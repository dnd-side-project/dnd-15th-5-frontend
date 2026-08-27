import { authenticatedRequest } from '@/native/api';

import { createConsumption, recognizeReceipt } from './clients';

jest.mock('@/native/api', () => ({ authenticatedRequest: jest.fn() }));
jest.mock('expo-file-system', () => ({
  File: class MockFile extends Blob {
    name = 'receipt.jpg';

    constructor() {
      super(['receipt-image']);
    }
  },
}));

const mockAuthenticatedRequest = jest.mocked(authenticatedRequest);

describe('record native API clients', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthenticatedRequest.mockResolvedValue({} as never);
  });

  it('영수증 이미지를 multipart 요청으로 전송한다', async () => {
    await recognizeReceipt('file://normalized.jpg');

    expect(mockAuthenticatedRequest).toHaveBeenCalledWith(
      '/consumptions/receipt-ocr',
      expect.objectContaining({ method: 'POST', body: expect.any(FormData) })
    );
  });

  it('확인한 소비 정보를 JSON 요청으로 전송한다', async () => {
    const request = {
      receiptImageId: 15,
      googlePlaceId: 'place-01',
      placeName: '카페 차차',
      roadAddress: '서울특별시 마포구',
      latitude: 37.5,
      longitude: 127,
      purchaseDate: '2026-07-25',
      purchaseTime: '11:00:00',
      amount: 12000,
      category: '카페',
    };

    await createConsumption(request);

    expect(mockAuthenticatedRequest).toHaveBeenCalledWith('/consumptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  });
});
