import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';

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
import StickerRecordFlow from './StickerRecordFlow';

jest.mock('@/shared/lib/bridge', () => ({ isNativeApp: jest.fn(), requestToNative: jest.fn() }));
jest.mock('@/shared/assets/images/ios-stickers/coffee.png', () => 'coffee.png');
jest.mock('@/shared/assets/images/ios-stickers/cake.png', () => 'cake.png');

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
const originalFetch = globalThis.fetch;
const defaultStickerImage = new Blob(['emoji'], { type: 'image/png' });
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
  globalThis.fetch = jest.fn().mockResolvedValue({
    ok: true,
    blob: async () => defaultStickerImage,
  });
  jest.mocked(isNativeApp).mockReturnValue(false);
  let nextUrl = 0;
  URL.createObjectURL = jest.fn(() => 'blob:photo-' + nextUrl++);
  URL.revokeObjectURL = jest.fn();
  jest.mocked(prepareStickerImage).mockResolvedValue(new Blob());
  jest.mocked(composeSticker).mockResolvedValue(new Blob());
  jest.mocked(cropStickerImage).mockResolvedValue(croppedPhoto);
  mockRemove.mockResolvedValue(new Blob());
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

it('사진 선택부터 기록 미리보기와 PNG 다운로드까지 이어진다', async () => {
  render(<StickerRecordFlow onClose={mockClose} />);
  upload();
  await screen.findByAltText('흰색 테두리가 적용된 스티커');
  fireEvent.click(screen.getByRole('button', { name: '이 스티커 사용' }));
  expect(screen.getByAltText('기록에 적용한 스티커')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: '스티커 PNG 다운로드' })).toHaveAttribute(
    'download',
    'chapchap-sticker.png'
  );
  fireEvent.click(screen.getByRole('button', { name: '이미지 변경' }));
  expect(screen.getByRole('dialog', { name: '이미지 변경' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '취소하기' }));
  expect(screen.getByAltText('기록에 적용한 스티커')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '뒤로 가기' }));
  expect(screen.getByText('오늘의 방문을 사진으로 남겨요')).toBeInTheDocument();
  expectAllUrlsReleased();
});

it('가져온 사진은 자르기를 완료한 뒤 자른 사진으로 스티커를 만든다', async () => {
  render(<StickerRecordFlow onClose={mockClose} />);
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
  render(<StickerRecordFlow onClose={mockClose} />);
  selectPhoto();
  fireEvent.click(screen.getByRole('button', { name: '사진 다시 선택' }));
  expect(screen.getByText('오늘의 방문을 사진으로 남겨요')).toBeInTheDocument();
  expect(cropStickerImage).not.toHaveBeenCalled();
  expectAllUrlsReleased();
});

it('실패 후 같은 사진으로 다시 시도한다', async () => {
  mockRemove.mockRejectedValueOnce(new Error('처리 실패'));
  render(<StickerRecordFlow onClose={mockClose} />);
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
  render(<StickerRecordFlow onClose={mockClose} />);
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
  const { unmount } = render(<StickerRecordFlow onClose={mockClose} />);
  upload();
  await screen.findByAltText('흰색 테두리가 적용된 스티커');
  unmount();
  expectAllUrlsReleased();
});

it('일반 웹에서는 이미지 가져오기만 제공한다', () => {
  render(<StickerRecordFlow onClose={mockClose} />);
  expect(screen.queryByRole('button', { name: '촬영하기' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: '이미지 가져오기' })).toBeEnabled();
});

it.each([false, true])(
  '앱 여부가 %s여도 가져온 사진은 사진 다시 고르기로 갤러리를 연다',
  async (isApp) => {
    jest.mocked(isNativeApp).mockReturnValue(isApp);
    render(<StickerRecordFlow onClose={mockClose} />);
    const input = screen.getByLabelText('사진 가져오기');
    const click = jest.spyOn(input, 'click');
    upload();
    await screen.findByAltText('흰색 테두리가 적용된 스티커');
    expect(screen.getByRole('button', { name: '이 스티커 사용' })).toBeEnabled();
    expect(screen.queryByRole('button', { name: '다시 찍기' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '사진 다시 고르기' }));
    expect(click).toHaveBeenCalledTimes(1);
    expect(requestToNative).not.toHaveBeenCalled();
  }
);

