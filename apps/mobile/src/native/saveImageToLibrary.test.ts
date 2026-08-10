import { File } from 'expo-file-system';
import { Asset, requestPermissionsAsync } from 'expo-media-library';

import { saveImageToLibrary } from './saveImageToLibrary';

jest.mock('expo-file-system', () => ({
  File: jest.fn(),
  Paths: { cache: 'file:///cache/' },
}));

jest.mock('expo-media-library', () => ({
  Asset: { create: jest.fn() },
  requestPermissionsAsync: jest.fn(),
}));

const mockCreateFile = jest.fn();
const mockWriteFile = jest.fn();
const mockDeleteFile = jest.fn();
const mockTemporaryFile = {
  create: mockCreateFile,
  delete: mockDeleteFile,
  exists: true,
  uri: 'file:///cache/report.png',
  write: mockWriteFile,
};
const MockFile = jest.mocked(File);
const mockCreateAsset = jest.mocked(Asset.create);
const mockRequestPermissions = jest.mocked(requestPermissionsAsync);

describe('saveImageToLibrary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    MockFile.mockImplementation(() => mockTemporaryFile as unknown as File);
    mockRequestPermissions.mockResolvedValue({ granted: true } as never);
    mockCreateAsset.mockResolvedValue({} as Asset);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('쓰기 전용 사진 권한을 요청하고 PNG를 사진 보관함에 저장한다', async () => {
    await saveImageToLibrary('base64-image', '리포트.png');

    expect(mockRequestPermissions).toHaveBeenCalledWith(true, []);
    expect(MockFile).toHaveBeenCalledWith('file:///cache/', expect.stringMatching(/-리포트\.png$/));
    expect(mockCreateFile).toHaveBeenCalledTimes(1);
    expect(mockWriteFile).toHaveBeenCalledWith('base64-image', { encoding: 'base64' });
    expect(mockCreateAsset).toHaveBeenCalledWith(mockTemporaryFile.uri);
    expect(mockDeleteFile).toHaveBeenCalledTimes(1);
  });

  it('이미지 정보가 비어 있으면 권한을 요청하지 않는다', async () => {
    await expect(saveImageToLibrary('', '리포트.png')).rejects.toThrow(
      '저장할 이미지 정보가 올바르지 않습니다'
    );
    expect(mockRequestPermissions).not.toHaveBeenCalled();
  });

  it('같은 시각에 시작한 요청마다 고유한 임시 파일 이름을 생성한다', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(1_000);

    await Promise.all([
      saveImageToLibrary('first-image', '리포트.png'),
      saveImageToLibrary('second-image', '리포트.png'),
    ]);

    const firstFileName = MockFile.mock.calls[0]?.[1];
    const secondFileName = MockFile.mock.calls[1]?.[1];

    expect(firstFileName).toMatch(/^1000-\d+-리포트\.png$/);
    expect(secondFileName).toMatch(/^1000-\d+-리포트\.png$/);
    expect(firstFileName).not.toBe(secondFileName);
  });

  it('사진 권한이 거절되면 파일을 만들지 않는다', async () => {
    mockRequestPermissions.mockResolvedValue({ granted: false } as never);

    await expect(saveImageToLibrary('base64-image', '리포트.png')).rejects.toThrow(
      '사진 저장 권한이 필요합니다'
    );
    expect(mockCreateFile).not.toHaveBeenCalled();
  });

  it('사진 보관함 저장에 실패해도 임시 파일을 제거한다', async () => {
    mockCreateAsset.mockRejectedValue(new Error('저장 실패'));

    await expect(saveImageToLibrary('base64-image', '리포트.png')).rejects.toThrow('저장 실패');
    expect(mockDeleteFile).toHaveBeenCalledTimes(1);
  });

  it('사진 저장 후 임시 파일 삭제에 실패해도 저장 성공으로 처리한다', async () => {
    mockDeleteFile.mockImplementation(() => {
      throw new Error('삭제 실패');
    });

    await expect(saveImageToLibrary('base64-image', '리포트.png')).resolves.toBeUndefined();
    expect(mockCreateAsset).toHaveBeenCalledTimes(1);
  });
});
