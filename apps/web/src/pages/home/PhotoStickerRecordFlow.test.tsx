import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import type { ApiResponseVisitedPlaceMarkerResponse } from '@/features/map/apis/dto';
import { useVisitedPlaceStickersQuery } from '@/features/map/apis/hooks/useVisitedPlaceStickersQuery';
import { getGetVisitedPlaceMarkersQueryKey } from '@/features/map/apis/queryKeys';
import type {
  ApiResponseConsumptionCreateResponse,
  ApiResponseConsumptionImageUploadResponse,
} from '@/features/record/apis/dto';
import { useSubmitStickerRecord } from '@/features/record/apis/hooks/useSubmitStickerRecord';
import type { StickerRecordDraft } from '@/features/record/types';
import type {
  ApiResponsePlaceDetailResponse,
  ApiResponsePlaceVisitScrollResponse,
} from '@/features/shop/apis/dto';
import { getGetPlaceDetailQueryKey } from '@/features/shop/apis/queryKeys';
import SelectedPlaceSheet from '@/features/shop/components/selected-place-sheet/SelectedPlaceSheet';
import ShopDetail from '@/features/shop/components/shop-detail/ShopDetail';
import { apiClient } from '@/shared/apis/orvalMutator';

import type { AxiosRequestConfig } from 'axios';

jest.mock('@/shared/apis/orvalMutator', () => ({ apiClient: jest.fn() }));
jest.mock('@/shared/ui/toast', () => ({ useToast: () => ({ showToast: jest.fn() }) }));

const PHOTO_URL = 'https://example.com/saved-photo.png';
const OLD_PHOTO_URL = 'https://example.com/old-photo.png';
const RECORD_DRAFT = {
  shop: {
    id: 'google-101',
    name: '사진 기록 가게',
    address: '서울',
    latitude: 37.5,
    longitude: 127,
    photoUrl: null,
  },
  visitDateTime: { date: new Date(2020, 6, 25), period: 'afternoon' as const },
  amount: '',
  memo: '',
  category: '카페' as const,
} satisfies StickerRecordDraft;

function RecordProbe() {
  const { submit, isSubmitting, submitError } = useSubmitStickerRecord();
  const handleRecordSubmit = () => {
    void submit({ source: 'photo', image: new Blob(['png'], { type: 'image/png' }) }, RECORD_DRAFT);
  };
  return (
    <>
      <button disabled={isSubmitting} onClick={handleRecordSubmit}>
        사진 기록 저장
      </button>
      {submitError && <p role="alert">{submitError}</p>}
    </>
  );
}

function HomeProbe() {
  const { stickers } = useVisitedPlaceStickersQuery();
  return (
    <>
      <output aria-label="지도 스티커 이미지">{stickers[0]?.image}</output>
      <SelectedPlaceSheet placeId="101" />
    </>
  );
}

