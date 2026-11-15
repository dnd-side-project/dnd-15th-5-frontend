import { getGooglePlacePhotoUrl } from './getGooglePlacePhotoUrl';
import { searchGooglePlaces } from './searchGooglePlaces';

jest.mock('./getGooglePlacePhotoUrl');
const mockedGetPhotoUrl = jest.mocked(getGooglePlacePhotoUrl);

describe('searchGooglePlaces', () => {
  const photos = [{}, {}, {}];
  const searchByText = jest.fn();
  const library = { Place: { searchByText } } as unknown as google.maps.PlacesLibrary;

  beforeEach(() => {
    mockedGetPhotoUrl.mockReset().mockResolvedValue('https://example.com/photo.jpg');
    searchByText.mockResolvedValue({
      places: [
        {
          id: 'place-01',
          displayName: '카페',
          formattedAddress: '서울',
          location: { lat: () => 37.5, lng: () => 127 },
          photos,
        },
      ],
    });
  });

  const search = (options = {}) =>
    searchGooglePlaces(library, {
      textQuery: '카페',
      maxResultCount: 5,
      ...options,
    });

  it('기본 검색은 썸네일 한 장만 생성하고 사용하지 않는 갤러리는 요청하지 않는다', async () => {
    const result = await search();

    expect(mockedGetPhotoUrl).toHaveBeenCalledTimes(1);
    expect(mockedGetPhotoUrl).toHaveBeenCalledWith(photos[0], 128);
    expect(result[0]?.photoUrl).toBe('https://example.com/photo.jpg');
    expect(result[0]).not.toHaveProperty('photoUrls');
  });

  it('할당량이 소진되어도 장소 검색 결과는 반환한다', async () => {
    mockedGetPhotoUrl.mockResolvedValue(null);

    expect(await search({ includePhotoUrls: true })).toEqual([
      expect.objectContaining({ id: 'place-01', name: '카페', photoUrl: null, photoUrls: [] }),
    ]);
  });

  it('사진을 생략할 때 지정된 대체 이미지를 유지한다', async () => {
    mockedGetPhotoUrl.mockResolvedValue(null);

    expect((await search({ fallbackPhotoUrl: '/fallback.png' }))[0]?.photoUrl).toBe(
      '/fallback.png'
    );
  });

  it('사진 제외 검색은 사진 필드와 URL을 요청하지 않는다', async () => {
    const result = await search({ includePhotos: false, includePhotoUrls: true });

    expect(mockedGetPhotoUrl).not.toHaveBeenCalled();
    expect(searchByText.mock.lastCall?.[0].fields).not.toContain('photos');
    expect(result[0]).toEqual(expect.objectContaining({ photoUrl: null, photoUrls: [] }));
  });

  it('갤러리가 필요한 경우에만 최대 세 장의 URL을 추가 생성한다', async () => {
    const result = await search({ includePhotoUrls: true });

    expect(mockedGetPhotoUrl).toHaveBeenCalledTimes(4);
    expect(result[0]?.photoUrls).toHaveLength(3);
    expect(mockedGetPhotoUrl).toHaveBeenCalledWith(photos[2], 640);
  });
});