it('촬영한 사진은 자르기 없이 스티커 생성으로 넘어가고 다시 찍기로 카메라를 연다', async () => {
  jest.mocked(isNativeApp).mockReturnValue(true);
  jest
    .mocked(requestToNative)
    .mockResolvedValueOnce({ status: 'success', base64: btoa('photo'), mimeType: 'image/jpeg' })
    .mockResolvedValueOnce({ status: 'cancelled' });
  render(<StickerRecordFlow onClose={mockClose} />);
  fireEvent.click(screen.getByRole('button', { name: '촬영하기' }));
  await screen.findByAltText('흰색 테두리가 적용된 스티커');
  expect(cropStickerImage).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: '이 스티커 사용' })).toBeEnabled();
  expect(screen.queryByRole('button', { name: '사진 다시 고르기' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '다시 찍기' }));
  await waitFor(() => expect(screen.getByRole('button', { name: '다시 찍기' })).toBeEnabled());
  expect(requestToNative).toHaveBeenCalledTimes(2);
  expect(requestToNative).toHaveBeenLastCalledWith('captureStickerPhoto', {});
});

it('촬영한 사진의 배경 제거를 다시 시도해도 다시 찍기 동작을 유지한다', async () => {
  jest.mocked(isNativeApp).mockReturnValue(true);
  jest
    .mocked(requestToNative)
    .mockResolvedValue({ status: 'success', base64: btoa('photo'), mimeType: 'image/jpeg' });
  mockRemove.mockRejectedValueOnce(new Error('처리 실패'));
  render(<StickerRecordFlow onClose={mockClose} />);
  fireEvent.click(screen.getByRole('button', { name: '촬영하기' }));
  await screen.findByRole('alert');
  fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
  await screen.findByAltText('흰색 테두리가 적용된 스티커');
  expect(screen.getByRole('button', { name: '다시 찍기' })).toBeEnabled();
  expect(screen.queryByRole('button', { name: '사진 다시 고르기' })).not.toBeInTheDocument();
});

it('앱 카메라 사진을 브릿지로 받아 배경 제거 후 기록 화면에 적용한다', async () => {
  jest.mocked(isNativeApp).mockReturnValue(true);
  jest
    .mocked(requestToNative)
    .mockResolvedValue({ status: 'success', base64: btoa('photo'), mimeType: 'image/jpeg' });
  render(<StickerRecordFlow onClose={mockClose} />);
  fireEvent.click(screen.getByRole('button', { name: '촬영하기' }));
  await screen.findByAltText('흰색 테두리가 적용된 스티커');
  expect(requestToNative).toHaveBeenCalledWith('captureStickerPhoto', {});
  expect(prepareStickerImage).toHaveBeenCalledWith(
    expect.objectContaining({ name: 'sticker-photo.jpg', type: 'image/jpeg' })
  );
  fireEvent.click(screen.getByRole('button', { name: '이 스티커 사용' }));
  expect(screen.getByAltText('기록에 적용한 스티커')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '가게 정보 검색' })).toBeInTheDocument();
});

