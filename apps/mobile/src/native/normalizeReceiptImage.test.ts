import { File } from 'expo-file-system';
import { ImageManipulator } from 'expo-image-manipulator';

import { normalizeReceiptImage } from './normalizeReceiptImage';

jest.mock('expo-file-system', () => ({ File: jest.fn() }));
jest.mock('expo-image-manipulator', () => ({
  ImageManipulator: { manipulate: jest.fn() },
  SaveFormat: { JPEG: 'jpeg' },
}));

const mockManipulate = jest.mocked(ImageManipulator.manipulate);
const MockFile = jest.mocked(File);

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

/** resize·renderAsync·saveAsync를 잇는 체이닝 컨텍스트를 흉내 낸다. */
const createMockContext = (saveResults: { uri: string }[]) => {
  const mockResize = jest.fn();
  const mockSaveAsync = jest.fn();

  saveResults.forEach((result) => mockSaveAsync.mockResolvedValueOnce(result));

  const context = { resize: mockResize, renderAsync: jest.fn() };
  mockResize.mockReturnValue(context);
  context.renderAsync.mockResolvedValue({ saveAsync: mockSaveAsync });

  return { context, mockResize, mockSaveAsync };
};

describe('normalizeReceiptImage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('4096 이하이고 5MB 이하면 크기를 조정하지 않고 한 번만 저장한다', async () => {
    const { context, mockResize, mockSaveAsync } = createMockContext([{ uri: 'file://small.jpg' }]);
    mockManipulate.mockReturnValue(context as never);
    MockFile.mockImplementation(() => ({ size: 1024 }) as never);

    const result = await normalizeReceiptImage({
      uri: 'file://original.jpg',
      width: 2000,
      height: 3000,
    });

    expect(mockResize).not.toHaveBeenCalled();
    expect(mockSaveAsync).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ uri: 'file://small.jpg' });
  });

  it('가로가 4096을 넘으면 가로 기준으로 줄인다', async () => {
    const { context, mockResize } = createMockContext([{ uri: 'file://resized.jpg' }]);
    mockManipulate.mockReturnValue(context as never);
    MockFile.mockImplementation(() => ({ size: 1024 }) as never);

    await normalizeReceiptImage({ uri: 'file://original.jpg', width: 5000, height: 3000 });

    expect(mockResize).toHaveBeenCalledWith({ width: 4096 });
  });

  it('세로가 4096을 넘으면 세로 기준으로 줄인다', async () => {
    const { context, mockResize } = createMockContext([{ uri: 'file://resized.jpg' }]);
    mockManipulate.mockReturnValue(context as never);
    MockFile.mockImplementation(() => ({ size: 1024 }) as never);

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
      'file://pass-1.jpg': MAX_FILE_SIZE_BYTES + 1000,
      'file://pass-2.jpg': MAX_FILE_SIZE_BYTES + 500,
      'file://pass-3.jpg': MAX_FILE_SIZE_BYTES - 1,
    };
    MockFile.mockImplementation((uri) => ({ size: sizesByUri[uri as string] }) as never);

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
  });

  it('최소 화질까지 낮춰도 5MB를 넘으면 더 이상 시도하지 않고 마지막 결과를 반환한다', async () => {
    const saveResults = Array.from({ length: 8 }, (_, index) => ({
      uri: `file://pass-${index}.jpg`,
    }));
    const { context, mockSaveAsync } = createMockContext(saveResults);
    mockManipulate.mockReturnValue(context as never);
    MockFile.mockImplementation(() => ({ size: MAX_FILE_SIZE_BYTES + 1 }) as never);

    const result = await normalizeReceiptImage({
      uri: 'file://original.jpg',
      width: 2000,
      height: 3000,
    });

    // NOTE: 0.8에서 시작해 0.1씩 낮추면 0.1(최소치)까지 총 8번(0.8~0.1) 저장을 시도한다.
    expect(mockSaveAsync).toHaveBeenCalledTimes(8);
    expect(result).toEqual({ uri: 'file://pass-7.jpg' });
  });
});
