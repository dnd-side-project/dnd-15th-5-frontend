import { useRef, useState } from 'react';

import { createConsumption } from '@/features/record/apis/clients';
import type { ReceiptDraft } from '@/features/record/types';
import { createConsumptionRequest } from '@/features/record/utils/createConsumptionRequest';
import { getRecordErrorMessage } from '@/features/record/utils/getRecordErrorMessage';
import { useToast } from '@/shared/ui/toast';

const CREATE_CONSUMPTION_ERROR_MESSAGE =
  '소비 기록을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.';
const CREATE_CONSUMPTION_SUCCESS_MESSAGE = '소비 기록이 저장되었어요.';

type UseSubmitReceiptConsumptionOptions = {
  onSuccess: () => void;
};

/**
 * 확인한 영수증 기록의 요청 변환·저장·피드백을 담당한다.
 *
 * 성공 뒤 화면 전환은 화면 계층이 결정할 수 있도록 `onSuccess`에 위임한다.
 */
export const useSubmitReceiptConsumption = ({ onSuccess }: UseSubmitReceiptConsumptionOptions) => {
  const { showToast } = useToast();
  const isSubmittingRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitReceiptConsumption = async (draft: ReceiptDraft) => {
    if (isSubmittingRef.current) {
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      await createConsumption(createConsumptionRequest(draft));
      showToast({ type: 'success', message: CREATE_CONSUMPTION_SUCCESS_MESSAGE });
      onSuccess();
    } catch (error) {
      showToast({
        type: 'error',
        message: getRecordErrorMessage(error) || CREATE_CONSUMPTION_ERROR_MESSAGE,
      });
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, submitReceiptConsumption };
};
