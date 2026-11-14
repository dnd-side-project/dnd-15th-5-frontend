import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

import { toggleLike } from '@/features/map/apis/clients';
import type { RecommendedPlaceDetailResponse } from '@/features/map/apis/dto';
import { useLikedPlaceDetailQuery } from '@/features/map/apis/hooks/useLikedPlaceDetailQuery';
import { LIKED_PLACES_INFINITE_QUERY_KEY } from '@/features/map/apis/hooks/useLikedPlacesInfiniteQuery';
import { getGetNearbyPlacesQueryKey } from '@/features/map/apis/queryKeys';
import { useHomeBottomSheetStore } from '@/features/map/stores/homeBottomSheetStore';
import { useToast } from '@/shared/ui/toast';

import RecommendationPlaceSheet from './RecommendationPlaceSheet';

jest.mock('@/features/map/apis/clients', () => ({ toggleLike: jest.fn() }));
jest.mock('@/features/map/apis/hooks/useLikedPlaceDetailQuery');
jest.mock('@/shared/ui/toast', () => ({ useToast: jest.fn() }));

const mockedDetailQuery = jest.mocked(useLikedPlaceDetailQuery);
const mockedToggleLike = jest.mocked(toggleLike);
const showToast = jest.fn();
const refetch = jest.fn();
const detail: RecommendedPlaceDetailResponse = {
  placeId: 101,
  googlePlaceId: ' google-101 ',
  name: ' 테스트 카페 ',
  category: '카페',
  roadAddress: ' 서울시 중구 ',
  dongName: '중구',
  latitude: 37.5,
  longitude: 127,
  thumbnailUrls: [' photo-1 ', '', 'photo-1', 'photo-2'],
};

const setDetailQuery = (overrides: Record<string, unknown> = {}) => {
  mockedDetailQuery.mockReturnValue({
    detail,
    isLoading: false,
    isError: false,
    refetch,
    ...overrides,
  } as unknown as ReturnType<typeof useLikedPlaceDetailQuery>);
};

function RecordProbe() {
  const { state } = useLocation();
  return <output>{JSON.stringify(state)}</output>;
}

const renderSheet = (client = new QueryClient(), placeId = '101') => {
  const view = render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<RecommendationPlaceSheet placeId={placeId} />} />
          <Route path="/record" element={<RecordProbe />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
  return { ...view, client };
};

beforeEach(() => {
  jest.clearAllMocks();
  mockedToggleLike.mockReset();
  jest.mocked(useToast).mockReturnValue({ showToast, closeToast: jest.fn() });
  useHomeBottomSheetStore.setState({
    activeSheet: { type: 'recommendationPlace', recommendationId: '101' },
  });
  setDetailQuery();
});

it('상세 정보, 중복을 제거한 사진, 외부 지도 링크를 표시한다', () => {
  renderSheet();
  expect(mockedDetailQuery).toHaveBeenCalledWith('101');
  expect(screen.getByRole('heading', { name: '테스트 카페' })).toBeInTheDocument();
  expect(screen.getByText('카페')).toBeInTheDocument();
  expect(screen.getByText('서울시 중구')).toBeInTheDocument();
  expect(screen.getAllByRole('img')).toHaveLength(2);
  expect(screen.getByAltText('테스트 카페 사진 1')).toHaveAttribute('src', 'photo-1');
  expect(screen.getByRole('link', { name: /지도앱에서 확인하기/ })).toHaveAttribute(
    'target',
    '_blank'
  );
  expect(screen.getByRole('link', { name: /지도앱에서 확인하기/ }).getAttribute('href')).toContain(
    'google-101'
  );
  fireEvent.error(screen.getByAltText('테스트 카페 사진 1'));
  expect(
    screen.getByRole('img', { name: '테스트 카페 사진을 불러올 수 없음' })
  ).toBeInTheDocument();
});

it.each(['allPlaces', 'categoryPlaces'] as const)(
  '%s 캐시에서 좋아요를 읽고 양방향 토글 후에도 같은 시트를 유지한다',
  async (source) => {
    const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    client.setQueryData(getGetNearbyPlacesQueryKey(), {
      data:
        source === 'allPlaces'
          ? { allPlaces: [{ placeId: 101, liked: false }] }
          : { categoryPlaces: [{ category: '카페', places: [{ placeId: 101, liked: false }] }] },
    });
    mockedToggleLike
      .mockResolvedValueOnce({ data: { liked: true } })
      .mockResolvedValueOnce({ data: { liked: false } });
    renderSheet(client);
    const sheet = screen.getByRole('region', { name: '테스트 카페' });
    fireEvent.click(screen.getByRole('button', { name: '테스트 카페 좋아요' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: '테스트 카페 좋아요 해제' })).toBeEnabled()
    );
    fireEvent.click(screen.getByRole('button', { name: '테스트 카페 좋아요 해제' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: '테스트 카페 좋아요' })).toBeEnabled()
    );
    expect(screen.getByRole('region', { name: '테스트 카페' })).toBe(sheet);
    expect(useHomeBottomSheetStore.getState().activeSheet).toEqual({
      type: 'recommendationPlace',
      recommendationId: '101',
    });
    expect(mockedToggleLike).toHaveBeenNthCalledWith(1, 101);
    expect(mockedToggleLike).toHaveBeenNthCalledWith(2, 101);
    expect(showToast).toHaveBeenCalledTimes(2);
  }
);