describe('사진 스티커 기록 후 조회 흐름', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.mocked(apiClient).mockReset();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { staleTime: Infinity, retry: false },
        mutations: { retry: false },
      },
    });
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('사진 업로드·저장 후 신선한 캐시도 갱신해 지도·요약·상세에 같은 사진을 표시한다', async () => {
    const user = userEvent.setup();
    const detailKey = getGetPlaceDetailQueryKey(101);
    const markerKey = getGetVisitedPlaceMarkersQueryKey();
    queryClient.setQueryData<ApiResponseVisitedPlaceMarkerResponse>(markerKey, {
      data: {
        places: [
          {
            placeId: 101,
            placeName: RECORD_DRAFT.shop.name,
            latitude: 37.5,
            longitude: 127,
            visitCount: 1,
            imageUrl: OLD_PHOTO_URL,
          },
        ],
      },
    });
    queryClient.setQueryData<ApiResponsePlaceDetailResponse>(detailKey, {
      data: {
        placeId: 101,
        placeName: RECORD_DRAFT.shop.name,
        recentStickers: [{ imageId: 1, imageUrl: OLD_PHOTO_URL }],
        stickerSummary: [{ imageId: 1, imageUrl: OLD_PHOTO_URL, count: 1 }],
      },
    });

    let isSaved = false;
    const getResponse = ({ url, method, data }: AxiosRequestConfig) => {
      if (url === '/v1/consumptions/images' && method === 'POST') {
        expect(data).toBeInstanceOf(FormData);
        return { data: { imageId: 42 } } satisfies ApiResponseConsumptionImageUploadResponse;
      }
      if (url === '/v1/consumptions' && method === 'POST') {
        expect(data).toMatchObject({ imageId: 42, placeName: RECORD_DRAFT.shop.name });
        expect(data).not.toHaveProperty('stickerItemId');
        isSaved = true;
        return { data: { consumptionId: 10 } } satisfies ApiResponseConsumptionCreateResponse;
      }
      if (!isSaved) throw new Error('저장 전에 불필요한 조회가 발생했습니다');
      if (url === '/v1/consumptions/visited-places') {
        return {
          data: {
            places: [
              {
                placeId: 101,
                placeName: RECORD_DRAFT.shop.name,
                latitude: 37.5,
                longitude: 127,
                visitCount: 2,
                imageUrl: PHOTO_URL,
              },
            ],
          },
        } satisfies ApiResponseVisitedPlaceMarkerResponse;
      }
      if (url === '/v1/consumptions/places/101') {
        return {
          data: {
            placeId: 101,
            placeName: RECORD_DRAFT.shop.name,
            category: '카페',
            stats: { totalVisitCount: 2 },
            recentStickers: [{ imageId: 42, imageUrl: PHOTO_URL }, { itemName: '커피' }],
            stickerSummary: [
              { itemName: '커피', count: 2 },
              { imageId: 42, imageUrl: PHOTO_URL, count: 1 },
            ],
          },
        } satisfies ApiResponsePlaceDetailResponse;
      }
      if (url === '/v1/consumptions/places/101/visits') {
        return {
          data: { visits: [], hasNext: false },
        } satisfies ApiResponsePlaceVisitScrollResponse;
      }
      throw new Error(`예상하지 못한 API 요청: ${url}`);
    };
    // NOTE: 응답은 위에서 실제 DTO로 검사하고, 제네릭 API의 mock 경계에서만 타입을 연결한다.
    jest
      .mocked(apiClient)
      .mockImplementation(
        async <Response,>(config: AxiosRequestConfig) => getResponse(config) as Response
      );

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/record']}>
          <Routes>
            <Route path="/record" element={<RecordProbe />} />
            <Route path="/home" element={<HomeProbe />} />
            <Route
              path="/home/shop/101"
              element={<ShopDetail placeId={101} headerContent={null} onViewOnMap={jest.fn()} />}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
    await user.click(screen.getByRole('button', { name: '사진 기록 저장' }));

    await waitFor(() =>
      expect(screen.getByLabelText('지도 스티커 이미지')).toHaveTextContent(PHOTO_URL)
    );
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: '1번째 스티커 붙이기' }).querySelector('img')
      ).toHaveAttribute('src', PHOTO_URL)
    );
    expect(
      screen.getByRole('button', { name: '2번째 스티커 붙이기' }).querySelector('img')
    ).not.toHaveAttribute('src', PHOTO_URL);
    await user.click(screen.getByRole('link', { name: '상세보기' }));

    const stickerGroup = await screen.findByLabelText('획득한 스티커');
    const images = Array.from(stickerGroup.querySelectorAll('img'));
    expect(images).toHaveLength(3);
    expect(images.filter((image) => image.getAttribute('src') === PHOTO_URL)).toHaveLength(1);
    expect(images.some((image) => image.getAttribute('src') === OLD_PHOTO_URL)).toBe(false);
  });
});
