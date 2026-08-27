import { parseCreatedConsumptionPlace } from './parseCreatedConsumptionPlace';

describe('parseCreatedConsumptionPlace', () => {
  it('네이티브에서 전달한 쿼리 문자열의 장소명과 좌표를 복원한다', () => {
    const searchParams = new URLSearchParams({
      createdPlaceName: '카페 차차',
      createdPlaceLat: '37.506481',
      createdPlaceLng: '127.024551',
    });

    expect(parseCreatedConsumptionPlace(searchParams)).toEqual({
      placeName: '카페 차차',
      latitude: 37.506481,
      longitude: 127.024551,
    });
  });

  it('필수 값이 없거나 좌표가 숫자가 아니면 복원하지 않는다', () => {
    expect(parseCreatedConsumptionPlace(new URLSearchParams())).toBeUndefined();
    expect(
      parseCreatedConsumptionPlace(
        new URLSearchParams({
          createdPlaceName: '카페 차차',
          createdPlaceLat: 'invalid',
          createdPlaceLng: '127',
        })
      )
    ).toBeUndefined();
  });

  it('비어 있는 좌표 문자열은 0으로 해석하지 않는다', () => {
    expect(
      parseCreatedConsumptionPlace(
        new URLSearchParams({
          createdPlaceName: '카페 차차',
          createdPlaceLat: '   ',
          createdPlaceLng: '127',
        })
      )
    ).toBeUndefined();
  });

  it.each([
    ['91', '127'],
    ['-91', '127'],
    ['37', '181'],
    ['37', '-181'],
  ])('위경도 범위를 벗어난 좌표(%s, %s)는 복원하지 않는다', (latitude, longitude) => {
    expect(
      parseCreatedConsumptionPlace(
        new URLSearchParams({
          createdPlaceName: '카페 차차',
          createdPlaceLat: latitude,
          createdPlaceLng: longitude,
        })
      )
    ).toBeUndefined();
  });
});
