import { File } from 'expo-file-system';
import { ImageManipulator } from 'expo-image-manipulator';

import { prepareStickerPhoto } from './prepareStickerPhoto';

jest.mock('expo-file-system', () => ({ File: jest.fn() }));
jest.mock('expo-image-manipulator', () => ({
  ImageManipulator: { manipulate: jest.fn() },
  SaveFormat: { JPEG: 'jpeg' },
}));
const mockDelete = jest.fn();
const image = { saveAsync: jest.fn(), release: jest.fn() };
const context = { resize: jest.fn(), renderAsync: jest.fn(), release: jest.fn() };
const source = { uri: 'file://gallery-original.jpg', width: 3000, height: 2000 };

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(File).mockImplementation(() => ({ exists: true, delete: mockDelete }) as never);
  jest.mocked(ImageManipulator.manipulate).mockReturnValue(context as never);
  context.renderAsync.mockResolvedValue(image);
  image.saveAsync
    .mockReset()
    .mockResolvedValue({ uri: 'file://converted.jpg', base64: 'cGhvdG8=' });
});

it('Base64 변환 후 생성 파일과 네이티브 참조를 정리하고 입력 원본은 유지한다', async () => {
  await expect(prepareStickerPhoto(source)).resolves.toEqual({
    status: 'success',
    base64: 'cGhvdG8=',
    mimeType: 'image/jpeg',
  });
  expect(context.resize).toHaveBeenCalledWith({ width: 1536 });
  expect(File).toHaveBeenCalledWith('file://converted.jpg');
  expect(File).not.toHaveBeenCalledWith(source.uri);
  expect(mockDelete).toHaveBeenCalledTimes(1);
  expect(image.release).toHaveBeenCalledTimes(1);
  expect(context.release).toHaveBeenCalledTimes(1);
});

it.each([undefined, 'x'.repeat(4 * 1024 * 1024 + 1)])(
  '유효하지 않은 Base64도 생성 파일을 정리한다 (%#)',
  async (base64) => {
    image.saveAsync.mockResolvedValue({ uri: 'file://converted.jpg', base64 });
    await expect(prepareStickerPhoto(source)).rejects.toThrow('사진 용량이 너무 커요');
    expect(mockDelete).toHaveBeenCalledTimes(1);
    expect(image.release).toHaveBeenCalledTimes(1);
    expect(context.release).toHaveBeenCalledTimes(1);
  }
);

it('저장 실패 시에도 이미지와 컨텍스트를 해제한다', async () => {
  image.saveAsync.mockRejectedValue(new Error('save failed'));
  await expect(prepareStickerPhoto(source)).rejects.toThrow('save failed');
  expect(image.release).toHaveBeenCalledTimes(1);
  expect(context.release).toHaveBeenCalledTimes(1);
});

it('렌더링 실패 시 컨텍스트를 해제한다', async () => {
  context.renderAsync.mockRejectedValue(new Error('render failed'));
  await expect(prepareStickerPhoto(source)).rejects.toThrow('render failed');
  expect(context.release).toHaveBeenCalledTimes(1);
});