it('앱 촬영 취소는 오류 없이 선택 화면을 유지한다', async () => {
  jest.mocked(isNativeApp).mockReturnValue(true);
  jest.mocked(requestToNative).mockResolvedValue({ status: 'cancelled' });
  render(<StickerRecordFlow onClose={mockClose} />);
  fireEvent.click(screen.getByRole('button', { name: '촬영하기' }));
  await waitFor(() => expect(screen.getByRole('button', { name: '촬영하기' })).toBeEnabled());
  expect(mockRemove).not.toHaveBeenCalled();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

it('카메라 권한 거부 시 설정 안내를 표시한다', async () => {
  jest.mocked(isNativeApp).mockReturnValue(true);
  jest.mocked(requestToNative).mockResolvedValue({ status: 'permissionDenied' });
  render(<StickerRecordFlow onClose={mockClose} />);
  fireEvent.click(screen.getByRole('button', { name: '촬영하기' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('카메라 권한');
  expect(mockRemove).not.toHaveBeenCalled();
});

it('닫기를 누르면 화면을 닫는다', () => {
  render(<StickerRecordFlow onClose={mockClose} />);
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
  const { unmount } = render(<StickerRecordFlow onClose={mockClose} />);
  fireEvent.click(screen.getByRole('button', { name: '촬영하기' }));
  unmount();
  await act(async () =>
    finish({ status: 'success', base64: btoa('photo'), mimeType: 'image/jpeg' })
  );
  expect(mockRemove).not.toHaveBeenCalled();
});

it('테두리가 포함된 기본 스티커 PNG 원본을 기록과 다운로드에 적용한다', async () => {
  render(<StickerRecordFlow onClose={mockClose} />);
  fireEvent.click(screen.getByRole('button', { name: '기본 스티커로 기록하기' }));
  expect(screen.getByRole('heading', { name: '스티커를 골라주세요' })).toBeInTheDocument();
  expect(screen.queryByAltText('기록에 적용한 스티커')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: '커피 스티커' })).toHaveAttribute(
    'aria-pressed',
    'true'
  );
  fireEvent.click(screen.getByRole('button', { name: '케이크 스티커' }));
  expect(screen.getByRole('button', { name: '커피 스티커' })).toHaveAttribute(
    'aria-pressed',
    'false'
  );
  expect(screen.getByRole('button', { name: '케이크 스티커' })).toHaveAttribute(
    'aria-pressed',
    'true'
  );
  fireEvent.click(screen.getByRole('button', { name: '이 스티커로 기록하기' }));
  expect(screen.getByRole('button', { name: '이 스티커로 기록하기' })).toHaveAttribute(
    'aria-disabled',
    'true'
  );
  const sticker = await screen.findByAltText('기록에 적용한 스티커');
  expect(fetch).toHaveBeenCalledWith('cake.png', { signal: expect.any(AbortSignal) });
  expect(composeSticker).not.toHaveBeenCalled();
  expect(URL.createObjectURL).toHaveBeenCalledWith(defaultStickerImage);
  expect(sticker).toHaveAttribute('src', 'blob:photo-0');
  expect(screen.getByRole('link', { name: '스티커 PNG 다운로드' })).toHaveAttribute(
    'href',
    'blob:photo-0'
  );
  expect(mockRemove).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: '이미지 변경' }));
  expect(URL.revokeObjectURL).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: '취소하기' }));
  fireEvent.click(screen.getByRole('button', { name: '뒤로 가기' }));
  expectAllUrlsReleased();
});

const openRecordedDefault = async () => {
  fireEvent.click(screen.getByRole('button', { name: '기본 스티커로 기록하기' }));
  fireEvent.click(screen.getByRole('button', { name: '이 스티커로 기록하기' }));
  return screen.findByAltText('기록에 적용한 스티커');
};

it.each([false, true])(
  '앱 여부가 %s이면 촬영 메뉴를 구분하고 취소 시 기록을 유지한다',
  async (isApp) => {
    jest.mocked(isNativeApp).mockReturnValue(isApp);
    render(<StickerRecordFlow onClose={mockClose} />);
    const sticker = await openRecordedDefault();
    fireEvent.change(screen.getByRole('textbox', { name: '메모' }), {
      target: { value: '유지할 메모' },
    });
    fireEvent.click(screen.getByRole('button', { name: '이미지 변경' }));
    const sheet = screen.getByRole('dialog', { name: '이미지 변경' });
    if (isApp) expect(within(sheet).getByRole('button', { name: '사진찍기' })).toBeEnabled();
    else expect(within(sheet).queryByRole('button', { name: '사진찍기' })).not.toBeInTheDocument();
    expect(within(sheet).getByRole('button', { name: '이미지 가져오기' })).toBeEnabled();
    expect(within(sheet).getByRole('button', { name: '기본 스티커로 기록하기' })).toBeEnabled();
    fireEvent.click(within(sheet).getByRole('button', { name: '취소하기' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByAltText('기록에 적용한 스티커')).toBe(sticker);
    expect(screen.getByRole('textbox', { name: '메모' })).toHaveValue('유지할 메모');
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
  }
);

it.each(['escape', 'outside'])(
  '이미지 변경 시트를 %s로 닫아도 기록 화면을 유지한다',
  async (method) => {
    const { container } = render(<StickerRecordFlow onClose={mockClose} />);
    await openRecordedDefault();
    fireEvent.click(screen.getByRole('button', { name: '이미지 변경' }));
    if (method === 'escape') fireEvent.keyDown(window, { key: 'Escape' });
    else fireEvent.pointerDown(container.querySelector('[data-slot="overlay"]')!);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByAltText('기록에 적용한 스티커')).toBeVisible();
  }
);

it('시트에서 가져오기를 선택하면 파일 선택을 열고 자르기를 취소하면 기존 기록으로 돌아온다', async () => {
  render(<StickerRecordFlow onClose={mockClose} />);
  const sticker = await openRecordedDefault();
  const input = screen.getByLabelText('사진 가져오기');
  const click = jest.spyOn(input, 'click');
  fireEvent.change(screen.getByRole('textbox', { name: '금액' }), { target: { value: '5500' } });
  fireEvent.click(screen.getByRole('button', { name: '이미지 변경' }));
  fireEvent.click(screen.getByRole('button', { name: '이미지 가져오기' }));
  expect(click).toHaveBeenCalledTimes(1);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByAltText('기록에 적용한 스티커')).toBeVisible();
  selectPhoto();
  expect(screen.getByRole('heading', { name: '사진 자르기' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '사진 다시 선택' }));
  expect(screen.getByAltText('기록에 적용한 스티커')).toBe(sticker);
  expect(screen.getByRole('textbox', { name: '금액' })).toHaveValue('5,500');
  expect(URL.revokeObjectURL).not.toHaveBeenCalledWith(sticker.getAttribute('src'));
});

