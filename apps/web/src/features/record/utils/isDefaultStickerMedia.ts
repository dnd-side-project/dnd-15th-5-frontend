import type { StickerRecordMedia } from '@/features/record/types';

type DefaultStickerMedia = Extract<
  StickerRecordMedia,
  { source: 'default' } | { source: 'saved'; stickerItemId: number }
>;

/** 새로 선택했거나 서버 ID로 복원한 기본 스티커인지 확인합니다. */
export const isDefaultStickerMedia = (media: StickerRecordMedia): media is DefaultStickerMedia =>
  media.source === 'default' || (media.source === 'saved' && media.stickerItemId !== undefined);
