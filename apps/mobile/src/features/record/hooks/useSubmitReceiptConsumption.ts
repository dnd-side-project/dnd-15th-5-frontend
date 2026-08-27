import { useRef, useState } from 'react';

import { createConsumption } from '@/features/record/apis/clients';
import type { ReceiptDraft } from '@/features/record/types';
import { createConsumptionRequest } from '@/features/record/utils/createConsumptionRequest';
import { getRecordErrorMessage } from '@/features/record/utils/getRecordErrorMessage';
import { useToast } from '@/shared/ui/toast';

import type { CreatedConsumptionPlace } from '@chapchap/shared/record';

const CREATE_CONSUMPTION_ERROR_MESSAGE =
  '소비 기록을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.';

type UseSubmitReceiptConsumptionOptions = {
  onSuccess: (createdPlace: CreatedConsumptionPlace) => void;
};

/**
 * 확인한 영수증 기록의 요청 변환·저장·피드백을 담당한다.
 *
 * 성공 뒤 화면 전환은 화면 계층이 결정할 수 있도록 `onSuccess`에 위임하며, 지도 홈이
 * 방문 마커와 대조할 수 있도록 등록한 장소명·좌표를 함께 전달한다.
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
      const request = createConsumptionRequest(draft);
      await createConsumption(request);
      onSuccess({
        placeName: request.placeName,
        latitude: request.latitude,
        longitude: request.longitude,
      });
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