it('시트에서 기본 스티커를 바꿔도 기록 폼의 입력 내용은 유지한다', async () => {
  render(<StickerRecordFlow onClose={mockClose} />);
  const sticker = await openRecordedDefault();
  const previousUrl = sticker.getAttribute('src');
  fireEvent.change(screen.getByRole('textbox', { name: '메모' }), {
    target: { value: '방문 메모' },
  });
  fireEvent.click(screen.getByRole('button', { name: '이미지 변경' }));
  fireEvent.click(screen.getByRole('button', { name: '기본 스티커로 기록하기' }));
  fireEvent.click(screen.getByRole('button', { name: '케이크 스티커' }));
  fireEvent.click(screen.getByRole('button', { name: '이 스티커로 기록하기' }));
  await waitFor(() => expect(sticker).not.toHaveAttribute('src', previousUrl));
  expect(screen.getByRole('textbox', { name: '메모' })).toHaveValue('방문 메모');
  expect(URL.revokeObjectURL).toHaveBeenCalledWith(previousUrl);
});

it('기본 스티커 변경을 취소하면 기존 스티커로 돌아온다', async () => {
  render(<StickerRecordFlow onClose={mockClose} />);
  const sticker = await openRecordedDefault();
  fireEvent.click(screen.getByRole('button', { name: '이미지 변경' }));
  fireEvent.click(screen.getByRole('button', { name: '기본 스티커로 기록하기' }));
  fireEvent.click(screen.getByRole('button', { name: '닫기' }));
  expect(screen.getByAltText('기록에 적용한 스티커')).toBe(sticker);
  expect(URL.revokeObjectURL).not.toHaveBeenCalled();
});

it('시트에서 앱 카메라를 열었다 취소하면 기존 스티커와 기록을 유지한다', async () => {
  jest.mocked(isNativeApp).mockReturnValue(true);
  jest.mocked(requestToNative).mockResolvedValue({ status: 'cancelled' });
  render(<StickerRecordFlow onClose={mockClose} />);
  const sticker = await openRecordedDefault();
  fireEvent.click(screen.getByRole('button', { name: '이미지 변경' }));
  fireEvent.click(screen.getByRole('button', { name: '사진찍기' }));
  await waitFor(() => expect(screen.getByRole('button', { name: '이미지 변경' })).toBeEnabled());
  expect(requestToNative).toHaveBeenCalledWith('captureStickerPhoto', {});
  expect(screen.getByAltText('기록에 적용한 스티커')).toBe(sticker);
  expect(URL.revokeObjectURL).not.toHaveBeenCalled();
});

it('새 사진 처리를 취소하면 늦은 결과를 무시하고 이전 스티커와 입력을 복원한다', async () => {
  render(<StickerRecordFlow onClose={mockClose} />);
  const sticker = await openRecordedDefault();
  fireEvent.change(screen.getByRole('textbox', { name: '메모' }), {
    target: { value: '이전 메모' },
  });
  let finish: (blob: Blob) => void = () => {};
  mockRemove.mockReturnValueOnce(
    new Promise((resolve) => {
      finish = resolve;
    })
  );
  fireEvent.click(screen.getByRole('button', { name: '이미지 변경' }));
  fireEvent.click(screen.getByRole('button', { name: '이미지 가져오기' }));
  upload();
  await waitFor(() => expect(mockRemove).toHaveBeenCalledTimes(1));
  fireEvent.click(screen.getByRole('button', { name: '취소' }));
  await act(async () => finish(new Blob()));
  expect(screen.getByAltText('기록에 적용한 스티커')).toBe(sticker);
  expect(screen.getByRole('textbox', { name: '메모' })).toHaveValue('이전 메모');
  expect(mockRemove.mock.calls[0][1].aborted).toBe(true);
});

