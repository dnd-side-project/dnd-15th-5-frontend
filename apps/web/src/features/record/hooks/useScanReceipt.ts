import { useEffect, useRef, useState } from 'react';

import { requestToNative } from '@/shared/lib/bridge';

import type { ReceiptScanData } from '@chapchap/shared/bridge';

/** 영수증 OCR 결과만 받아 현재 웹 기록 폼에 적용합니다. 취소 시 기존 초안을 유지합니다. */
export const useScanReceipt = () => {
  const [isOpeningReceipt, setIsOpeningReceipt] = useState(false);
  const [receiptError, setReceiptError] = useState('');
  const pending = useRef(false);
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const scanReceipt = async (): Promise<ReceiptScanData | null> => {
    if (pending.current) return null;
    pending.current = true;
    setIsOpeningReceipt(true);
    setReceiptError('');
    try {
      const result = await requestToNative('scanReceipt', {});
      if (!mounted.current) return null;
      if (result.status === 'permissionDenied')
        throw new Error('앱 설정에서 카메라 권한을 허용해주세요.');
      return result.status === 'success' ? result.receipt : null;
    } catch (error) {
      if (mounted.current)
        setReceiptError(
          error instanceof Error ? error.message : '영수증을 인식하지 못했어요. 다시 시도해주세요.'
        );
      return null;
    } finally {
      pending.current = false;
      if (mounted.current) setIsOpeningReceipt(false);
    }
  };
  return { scanReceipt, isOpeningReceipt, receiptError };
};
