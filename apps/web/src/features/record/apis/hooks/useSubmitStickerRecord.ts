import { useEffect, useRef, useState } from 'react';

import { findStickers, upload } from '@/features/record/apis/clients';
import { useCreateConsumptionMutation } from '@/features/record/apis/hooks/useCreateConsumptionMutation';
import type { StickerRecordDraft, StickerRecordMedia } from '@/features/record/types';
import {
  createStickerConsumptionRequest,
  validateStickerRecordDraft,
} from '@/features/record/utils/createStickerConsumptionRequest';
import type { StickerRecordMediaId } from '@/features/record/utils/createStickerConsumptionRequest';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const resolveMediaId = async (
  media: StickerRecordMedia,
  signal: AbortSignal
): Promise<StickerRecordMediaId> => {
  if (media.source === 'default') {
    const response = await findStickers(undefined, signal);
    const matches = response.data?.filter(
      (item) => item.category === media.category && item.name === media.name
    );
    const stickerItemId = matches?.length === 1 ? matches[0].stickerItemId : undefined;
    if (!Number.isSafeInteger(stickerItemId) || !stickerItemId || stickerItemId <= 0)
      throw new Error('선택한 이모지가 서버 목록에 없어요. 다른 이모지를 선택해주세요.');
    return { stickerItemId };
  }
  const { image } = media;
  if (!['image/png', 'image/jpeg'].includes(image.type) || image.size === 0)
    throw new Error('PNG 또는 JPEG 이미지를 선택해주세요.');
  if (image.size > MAX_IMAGE_BYTES) throw new Error('이미지는 5MB 이하로 준비해주세요.');
  const response = await upload(
    {
      image: new File([image], image.type === 'image/png' ? 'sticker.png' : 'sticker.jpg', {
        type: image.type,
      }),
    },
    undefined,
    signal
  );
  const imageId = response.data?.imageId;
  if (typeof imageId !== 'number')
    throw new Error('이미지 업로드 결과를 확인하지 못했어요. 다시 시도해주세요.');
  return { imageId };
};

/** 사진은 업로드하고 기본 이모지는 서버 ID로 등록하며 중복 제출을 막습니다. */
export const useSubmitStickerRecord = () => {
  const { createConsumptionAsync } = useCreateConsumptionMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const pending = useRef(false);
  const controller = useRef<AbortController | null>(null);
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      controller.current?.abort();
    };
  }, []);

  const submit = async (media: StickerRecordMedia, draft: StickerRecordDraft) => {
    if (pending.current) return;
    pending.current = true;
    setIsSubmitting(true);
    setSubmitError('');
    const request = new AbortController();
    controller.current = request;
    try {
      validateStickerRecordDraft(draft);
      if (media.source === 'default' && media.category !== draft.category)
        throw new Error('이모지와 기록의 카테고리를 맞춰주세요.');
      const mediaId = await resolveMediaId(media, request.signal);
      request.signal.throwIfAborted();
      await createConsumptionAsync(createStickerConsumptionRequest(draft, mediaId));
    } catch (error) {
      if (mounted.current && !request.signal.aborted) {
        const serverMessage = (error as { response?: { data?: { message?: string } } } | null)
          ?.response?.data?.message;
        setSubmitError(
          serverMessage ||
            (error instanceof Error
              ? error.message
              : '기록을 저장하지 못했어요. 다시 시도해주세요.')
        );
      }
    } finally {
      pending.current = false;
      if (mounted.current) setIsSubmitting(false);
    }
  };
  return { submit, isSubmitting, submitError };
};