it('기본 스티커를 불러오지 못하면 선택 화면에서 다시 시도할 수 있다', async () => {
  jest.mocked(fetch).mockResolvedValueOnce({ ok: false } as Response);
  render(<StickerRecordFlow onClose={mockClose} />);
  fireEvent.click(screen.getByRole('button', { name: '기본 스티커로 기록하기' }));
  fireEvent.click(screen.getByRole('button', { name: '이 스티커로 기록하기' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('기본 스티커를 불러오지 못했어요');
  expect(composeSticker).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: '이 스티커로 기록하기' }));
  await screen.findByAltText('기록에 적용한 스티커');
});

it('기본 스티커를 불러오다 닫으면 늦게 완료되어도 기록 화면을 열지 않는다', async () => {
  let finish: (response: Response) => void = () => {};
  jest.mocked(fetch).mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      })
  );
  render(<StickerRecordFlow onClose={mockClose} />);
  fireEvent.click(screen.getByRole('button', { name: '기본 스티커로 기록하기' }));
  fireEvent.click(screen.getByRole('button', { name: '이 스티커로 기록하기' }));
  await waitFor(() => expect(fetch).toHaveBeenCalled());
  fireEvent.click(screen.getByRole('button', { name: '닫기' }));
  await act(async () => finish({ ok: true, blob: async () => defaultStickerImage } as Response));
  expect(screen.getByText('오늘의 방문을 사진으로 남겨요')).toBeInTheDocument();
  expect(screen.queryByAltText('기록에 적용한 스티커')).not.toBeInTheDocument();
  expect(URL.createObjectURL).not.toHaveBeenCalled();
});

it.each([
  ['음식점', '햄버거'],
  ['편의점/마트', '사과'],
  ['취미/놀거리', '카메라'],
  ['쇼핑', '선물'],
  ['운동', '축구공'],
  ['미용/뷰티', '립스틱'],
  ['기타', '고양이'],
])('%s 카테고리의 스티커를 표시하고 선택한 뒤에만 확정할 수 있다', (category, stickerName) => {
  render(<StickerRecordFlow onClose={mockClose} />);
  fireEvent.click(screen.getByRole('button', { name: '기본 스티커로 기록하기' }));
  fireEvent.click(screen.getByRole('button', { name: category }));
  expect(screen.queryByRole('button', { name: '커피 스티커' })).not.toBeInTheDocument();
  const stickers = screen.getByRole('group', { name: `${category} 스티커` });
  expect(within(stickers).getAllByRole('button')).toHaveLength(8);
  expect(screen.getByRole('button', { name: '이 스티커로 기록하기' })).toBeDisabled();
  fireEvent.click(within(stickers).getByRole('button', { name: `${stickerName} 스티커` }));
  expect(screen.getByRole('button', { name: '이 스티커로 기록하기' })).toBeEnabled();
  fireEvent.click(screen.getByRole('button', { name: '카페' }));
  expect(screen.getByRole('button', { name: '커피 스티커' })).toHaveAttribute(
    'aria-pressed',
    'false'
  );
  expect(screen.getByRole('button', { name: '이 스티커로 기록하기' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: '쿠키 스티커' }));
  expect(screen.getByRole('button', { name: '이 스티커로 기록하기' })).toBeEnabled();
});

it('기본 스티커 선택 화면을 닫으면 기록 방법 선택으로 돌아간다', () => {
  render(<StickerRecordFlow onClose={mockClose} />);
  fireEvent.click(screen.getByRole('button', { name: '기본 스티커로 기록하기' }));
  fireEvent.click(screen.getByRole('button', { name: '닫기' }));
  expect(screen.getByText('오늘의 방문을 사진으로 남겨요')).toBeInTheDocument();
  expect(mockClose).not.toHaveBeenCalled();
});

it('화면 진입 시 미리 준비하고 화면 이탈 시 Worker를 정리한다', () => {
  const { unmount } = render(<StickerRecordFlow onClose={mockClose} />);
  expect(prepareStickerBackground).toHaveBeenCalledTimes(1);
  expect(mockRemove).not.toHaveBeenCalled();
  unmount();
  expect(disposeStickerBackground).toHaveBeenCalledTimes(1);
});
