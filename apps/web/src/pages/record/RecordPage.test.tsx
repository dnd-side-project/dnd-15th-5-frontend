import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

import { createPhotoSticker } from '@/features/record/sticker/createPhotoSticker';
import { cropStickerImage } from '@/features/record/sticker/stickerImage';
import BottomTabBar from '@/shared/layout/BottomTabBar';
import { isNativeApp, requestToNative } from '@/shared/lib/bridge';
import type { RecordLocationState } from '@/shared/types/recordNavigation';

import RecordPage from './RecordPage';
import ShopSearchPage from './shop/search/ShopSearchPage';

import type { ShopSearchResult } from '@chapchap/shared/shop';

jest.mock('@/shared/lib/bridge', () => ({
  isNativeApp: jest.fn(),
  requestToNative: jest.fn(),
  notifyNative: jest.fn(),
}));

jest.mock('@/features/record/sticker/createPhotoSticker', () => ({
  createPhotoSticker: jest.fn(),
}));
jest.mock('@/features/record/sticker/removeStickerBackground', () => ({
  prepareStickerBackground: jest.fn(),
  disposeStickerBackground: jest.fn(),
}));
jest.mock('@/features/record/sticker/stickerImage', () => ({
  ...jest.requireActual('@/features/record/sticker/stickerImage'),
  cropStickerImage: jest.fn(),
}));
jest.mock('@/features/shop', () => ({
  ShopSearch: ({ onSelectShop }: { onSelectShop: (shop: ShopSearchResult) => void }) => (
    <button onClick={() => onSelectShop(mockSelectedShop)}>검색 결과 선택</button>
  ),
}));

const mockSelectedShop = {
  id: 'shop-01',
  name: '챱챱 카페',
  address: '서울',
  photoUrl: null,
  latitude: 37.5,
  longitude: 127,
};

function LocationProbe() {
  const location = useLocation();
  return <span aria-label="현재 경로">{location.pathname + location.search}</span>;
}

const renderRecordPage = (
  initialEntry:
    string | { pathname: string; search?: string; state?: RecordLocationState } = '/record'
) =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/record" element={<RecordPage />}>
          <Route path="shop/search" element={<ShopSearchPage />} />
        </Route>
        <Route
          path="/home"
          element={
            <>
              <p>홈 화면</p>
              <BottomTabBar />
            </>
          }
        />
      </Routes>
      <LocationProbe />
    </MemoryRouter>
  );

const selectPhoto = async () => {
  const photo = new File(['photo'], 'photo.png', { type: 'image/png' });
  jest.mocked(cropStickerImage).mockResolvedValueOnce(photo);
  fireEvent.change(screen.getByLabelText('사진 가져오기'), { target: { files: [photo] } });
  const image = screen.getByAltText('자를 사진');
  Object.defineProperty(image, 'naturalWidth', { value: 300 });
  Object.defineProperty(image, 'naturalHeight', { value: 400 });
  fireEvent.load(image);
  fireEvent.click(screen.getByRole('button', { name: '자르기 완료' }));
  await screen.findByAltText('흰색 테두리가 적용된 스티커');
  fireEvent.click(screen.getByRole('button', { name: '이 스티커 사용' }));
  jest.mocked(URL.revokeObjectURL).mockClear();
  return screen.getByAltText('기록에 적용한 스티커');
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(isNativeApp).mockReturnValue(false);
  jest.mocked(requestToNative).mockResolvedValue({ opened: true });
  jest.mocked(createPhotoSticker).mockResolvedValue(new Blob());
  URL.createObjectURL = jest.fn(() => 'blob:sticker');
  URL.revokeObjectURL = jest.fn();
});

it('기록하기에 진입하면 방법 선택 카드 없이 바로 스티커 선택 화면을 연다', () => {
  jest.mocked(isNativeApp).mockReturnValue(true);
  renderRecordPage('/home');
  fireEvent.click(screen.getByRole('link', { name: '기록하기' }));
  expect(screen.getByText('오늘의 방문을 사진으로 남겨요')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '촬영하기' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '이미지 가져오기' })).toBeInTheDocument();
  expect(screen.queryByText('직접 작성')).not.toBeInTheDocument();
  expect(screen.queryByText('사진 스티커 만들기 (PoC)')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /영수증 인식하기/ })).not.toBeInTheDocument();
  expect(requestToNative).not.toHaveBeenCalled();
});

