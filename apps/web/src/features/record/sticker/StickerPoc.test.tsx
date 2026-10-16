import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { isNativeApp, requestToNative } from '@/shared/lib/bridge';

import {
  disposeStickerBackground,
  prepareStickerBackground,
  removeStickerBackground,
} from './removeStickerBackground';
import {
  composeSticker,
  cropStickerImage,
  FULL_STICKER_CROP,
  prepareStickerImage,
} from './stickerImage';
import StickerPoc from './StickerPoc';

jest.mock('@/shared/lib/bridge', () => ({ isNativeApp: jest.fn(), requestToNative: jest.fn() }));

jest.mock('./removeStickerBackground', () => ({
  removeStickerBackground: jest.fn(),
  prepareStickerBackground: jest.fn(),
  disposeStickerBackground: jest.fn(),
}));
jest.mock('./stickerImage', () => ({
  ...jest.requireActual('./stickerImage'),
  prepareStickerImage: jest.fn(),
  composeSticker: jest.fn(),
  cropStickerImage: jest.fn(),
}));

const mockRemove = jest.mocked(removeStickerBackground);
const mockClose = jest.fn();
const photo = new File(['photo'], 'photo.png', { type: 'image/png' });
const croppedPhoto = new File(['cropped'], 'sticker-crop.png', { type: 'image/png' });
const selectPhoto = () =>
  fireEvent.change(screen.getByLabelText('사진 가져오기'), { target: { files: [photo] } });
// NOTE: jsdom은 이미지를 디코딩하지 않아 자르기 화면이 읽는 원본 크기를 직접 지정한다.
const loadCropImage = () => {
  const image = screen.getByAltText('자를 사진');
  Object.defineProperty(image, 'naturalWidth', { value: 300 });
  Object.defineProperty(image, 'naturalHeight', { value: 400 });
  fireEvent.load(image);
};
const upload = () => {
  selectPhoto();
  loadCropImage();
  fireEvent.click(screen.getByRole('button', { name: '자르기 완료' }));
};
const expectAllUrlsReleased = () => {
  const createdUrls = jest.mocked(URL.createObjectURL).mock.results.map(({ value }) => value);
  const releasedUrls = jest.mocked(URL.revokeObjectURL).mock.calls.map(([url]) => url);
  expect(releasedUrls).toEqual(expect.arrayContaining(createdUrls));
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'info').mockImplementation(() => {});
  jest.mocked(isNativeApp).mockReturnValue(false);
  let nextUrl = 0;
  URL.createObjectURL = jest.fn(() => 'blob:photo-' + nextUrl++);
  URL.revokeObjectURL = jest.fn();
  jest.mocked(prepareStickerImage).mockResolvedValue(new Blob());
  jest.mocked(composeSticker).mockResolvedValue(new Blob());
  jest.mocked(cropStickerImage).mockResolvedValue(croppedPhoto);
  mockRemove.mockResolvedValue(new Blob());
});

afterEach(() => jest.restoreAllMocks());

it('사진 선택부터 기록 미리보기와 PNG 다운로드까지 이어진다', async () => {
  render(<StickerPoc onClose={mockClose} />);
  upload();
  await screen.findByAltText('흰색 테두리가 적용된 스티커');
  fireEvent.click(screen.getByRole('button', { name: '이 스티커 사용' }));
  expect(screen.getByAltText('기록에 적용한 스티커')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: '스티커 PNG 다운로드' })).toHaveAttribute(
    'download',
    'chapchap-sticker.png'
  );
  fireEvent.click(screen.getByRole('button', { name: '이미지 변경' }));
  expect(screen.getByText('오늘의 방문을 사진으로 남겨요')).toBeInTheDocument();
  expectAllUrlsReleased();
});

it('가져온 사진은 자르기를 완료한 뒤 자른 사진으로 스티커를 만든다', async () => {
  render(<StickerPoc onClose={mockClose} />);
  selectPhoto();
  expect(screen.getByRole('heading', { name: '사진 자르기' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '자르기 완료' })).toBeDisabled();
  loadCropImage();
  expect(mockRemove).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: '자르기 완료' }));
  await screen.findByAltText('흰색 테두리가 적용된 스티커');
  expect(cropStickerImage).toHaveBeenCalledWith(photo, FULL_STICKER_CROP);
  expect(prepareStickerImage).toHaveBeenCalledWith(croppedPhoto);
});

it('자르기 화면에서 뒤로 가면 사진 선택 화면으로 돌아간다', () => {
  render(<StickerPoc onClose={mockClose} />);
  selectPhoto();
  fireEvent.click(screen.getByRole('button', { name: '사진 다시 선택' }));
  expect(screen.getByText('오늘의 방문을 사진으로 남겨요')).toBeInTheDocument();
  expect(cropStickerImage).not.toHaveBeenCalled();
  expectAllUrlsReleased();
});

