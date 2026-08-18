import { searchShops } from './searchShops';

type PlacesLibrary = Parameters<typeof searchShops>[0];

const createPlacesLibrary = (places: unknown[]) => {
  const searchByText = jest.fn().mockResolvedValue({ places });

  return {
    library: { Place: { searchByText } } as unknown as PlacesLibrary,
    searchByText,
  };
};

describe('searchShops', () => {
  it('검색 결과를 화면에서 쓰는 형태로 변환한다', async () => {
    const { library } = createPlacesLibrary([
      {
        id: 'place-01',
        displayName: '투썸플레이스 신논현점',
        formattedAddress: '서울특별시 강남구 봉은사로 125 1층',
        photos: [{ getURI: () => 'https://example.com/photo.jpg' }],
      },
    ]);

    const shops = await searchShops(library, '투썸플레이스');

    expect(shops).toEqual([
      {
        id: 'place-01',
        name: '투썸플레이스 신논현점',
        address: '서울특별시 강남구 봉은사로 125 1층',
        photoUrl: 'https://example.com/photo.jpg',
      },
    ]);
  });

  it('이름과 주소가 없으면 빈 문자열로 채운다', async () => {
    const { library } = createPlacesLibrary([
      { id: 'place-02', displayName: null, formattedAddress: null, photos: [] },
    ]);

    const shops = await searchShops(library, '없는 가게');

    expect(shops[0].name).toBe('');
    expect(shops[0].address).toBe('');
  });

  it('사진이 없으면 photoUrl을 null로 둔다', async () => {
    const { library } = createPlacesLibrary([
      {
        id: 'place-03',
        displayName: '사진 없는 가게',
        formattedAddress: '서울특별시 중구',
        photos: [],
      },
    ]);

    const shops = await searchShops(library, '사진 없는 가게');

    expect(shops[0].photoUrl).toBeNull();
  });

  it('검색어와 함께 한국어·국내 지역 옵션을 전달한다', async () => {
    const { library, searchByText } = createPlacesLibrary([]);

    await searchShops(library, '투썸플레이스');

    expect(searchByText).toHaveBeenCalledWith(
      expect.objectContaining({
        textQuery: '투썸플레이스',
        language: 'ko',
        region: 'kr',
      })
    );
  });
});
