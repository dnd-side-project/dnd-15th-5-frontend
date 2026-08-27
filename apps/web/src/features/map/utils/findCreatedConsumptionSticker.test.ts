import { TEST_MAP_STICKERS } from '@/features/map/testFixtures';

import { findCreatedConsumptionSticker } from './findCreatedConsumptionSticker';

describe('findCreatedConsumptionSticker', () => {
  it('이름과 좌표가 일치하는 방문 장소 스티커를 찾는다', () => {
    const target = TEST_MAP_STICKERS[0]!;

    expect(
      findCreatedConsumptionSticker(TEST_MAP_STICKERS, {
        placeName: ` ${target.place.name} `,
        latitude: target.position.lat + 0.00001,
        longitude: target.position.lng - 0.00001,
      })
    ).toBe(target);
  });

  it('이름이나 좌표가 다르면 스티커를 선택하지 않는다', () => {
    const target = TEST_MAP_STICKERS[0]!;

    expect(
      findCreatedConsumptionSticker([target], {
        placeName: '다른 가게',
        latitude: target.position.lat,
        longitude: target.position.lng,
      })
    ).toBeUndefined();
    expect(
      findCreatedConsumptionSticker([target], {
        placeName: target.place.name,
        latitude: target.position.lat + 0.01,
        longitude: target.position.lng,
      })
    ).toBeUndefined();
  });
});