it('캐시가 없는 직접 진입에서도 성공한 좋아요 상태를 표시한다', async () => {
  mockedToggleLike.mockResolvedValue({ data: { liked: true } });
  renderSheet();
  fireEvent.click(screen.getByRole('button', { name: '테스트 카페 좋아요' }));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: '테스트 카페 좋아요 해제' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  );
});

it('외부 캐시 변경을 구독하고 좋아요 목록도 읽는다', () => {
  const { client } = renderSheet();
  act(() =>
    client.setQueryData(LIKED_PLACES_INFINITE_QUERY_KEY, {
      pages: [{ data: { places: [{ placeId: 101 }] } }],
      pageParams: [{}],
    })
  );
  expect(screen.getByRole('button', { name: '테스트 카페 좋아요 해제' })).toHaveAttribute(
    'aria-pressed',
    'true'
  );
});

it('진행 중에는 중복 요청을 막고 실패 시 하트와 상세를 복구한다', async () => {
  let rejectRequest!: (reason: Error) => void;
  mockedToggleLike.mockImplementation(
    () =>
      new Promise((_resolve, reject) => {
        rejectRequest = reject;
      })
  );
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  client.setQueryData(getGetNearbyPlacesQueryKey(), {
    data: { allPlaces: [{ placeId: 101, liked: true }] },
  });
  renderSheet(client);
  fireEvent.click(screen.getByRole('button', { name: '테스트 카페 좋아요 해제' }));
  await waitFor(() => expect(mockedToggleLike).toHaveBeenCalledTimes(1));
  expect(screen.getByRole('button', { name: '테스트 카페 좋아요' })).toBeDisabled();
  await act(async () => rejectRequest(new Error('실패')));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: '테스트 카페 좋아요 해제' })).toBeEnabled()
  );
  expect(screen.getByRole('heading', { name: '테스트 카페' })).toBeInTheDocument();
  expect(showToast).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
});

it('기존 어댑터로 정규화한 가게와 카테고리를 기록 화면에 전달한다', () => {
  renderSheet();
  fireEvent.click(screen.getByRole('link', { name: '기록하기' }));
  expect(JSON.parse(screen.getByRole('status').textContent!)).toEqual({
    shop: {
      id: 'google-101',
      name: '테스트 카페',
      address: '서울시 중구',
      latitude: 37.5,
      longitude: 127,
      photoUrl: ' photo-1 ',
    },
    category: '카페',
  });
});

it('불완전한 기록 정보, 없는 사진과 주소를 처리한다', () => {
  setDetailQuery({ detail: { name: '가게', category: 'unknown' } });
  renderSheet();
  expect(screen.getByText('기타')).toBeInTheDocument();
  expect(screen.getByText('주소 정보가 없어요')).toBeInTheDocument();
  expect(screen.getByLabelText('가게 사진')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '기록하기' })).toBeDisabled();
});

it('로딩 상태를 표시한다', () => {
  setDetailQuery({ detail: undefined, isLoading: true });
  renderSheet();
  expect(screen.getByRole('status', { name: '가게 정보 불러오는 중' })).toBeInTheDocument();
});

it('조회 오류에서 재시도한다', () => {
  setDetailQuery({ detail: undefined, isError: true });
  renderSheet();
  fireEvent.click(screen.getByRole('button', { name: '다시 불러오기' }));
  expect(refetch).toHaveBeenCalledTimes(1);
});

it.each(['101', 'invalid', '0'])('없는 상세나 잘못된 ID(%s)는 빈 상태를 표시한다', (placeId) => {
  setDetailQuery({ detail: undefined });
  renderSheet(undefined, placeId);
  expect(screen.getByRole('heading', { name: '선택한 가게를 찾을 수 없어요' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /좋아요/ })).not.toBeInTheDocument();
});

it('백그라운드 조회 실패에서도 기존 상세를 유지한다', () => {
  setDetailQuery({ isError: true });
  renderSheet();
  expect(screen.getByRole('heading', { name: '테스트 카페' })).toBeInTheDocument();
});
