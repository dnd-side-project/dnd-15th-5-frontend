import { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useDeleteConsumptionRecord } from '@/features/record/apis/hooks/useDeleteConsumptionRecord';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import type { ConsumptionActions } from '@/shared/types/consumptionActions';
import { Dialog, DialogActionButton } from '@/shared/ui/dialog';
import { isPositiveSafeInteger } from '@/shared/utils/isPositiveSafeInteger';

import type { ReactNode } from 'react';

type ConsumptionRecordActionsProps = {
  children: (actions: ConsumptionActions) => ReactNode;
};

/** 페이지에서 목록의 수정 이동과 삭제 확인·API 요청·관련 캐시 갱신을 연결합니다. */
export default function ConsumptionRecordActions({ children }: ConsumptionRecordActionsProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const { deleteRecord, isDeleting, deleteError, clearDeleteError } = useDeleteConsumptionRecord();
  const handleConfirmDelete = async () => {
    if (deleteId !== null && (await deleteRecord(deleteId))) setDeleteId(null);
  };

  const handleEditRecord = async (id: number, purchaseDate?: string, scrollTop?: number) => {
    if (isDeleting || !isPositiveSafeInteger(id)) return;
    const returnTo = `${location.pathname}${location.search}`;
    const returnState = {
      ...(location.state && typeof location.state === 'object' ? location.state : {}),
      scrollToConsumptionId: id,
      returnEntryKey: location.key,
      ...(scrollTop !== undefined ? { returnScrollTop: scrollTop } : {}),
      ...(purchaseDate ? { scrollToDate: purchaseDate } : {}),
    };
    // NOTE: 돌아왔을 때 수정하던 기록의 월·날짜를 다시 보여주도록 현재 히스토리에 보존합니다.
    await navigate(returnTo, {
      replace: true,
      state: returnState,
    });
    navigate(ROUTE_PATHS.editRecord(String(id)), {
      state: { returnTo, returnState, returnEntryKey: location.key },
    });
  };

  const handleRequestDelete = (id: number) => {
    if (isDeleting || !isPositiveSafeInteger(id)) return;
    clearDeleteError();
    setDeleteId(id);
  };

  return (
    <>
      {children({
        onEditRecord: handleEditRecord,
        onDeleteRecord: handleRequestDelete,
      })}
      <Dialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setDeleteId(null);
        }}
        title="기록을 삭제할까요?"
        description="한번 삭제한 기록은 다시 복구할 수 없어요"
        initialFocusRef={cancelRef}
        actions={
          <>
            <DialogActionButton
              ref={cancelRef}
              tone="neutral"
              disabled={isDeleting}
              onClick={() => setDeleteId(null)}
            >
              취소하기
            </DialogActionButton>
            <DialogActionButton
              tone="primary"
              className="bg-red hover:bg-red active:bg-red"
              isLoading={isDeleting}
              onClick={() => void handleConfirmDelete()}
            >
              삭제하기
            </DialogActionButton>
          </>
        }
      >
        {deleteError && (
          <p role="alert" className="mt-4 text-center text-body-02-regular text-red">
            {deleteError}
          </p>
        )}
      </Dialog>
    </>
  );
}
