import { useEffect, useRef, useState } from 'react';

import type { ConsumptionSaveRequest } from '@/features/record/apis/dto';
import { resolveStickerRecordMediaId } from '@/features/record/apis/services/resolveStickerRecordMediaId';
import type { StickerRecordDraft, StickerRecordMedia } from '@/features/record/types';
import {
  createStickerConsumptionRequest,
  validateStickerRecordDraft,
} from '@/features/record/utils/createStickerConsumptionRequest';
import { isDefaultStickerMedia } from '@/features/record/utils/isDefaultStickerMedia';

type UseStickerRecordSubmissionParams = {
  save: (request: ConsumptionSaveRequest) => Promise<unknown>;
  errorMessage: string;
  onSuccess?: () => void;
};

/** 생성·수정 폼의 검증, 미디어 준비, 중복 제출 방지와 요청 수명을 함께 관리합니다. */
export const useStickerRecordSubmission = ({
  save,
  errorMessage,
  onSuccess,
}: UseStickerRecordSubmissionParams) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const isPendingRef = useRef(false);
  const isMountedRef = useRef(false);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      controllerRef.current?.abort();
    };
  }, []);

  const submit = async (media: StickerRecordMedia, draft: StickerRecordDraft) => {
    if (isPendingRef.current) return;
    isPendingRef.current = true;
    setIsSubmitting(true);
    setSubmitError('');
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      validateStickerRecordDraft(draft);
      if (isDefaultStickerMedia(media) && media.category !== draft.category)
        throw new Error('이모지와 기록의 카테고리를 맞춰주세요.');
      const mediaId = await resolveStickerRecordMediaId(media, controller.signal);
      controller.signal.throwIfAborted();
      await save(createStickerConsumptionRequest(draft, mediaId));
      if (isMountedRef.current) onSuccess?.();
    } catch (error) {
      if (isMountedRef.current && !controller.signal.aborted) {
        const serverMessage = (error as { response?: { data?: { message?: unknown } } } | null)
          ?.response?.data?.message;
        setSubmitError(
          typeof serverMessage === 'string' && serverMessage
            ? serverMessage
            : error instanceof Error
              ? error.message
              : errorMessage
        );
      }
    } finally {
      isPendingRef.current = false;
      controllerRef.current = null;
      if (isMountedRef.current) setIsSubmitting(false);
    }
  };

  return { submit, isSubmitting, submitError };
};