it('실패 후 같은 사진으로 다시 시도한다', async () => {
  mockRemove.mockRejectedValueOnce(new Error('처리 실패'));
  render(<StickerPoc onClose={mockClose} />);
  upload();
  expect(await screen.findByRole('alert')).toHaveTextContent('처리 실패');
  expect(screen.getByRole('button', { name: '이 스티커 사용' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
  await screen.findByAltText('흰색 테두리가 적용된 스티커');
  expect(mockRemove).toHaveBeenCalledTimes(2);
});

it('취소한 작업의 늦은 결과를 무시하고 추론 중단 신호를 보낸다', async () => {
  let finish: (blob: Blob) => void = () => {};
  mockRemove.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      })
  );
  render(<StickerPoc onClose={mockClose} />);
  upload();
  await waitFor(() => expect(mockRemove).toHaveBeenCalledTimes(1));
  const signal = mockRemove.mock.calls[0][1];
  fireEvent.click(screen.getByRole('button', { name: '취소' }));
  expect(signal.aborted).toBe(true);
  await act(async () => finish(new Blob()));
  expect(screen.getByText('오늘의 방문을 사진으로 남겨요')).toBeInTheDocument();
  expect(screen.queryByAltText('흰색 테두리가 적용된 스티커')).not.toBeInTheDocument();
});

it('화면을 나가면 이미지 URL을 해제한다', async () => {
  const { unmount } = render(<StickerPoc onClose={mockClose} />);
  upload();
  await screen.findByAltText('흰색 테두리가 적용된 스티커');
  unmount();
  expectAllUrlsReleased();
});

it('일반 웹에서는 이미지 가져오기만 제공한다', () => {
  render(<StickerPoc onClose={mockClose} />);
  expect(screen.queryByRole('button', { name: '촬영하기' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: '이미지 가져오기' })).toBeEnabled();
});

it('앱 카메라 사진을 브릿지로 받아 배경 제거 후 기록 화면에 적용한다', async () => {
  jest.mocked(isNativeApp).mockReturnValue(true);
  jest
    .mocked(requestToNative)
    .mockResolvedValue({ status: 'success', base64: btoa('photo'), mimeType: 'image/jpeg' });
  render(<StickerPoc onClose={mockClose} />);
  fireEvent.click(screen.getByRole('button', { name: '촬영하기' }));
  await screen.findByAltText('흰색 테두리가 적용된 스티커');
  expect(requestToNative).toHaveBeenCalledWith('captureStickerPhoto', {});
  expect(prepareStickerImage).toHaveBeenCalledWith(
    expect.objectContaining({ name: 'sticker-photo.jpg', type: 'image/jpeg' })
  );
  fireEvent.click(screen.getByRole('button', { name: '이 스티커 사용' }));
  expect(screen.getByAltText('기록에 적용한 스티커')).toBeInTheDocument();
  expect(screen.getByLabelText('가게 정보')).toBeInTheDocument();
});

it('앱 촬영 취소는 오류 없이 선택 화면을 유지한다', async () => {
  jest.mocked(isNativeApp).mockReturnValue(true);
  jest.mocked(requestToNative).mockResolvedValue({ status: 'cancelled' });
  render(<StickerPoc onClose={mockClose} />);
  fireEvent.click(screen.getByRole('button', { name: '촬영하기' }));
  await waitFor(() => expect(screen.getByRole('button', { name: '촬영하기' })).toBeEnabled());
  expect(mockRemove).not.toHaveBeenCalled();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

it('카메라 권한 거부 시 설정 안내를 표시한다', async () => {
  jest.mocked(isNativeApp).mockReturnValue(true);
  jest.mocked(requestToNative).mockResolvedValue({ status: 'permissionDenied' });
  render(<StickerPoc onClose={mockClose} />);
  fireEvent.click(screen.getByRole('button', { name: '촬영하기' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('카메라 권한');
  expect(mockRemove).not.toHaveBeenCalled();
});

it('닫기를 누르면 화면을 닫는다', () => {
  render(<StickerPoc onClose={mockClose} />);
  fireEvent.click(screen.getByRole('button', { name: '닫기' }));
  expect(mockClose).toHaveBeenCalled();
});

it('카메라 대기 중 화면을 나가면 늦게 도착한 사진을 처리하지 않는다', async () => {
  jest.mocked(isNativeApp).mockReturnValue(true);
  let finish: (value: {
    status: 'success';
    base64: string;
    mimeType: 'image/jpeg';
  }) => void = () => {};
  jest.mocked(requestToNative).mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      })
  );
  const { unmount } = render(<StickerPoc onClose={mockClose} />);
  fireEvent.click(screen.getByRole('button', { name: '촬영하기' }));
  unmount();
  await act(async () =>
    finish({ status: 'success', base64: btoa('photo'), mimeType: 'image/jpeg' })
  );
  expect(mockRemove).not.toHaveBeenCalled();
});

it('기본 스티커로 기록하기는 배경 제거 없이 기록 화면을 연다', () => {
  render(<StickerPoc onClose={mockClose} />);
  fireEvent.click(screen.getByRole('button', { name: '기본 스티커로 기록하기' }));
  expect(screen.getByAltText('기록에 적용한 스티커')).toBeInTheDocument();
  expect(mockRemove).not.toHaveBeenCalled();
});

it('화면 진입 시 미리 준비하고 화면 이탈 시 Worker를 정리한다', () => {
  const { unmount } = render(<StickerPoc onClose={mockClose} />);
  expect(prepareStickerBackground).toHaveBeenCalledTimes(1);
  expect(mockRemove).not.toHaveBeenCalled();
  unmount();
  expect(disposeStickerBackground).toHaveBeenCalledTimes(1);
});
