import { router } from 'expo-router';

import { createCameraRequest } from '@/native/camera/createCameraRequest';

import type { BridgeResult } from '@chapchap/shared/bridge';

const receiptCamera = createCameraRequest<BridgeResult<'scanReceipt'>>({
  open: (scanId) => router.push({ pathname: '/camera', params: { scanId } }),
  alreadyOpenMessage: '영수증 카메라가 이미 열려 있어요.',
});

export const isReceiptScanActive = receiptCamera.isActive;
export const finishReceiptScan = receiptCamera.finish;

/** 기존 영수증 카메라를 열되, 별도 기록을 생성하지 않고 OCR 결과를 웹 폼으로 반환합니다. */
export const scanReceipt = receiptCamera.request;