it('앱 촬영 결과를 스티커로 만들어 기록 입력 화면에 적용한다', async () => {
  jest.mocked(isNativeApp).mockReturnValue(true);
  jest.mocked(requestToNative).mockResolvedValueOnce({
    status: 'success',
    base64: btoa('photo'),
    mimeType: 'image/jpeg',
  });
  renderRecordPage();
  fireEvent.click(screen.getByRole('button', { name: '촬영하기' }));
  await screen.findByAltText('흰색 테두리가 적용된 스티커');
  fireEvent.click(screen.getByRole('button', { name: '이 스티커 사용' }));
  expect(screen.getByAltText('기록에 적용한 스티커')).toBeInTheDocument();
  expect(screen.getByText('소비정보를 입력해주세요')).toBeInTheDocument();
  expect(requestToNative).toHaveBeenCalledTimes(1);
  expect(requestToNative).toHaveBeenCalledWith('captureStickerPhoto', {});
});

it('기록 폼의 영수증 버튼을 누를 때만 카메라를 열고 입력 내용과 스티커를 유지한다', async () => {
  jest.mocked(isNativeApp).mockReturnValue(true);
  let finish: (result: { opened: true }) => void = () => {};
  jest.mocked(requestToNative).mockReturnValueOnce(
    new Promise((resolve) => {
      finish = resolve;
    })
  );
  renderRecordPage();
  const sticker = await selectPhoto();
  fireEvent.change(screen.getByRole('textbox', { name: '메모' }), {
    target: { value: '친구와 방문' },
  });
  fireEvent.change(screen.getByRole('textbox', { name: '금액' }), { target: { value: '5500' } });
  expect(requestToNative).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: /영수증 인식하기/ }));
  await waitFor(() => expect(requestToNative).toHaveBeenCalledWith('captureReceipt', {}));
  expect(screen.getByRole('button', { name: /카메라를 열고 있어요/ })).toBeDisabled();
  finish({ opened: true });
  await waitFor(() =>
    expect(screen.getByRole('button', { name: /영수증 인식하기/ })).toBeEnabled()
  );
  expect(screen.getByAltText('기록에 적용한 스티커')).toBe(sticker);
  expect(screen.getByRole('textbox', { name: '메모' })).toHaveValue('친구와 방문');
  expect(screen.getByRole('textbox', { name: '금액' })).toHaveValue('5,500');
  expect(screen.getByLabelText('현재 경로')).toHaveTextContent('/record');
});

it('영수증 카메라를 열지 못하면 작성 내용을 유지한 채 다시 시도할 수 있다', async () => {
  jest.mocked(isNativeApp).mockReturnValue(true);
  jest.mocked(requestToNative).mockRejectedValueOnce(new Error('카메라 권한이 필요합니다'));
  renderRecordPage();
  await selectPhoto();
  fireEvent.click(screen.getByRole('button', { name: /영수증 인식하기/ }));
  expect(await screen.findByRole('alert')).toHaveTextContent('카메라 권한이 필요합니다');
  fireEvent.click(screen.getByRole('button', { name: /영수증 인식하기/ }));
  await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
  expect(requestToNative).toHaveBeenCalledTimes(2);
  expect(screen.getByAltText('기록에 적용한 스티커')).toBeInTheDocument();
});

it('일반 웹의 기록 폼에서는 영수증 촬영 대신 앱 이용 안내를 표시한다', async () => {
  renderRecordPage();
  await selectPhoto();
  fireEvent.click(screen.getByRole('button', { name: /영수증 인식하기/ }));
  expect(screen.getByRole('status')).toHaveTextContent('영수증 인식은 앱에서 사용할 수 있어요');
  expect(requestToNative).not.toHaveBeenCalled();
});

