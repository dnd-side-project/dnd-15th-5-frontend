import { getStickerImageByName } from '@/shared/assets/images/stickers';

import { formatStickerDateLabel, mapStickerBoardToRecordGroups } from './monthlyStickerRecords';

describe('monthlyStickerRecords', () => {
  it('스티커보드의 사진과 이모지를 날짜 내림차순으로 함께 표시한다', () => {
    const groups = mapStickerBoardToRecordGroups([
      { date: '2026-08-21', visuals: [{ stickerName: '커피' }] },
      {
        date: '2026-08-23',
        visuals: [
          { imageId: 1, imageUrl: 'https://example.com/photo.png' },
          { stickerName: '피자' },
        ],
      },
    ]);

    expect(groups).toEqual([
      {
        date: '2026-08-23',
        stickerImages: ['https://example.com/photo.png', getStickerImageByName('피자')],
      },
      { date: '2026-08-21', stickerImages: [getStickerImageByName('커피')] },
    ]);
  });

  it('날짜나 표시할 이미지가 없는 항목은 제외한다', () => {
    expect(
      mapStickerBoardToRecordGroups([
        { visuals: [{ stickerName: '커피' }] },
        { date: '2026-08-24' },
        { date: '2026-08-23', visuals: [{ stickerName: '미지원' }] },
      ])
    ).toEqual([]);
    expect(mapStickerBoardToRecordGroups()).toEqual([]);
  });

  it('같은 날짜의 이미지와 중복된 이모지는 응답 순서와 개수대로 유지한다', () => {
    expect(
      mapStickerBoardToRecordGroups([
        { date: '2026-08-23', visuals: [{ stickerName: '커피' }, { stickerName: '커피' }] },
        { date: '2026-08-23', visuals: [{ imageUrl: 'https://example.com/photo.png' }] },
      ])
    ).toEqual([
      {
        date: '2026-08-23',
        stickerImages: [
          getStickerImageByName('커피'),
          getStickerImageByName('커피'),
          'https://example.com/photo.png',
        ],
      },
    ]);
  });

  it('날짜를 요일이 포함된 표시 문구로 변환한다', () => {
    expect(formatStickerDateLabel('2026-08-23')).toBe('23일 일요일');
    expect(formatStickerDateLabel('invalid')).toBe('invalid');
  });
});
