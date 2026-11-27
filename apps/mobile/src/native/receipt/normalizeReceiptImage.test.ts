import { File } from 'expo-file-system';
import { ImageManipulator } from 'expo-image-manipulator';

import { releaseTemporaryImage } from '@/native/image/temporaryImageFiles';

import { MAX_IMAGE_FILE_SIZE_BYTES } from './imageConstraints';
import { normalizeReceiptImage } from './normalizeReceiptImage';

jest.mock('expo-file-system', () => ({ File: jest.fn() }));
jest.mock('expo-image-manipulator', () => ({
  ImageManipulator: { manipulate: jest.fn() },
  SaveFormat: { JPEG: 'jpeg' },
}));

const mockManipulate = jest.mocked(ImageManipulator.manipulate);
const MockFile = jest.mocked(File);
const mockDelete = jest.fn();

/** resize·renderAsync·saveAsync를 잇는 체이닝 컨텍스트를 흉내 낸다. */
const createMockContext = (saveResults: { uri: string }[]) => {
  const mockResize = jest.fn();
  const mockSaveAsync = jest.fn();

  saveResults.forEach((result) => mockSaveAsync.mockResolvedValueOnce(result));

  const context = { resize: mockResize, renderAsync: jest.fn(), release: jest.fn() };
  const image = { saveAsync: mockSaveAsync, release: jest.fn() };
  mockResize.mockReturnValue(context);
  context.renderAsync.mockResolvedValue(image);

  return { context, image, mockResize, mockSaveAsync };
};

