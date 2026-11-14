import { useCallback, useState } from 'react';
import { useBeforeUnload } from 'react-router-dom';

import { useConsumptionDetailQuery } from '@/features/record/apis/hooks/useConsumptionDetailQuery';
import { useUpdateConsumptionRecord } from '@/features/record/apis/hooks/useUpdateConsumptionRecord';
import RecordNavigationHeader from '@/features/record/components/RecordNavigationHeader';
import { useScanReceipt } from '@/features/record/hooks/useScanReceipt';
import StickerRecordFlow from '@/features/record/sticker/components/StickerRecordFlow';
import type { StickerRecordInitialValue } from '@/features/record/types';
import { createEditConsumptionInitialValue } from '@/features/record/utils/createEditConsumptionInitialValue';
import { useUnsavedChangesBlocker } from '@/shared/hooks/useUnsavedChangesBlocker';
import { UnsavedChangesDialog } from '@/shared/ui/dialog';
import { Spinner } from '@/shared/ui/spinner';
import { StateView } from '@/shared/ui/state-view';
import { isPositiveSafeInteger } from '@/shared/utils/isPositiveSafeInteger';

import type { ShopSearchResult } from '@chapchap/shared/shop';
import type { ReactNode } from 'react';

type EditConsumptionProps = {
  consumptionId: number;
  onClose: () => void;
  renderShopSearch: (onSelect: (shop: ShopSearchResult) => void) => ReactNode;
};

function ConsumptionEditor({
  consumptionId,
  onClose,
  renderShopSearch,
  initialValue,
}: EditConsumptionProps & { initialValue: StickerRecordInitialValue }) {
  const [selectedShop, setSelectedShop] = useState(initialValue.draft.shop);
  const [hasChanges, setHasChanges] = useState(false);
  const [isShopSearchOpen, setIsShopSearchOpen] = useState(false);
  const blocker = useUnsavedChangesBlocker(hasChanges);
  const { scanReceipt, isOpeningReceipt, receiptError } = useScanReceipt();
  const { submit, isSubmitting, submitError } = useUpdateConsumptionRecord(consumptionId, () => {
    blocker.allowNextNavigation();
    onClose();
  });
  useBeforeUnload(
    useCallback(
      (event) => {
        if (hasChanges || isSubmitting) {
          event.preventDefault();
          event.returnValue = '';
        }
      },
      [hasChanges, isSubmitting]
    )
  );
  return (
    <>
      <div hidden={isShopSearchOpen} inert={isShopSearchOpen}>
        <StickerRecordFlow
          initialValue={initialValue}
          onDirtyChange={setHasChanges}
          onClose={() => {
            if (!isSubmitting) onClose();
          }}
          onSearchShop={() => setIsShopSearchOpen(true)}
          selectedShop={selectedShop}
          onReceiptShopSelected={setSelectedShop}
          onScanReceipt={scanReceipt}
          isOpeningReceipt={isOpeningReceipt}
          receiptError={receiptError}
          onSubmit={(media, draft) => void submit(media, draft)}
          isSubmitting={isSubmitting}
          submitError={submitError}
        />
      </div>
      {isShopSearchOpen && (
        <main className="min-h-dvh bg-neutral-00 px-4">
          <RecordNavigationHeader
            title="가게 변경"
            closeButtonLabel="기록 수정 종료"
            onBack={() => setIsShopSearchOpen(false)}
            onClose={onClose}
          />
          {renderShopSearch((shop) => {
            setSelectedShop(shop);
            setIsShopSearchOpen(false);
          })}
        </main>
      )}
      {blocker.isBlocked && (
        <UnsavedChangesDialog
          title="수정을 그만할까요?"
          description="지금까지 수정한 내용은 저장되지 않아요"
          exitLabel="그만하기"
          continueLabel="계속 수정하기"
          onExit={blocker.proceed}
          onContinue={blocker.reset}
        />
      )}
    </>
  );
}

/** 소비 기록을 조회해 수정 폼을 복원하고 조회 실패·잘못된 진입을 안내합니다. */
export default function EditConsumption(props: EditConsumptionProps) {
  const isValidId = isPositiveSafeInteger(props.consumptionId);
  const query = useConsumptionDetailQuery(props.consumptionId);
  if (isValidId && (query.isPending || (!query.isFetchedAfterMount && query.isFetching)))
    return (
      <div
        role="status"
        aria-label="기록 불러오는 중"
        className="flex min-h-dvh items-center justify-center"
      >
        <Spinner />
      </div>
    );
  const initialValue = query.data?.data ? createEditConsumptionInitialValue(query.data.data) : null;
  if (!isValidId || !initialValue)
    return (
      <main className="px-4">
        <RecordNavigationHeader
          title="기록 수정"
          closeButtonLabel="기록 수정 종료"
          showBack={false}
          onBack={props.onClose}
          onClose={props.onClose}
        />
        <StateView
          variant="error"
          headingAs="h1"
          title="기록을 불러오지 못했어요"
          description="기록 정보를 확인한 뒤 다시 시도해주세요."
          actionLabel={isValidId ? '다시 불러오기' : '돌아가기'}
          onAction={() => {
            if (isValidId) void query.refetch();
            else props.onClose();
          }}
        />
      </main>
    );
  return <ConsumptionEditor key={props.consumptionId} {...props} initialValue={initialValue} />;
}
