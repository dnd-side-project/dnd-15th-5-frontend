import { ChevronRightIcon, StatusSuccessIcon } from '@/shared/assets/icons';
import ReceiptScanIcon from '@/shared/assets/icons/ic-receipt-scan.svg?react';

type ReceiptScanPanelProps = {
  hasReceipt: boolean;
  isOpeningReceipt: boolean;
  error: string;
  onScanReceipt: () => void;
};

/** 영수증 인식 전·후의 안내와 재인식 동작을 표시하며, 요청과 입력값 반영은 상위 폼에서 처리합니다. */
export default function ReceiptScanPanel({
  hasReceipt,
  isOpeningReceipt,
  error,
  onScanReceipt,
}: ReceiptScanPanelProps) {
  return (
    <>
      {hasReceipt ? (
        <div className="mt-3 flex min-h-12 items-center gap-3 rounded-16 bg-primary-50 px-4 py-3">
          <StatusSuccessIcon
            aria-hidden="true"
            className="size-4 shrink-0 [&_circle]:fill-primary-500 [&_path]:stroke-neutral-00"
          />
          <p role="status" className="flex-1 text-body-02-regular text-neutral-600">
            영수증을 인식해 정보를 가져왔어요
          </p>
          <button
            type="button"
            onClick={onScanReceipt}
            disabled={isOpeningReceipt}
            aria-busy={isOpeningReceipt}
            className="shrink-0 py-1 text-label-01-medium text-primary-500"
          >
            {isOpeningReceipt ? '인식 중' : '다시 인식'}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onScanReceipt}
          disabled={isOpeningReceipt}
          aria-busy={isOpeningReceipt}
          className="mt-3 flex h-18.5 items-center gap-4 rounded-16 bg-primary-50 px-6 text-left text-primary-500"
        >
          <ReceiptScanIcon aria-hidden="true" className="size-8 shrink-0" />
          <span className="flex flex-1 flex-col gap-1">
            <span className="text-body-01-semibold">
              {isOpeningReceipt ? '카메라를 열고 있어요' : '영수증 인식하기'}
            </span>
            <span className="text-body-02-regular text-neutral-500">
              사진 한 장으로 한 번에 기록해요
            </span>
          </span>
          <ChevronRightIcon aria-hidden="true" className="size-6 shrink-0" />
        </button>
      )}
      {error && (
        <p role="alert" className="mt-2 text-body-02-regular text-red">
          {error}
        </p>
      )}
    </>
  );
}
