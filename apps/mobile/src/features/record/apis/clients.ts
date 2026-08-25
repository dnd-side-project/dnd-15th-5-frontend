import { File } from 'expo-file-system';

import { authenticatedRequest } from '@/native/api';

import type {
  ConsumptionCreateRequest,
  ConsumptionCreateResponse,
  ReceiptOcrResponse,
} from './types';

/** 정규화한 영수증 이미지를 OCR 처리한다. */
export const recognizeReceipt = (receiptImageUri: string) => {
  const receiptImage = new File(receiptImageUri);
  const formData = new FormData();

  formData.append('receiptImage', receiptImage, receiptImage.name || 'receipt.jpg');

  return authenticatedRequest<ReceiptOcrResponse>('/consumptions/receipt-ocr', {
    method: 'POST',
    body: formData,
  });
};

/** 사용자가 확인한 장소와 소비 정보를 최종 저장한다. */
export const createConsumption = (request: ConsumptionCreateRequest) =>
  authenticatedRequest<ConsumptionCreateResponse>('/consumptions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
