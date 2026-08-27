import { createRecordCreatedHomePath } from './createRecordCreatedHomePath';

describe('createRecordCreatedHomePath', () => {
  it('장소명과 좌표를 쿼리 문자열로 인코딩한 홈 경로를 만든다', () => {
    expect(
      createRecordCreatedHomePath({
        placeName: '카페 차차',
        latitude: 37.506481,
        longitude: 127.024551,
      })
    ).toBe(
      '/home?createdPlaceName=%EC%B9%B4%ED%8E%98+%EC%B0%A8%EC%B0%A8&createdPlaceLat=37.506481&createdPlaceLng=127.024551'
    );
  });
});