it('가게에서 전달한 정보와 지난 기록 월을 기록 폼에 유지한다', async () => {
  renderRecordPage({
    pathname: '/record',
    search: '?yearMonth=2020-07',
    state: { shop: mockSelectedShop, category: '음식점' },
  });
  await selectPhoto();
  expect(screen.getByText('챱챱 카페')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '음식점' })).toHaveAttribute('aria-pressed', 'true');
  expect(
    screen.getByRole('button', { name: /방문 일시 변경, 2020년 7월 31일/ })
  ).toBeInTheDocument();
});

it('기존 가게 검색 화면으로 이동하고 가게 선택 후 스티커와 입력 내용을 유지한다', async () => {
  renderRecordPage('/record?yearMonth=2020-07');
  const sticker = await selectPhoto();
  fireEvent.change(screen.getByRole('textbox', { name: '메모' }), {
    target: { value: '점심 방문' },
  });
  fireEvent.change(screen.getByRole('textbox', { name: '금액' }), { target: { value: '5500' } });
  fireEvent.click(screen.getByRole('button', { name: '운동' }));
  fireEvent.click(screen.getByRole('button', { name: '가게 정보 검색' }));
  expect(screen.getByLabelText('현재 경로')).toHaveTextContent(
    '/record/shop/search?yearMonth=2020-07'
  );
  expect(screen.queryByRole('form', { name: '소비정보' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: '뒤로 가기' })).toBeInTheDocument();
  expect(URL.revokeObjectURL).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: '검색 결과 선택' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByText('챱챱 카페')).toBeInTheDocument();
  expect(screen.getByAltText('기록에 적용한 스티커')).toBe(sticker);
  expect(screen.getByRole('textbox', { name: '메모' })).toHaveValue('점심 방문');
  expect(screen.getByRole('textbox', { name: '금액' })).toHaveValue('5,500');
  expect(screen.getByRole('button', { name: '운동' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByLabelText('현재 경로')).toHaveTextContent('/record?yearMonth=2020-07');
  expect(createPhotoSticker).toHaveBeenCalledTimes(1);
});

it('가게 검색에서 뒤로 돌아오면 선택을 바꾸지 않고 작성 중이던 폼을 유지한다', async () => {
  renderRecordPage();
  const sticker = await selectPhoto();
  fireEvent.change(screen.getByRole('textbox', { name: '메모' }), {
    target: { value: '검색 전 메모' },
  });
  fireEvent.click(screen.getByRole('button', { name: '가게 정보 검색' }));
  fireEvent.click(screen.getByRole('button', { name: '뒤로 가기' }));
  expect(screen.getByLabelText('현재 경로')).toHaveTextContent('/record');
  expect(screen.getByRole('textbox', { name: '메모' })).toHaveValue('검색 전 메모');
  expect(screen.getByAltText('기록에 적용한 스티커')).toBe(sticker);
  expect(screen.getByRole('button', { name: '가게 정보 검색' })).toHaveTextContent(
    '가게명 검색하기'
  );
});

it('가게 검색에서 작성을 종료할 때 확인한 뒤 홈으로 돌아가며 이미지 URL을 정리한다', async () => {
  renderRecordPage();
  await selectPhoto();
  fireEvent.click(screen.getByRole('button', { name: '가게 정보 검색' }));
  fireEvent.click(screen.getByRole('button', { name: '기록 닫고 홈으로 이동' }));
  expect(screen.getByRole('dialog', { name: '기록 작성을 그만둘까요?' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '나가기' }));
  expect(screen.getByText('홈 화면')).toBeInTheDocument();
  expect(jest.mocked(URL.revokeObjectURL).mock.calls.map(([url]) => url)).toContain('blob:sticker');
});

it('닫기를 누르면 홈으로 돌아간다', () => {
  renderRecordPage();
  fireEvent.click(screen.getByRole('button', { name: '닫기' }));
  expect(screen.getByText('홈 화면')).toBeInTheDocument();
});
