import { useCreateConsumptionMutation } from '@/features/record/apis/hooks/useCreateConsumptionMutation';
import { useStickerRecordSubmission } from '@/features/record/apis/hooks/useStickerRecordSubmission';

/** 사진은 업로드하고 기본 이모지는 서버 ID로 등록하며 중복 제출을 막습니다. */
export const useSubmitStickerRecord = () => {
  const { createConsumptionAsync } = useCreateConsumptionMutation();

  return useStickerRecordSubmission({
    save: createConsumptionAsync,
    errorMessage: '기록을 저장하지 못했어요. 다시 시도해주세요.',
  });
};