describe('normalizeReceiptImage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    MockFile.mockImplementation(
      (uri) => ({ size: 1024, exists: true, delete: () => mockDelete(uri) }) as never
    );
  });

  afterEach(() => {
    MockFile.mock.calls.forEach(([uri]) => releaseTemporaryImage(uri as string));
  });

  it('4096 이하이고 5MB 이하면 크기를 조정하지 않고 한 번만 저장한다', async () => {
    const { context, image, mockResize, mockSaveAsync } = createMockContext([
      { uri: 'file://small.jpg' },
    ]);
    mockManipulate.mockReturnValue(context as never);

    const result = await normalizeReceiptImage({
      uri: 'file://original.jpg',
      width: 2000,
      height: 3000,
    });

    expect(mockResize).not.toHaveBeenCalled();
    expect(mockSaveAsync).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ uri: 'file://small.jpg' });
    expect(context.release).toHaveBeenCalledTimes(1);
    expect(image.release).toHaveBeenCalledTimes(1);
    expect(mockDelete).not.toHaveBeenCalled();
    releaseTemporaryImage(result.uri);
    expect(mockDelete).toHaveBeenCalledWith('file://small.jpg');
  });

  it('가로가 4096을 넘으면 가로 기준으로 줄인다', async () => {
    const { context, mockResize } = createMockContext([{ uri: 'file://resized.jpg' }]);
    mockManipulate.mockReturnValue(context as never);

    await normalizeReceiptImage({ uri: 'file://original.jpg', width: 5000, height: 3000 });

    expect(mockResize).toHaveBeenCalledWith({ width: 4096 });
  });

  it('세로가 4096을 넘으면 세로 기준으로 줄인다', async () => {
    const { context, mockResize } = createMockContext([{ uri: 'file://resized.jpg' }]);
    mockManipulate.mockReturnValue(context as never);

    await normalizeReceiptImage({ uri: 'file://original.jpg', width: 3000, height: 5000 });

    expect(mockResize).toHaveBeenCalledWith({ height: 4096 });
  });

  it('5MB를 넘으면 5MB 이하가 될 때까지 화질을 낮춰 다시 저장한다', async () => {
    const { context, mockSaveAsync } = createMockContext([
      { uri: 'file://pass-1.jpg' },
      { uri: 'file://pass-2.jpg' },
      { uri: 'file://pass-3.jpg' },
    ]);
    mockManipulate.mockReturnValue(context as never);

    const sizesByUri: Record<string, number> = {
      'file://pass-1.jpg': MAX_IMAGE_FILE_SIZE_BYTES + 1000,
      'file://pass-2.jpg': MAX_IMAGE_FILE_SIZE_BYTES + 500,
      'file://pass-3.jpg': MAX_IMAGE_FILE_SIZE_BYTES - 1,
    };
    MockFile.mockImplementation(
      (uri) =>
        ({ size: sizesByUri[uri as string], exists: true, delete: () => mockDelete(uri) }) as never
    );

    const result = await normalizeReceiptImage({
      uri: 'file://original.jpg',
      width: 2000,
      height: 3000,
    });

    expect(mockSaveAsync).toHaveBeenCalledTimes(3);
    expect(mockSaveAsync).toHaveBeenNthCalledWith(1, { format: 'jpeg', compress: 0.8 });
    expect(mockSaveAsync).toHaveBeenNthCalledWith(2, { format: 'jpeg', compress: 0.7 });
    expect(mockSaveAsync).toHaveBeenNthCalledWith(3, { format: 'jpeg', compress: 0.6 });
    expect(result).toEqual({ uri: 'file://pass-3.jpg' });
    expect(mockDelete.mock.calls).toEqual([['file://pass-1.jpg'], ['file://pass-2.jpg']]);
  });

  it('최소 화질까지 낮춰도 5MB를 넘으면 더 이상 시도하지 않고 오류를 던진다', async () => {
    const saveResults = Array.from({ length: 8 }, (_, index) => ({
      uri: `file://pass-${index}.jpg`,
    }));
    const { context, image, mockSaveAsync } = createMockContext(saveResults);
    mockManipulate.mockReturnValue(context as never);
    MockFile.mockImplementation(
      (uri) =>
        ({
          size: MAX_IMAGE_FILE_SIZE_BYTES + 1,
          exists: true,
          delete: () => mockDelete(uri),
        }) as never
    );

    await expect(
      normalizeReceiptImage({ uri: 'file://original.jpg', width: 2000, height: 3000 })
    ).rejects.toThrow('이미지 용량을 5MB 이하로 줄이지 못했습니다');

    // NOTE: 0.8에서 시작해 0.1씩 낮추면 0.1(최소치)까지 총 8번(0.8~0.1) 저장을 시도한다.
    expect(mockSaveAsync).toHaveBeenCalledTimes(8);
    expect(mockDelete).toHaveBeenCalledTimes(8);
    expect(context.release).toHaveBeenCalledTimes(1);
    expect(image.release).toHaveBeenCalledTimes(1);
  });

  it('재압축 저장 실패 시 이전 파일과 이미지 참조를 정리한다', async () => {
    const { context, image, mockSaveAsync } = createMockContext([{ uri: 'file://oversized.jpg' }]);
    mockSaveAsync.mockRejectedValueOnce(new Error('save failed'));
    mockManipulate.mockReturnValue(context as never);
    MockFile.mockImplementation(
      (uri) =>
        ({
          size: MAX_IMAGE_FILE_SIZE_BYTES + 1,
          exists: true,
          delete: () => mockDelete(uri),
        }) as never
    );
    await expect(
      normalizeReceiptImage({ uri: 'file://original.jpg', width: 100, height: 100 })
    ).rejects.toThrow('save failed');
    expect(mockDelete).toHaveBeenCalledWith('file://oversized.jpg');
    expect(image.release).toHaveBeenCalledTimes(1);
    expect(context.release).toHaveBeenCalledTimes(1);
  });

  it('렌더링 실패 시에도 컨텍스트를 해제한다', async () => {
    const { context } = createMockContext([]);
    context.renderAsync.mockRejectedValue(new Error('render failed'));
    mockManipulate.mockReturnValue(context as never);
    await expect(
      normalizeReceiptImage({ uri: 'file://original.jpg', width: 100, height: 100 })
    ).rejects.toThrow('render failed');
    expect(context.release).toHaveBeenCalledTimes(1);
  });

  it('20회 반복 처리해도 매번 생성 파일과 네이티브 참조를 해제한다', async () => {
    for (let index = 0; index < 20; index += 1) {
      const { context, image } = createMockContext([{ uri: `file://repeat-${index}.jpg` }]);
      mockManipulate.mockReturnValue(context as never);
      const result = await normalizeReceiptImage({
        uri: 'file://gallery.jpg',
        width: 100,
        height: 100,
      });
      releaseTemporaryImage(result.uri);
      expect(context.release).toHaveBeenCalledTimes(1);
      expect(image.release).toHaveBeenCalledTimes(1);
    }
    expect(mockDelete).toHaveBeenCalledTimes(20);
    expect(mockDelete).not.toHaveBeenCalledWith('file://gallery.jpg');
  });
});
