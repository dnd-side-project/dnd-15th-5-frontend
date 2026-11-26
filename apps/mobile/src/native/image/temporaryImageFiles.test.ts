import { File } from 'expo-file-system';

import {
  releaseTemporaryImage,
  trackPickedImage,
  trackTemporaryImage,
} from './temporaryImageFiles';

jest.mock('expo-file-system', () => ({
  File: jest.fn(),
  Paths: { cache: { uri: 'file:///cache/' } },
}));
const mockDelete = jest.fn();
beforeEach(() => {
  jest.clearAllMocks();
  mockDelete.mockReset();
  jest.mocked(File).mockImplementation(() => ({ exists: true, delete: mockDelete }) as never);
});

it('직접 생성한 파일만 한 번 삭제하고 갤러리 원본은 보존한다', () => {
  releaseTemporaryImage('file://gallery.jpg');
  expect(File).not.toHaveBeenCalled();
  trackTemporaryImage('file://generated.jpg');
  releaseTemporaryImage('file://generated.jpg');
  releaseTemporaryImage('file://generated.jpg');
  expect(File).toHaveBeenCalledTimes(1);
  expect(mockDelete).toHaveBeenCalledTimes(1);
});

it('이미 사라진 파일은 삭제하지 않는다', () => {
  jest.mocked(File).mockImplementation(() => ({ exists: false, delete: mockDelete }) as never);
  trackTemporaryImage('file://missing.jpg');
  releaseTemporaryImage('file://missing.jpg');
  expect(mockDelete).not.toHaveBeenCalled();
});

it.each(['file:///cache/ImagePicker/photo.heic', 'file:///cache/photo.heic'])(
  '선택기가 만든 앱 캐시 복사본은 정리한다 (%s)',
  (uri) => {
    trackPickedImage(uri);
    releaseTemporaryImage(uri);
    expect(mockDelete).toHaveBeenCalledTimes(1);
  }
);

it.each([
  'file:///photos/original.heic',
  'content://media/photo/1',
  'ph://original',
  'file:///cache-other/photo.jpg',
])('사진 보관함 원본과 캐시 밖 파일은 삭제하지 않는다 (%s)', (uri) => {
  trackPickedImage(uri);
  releaseTemporaryImage(uri);
  expect(File).not.toHaveBeenCalled();
});

it('파일 삭제 오류가 처리 결과로 전파되지 않는다', () => {
  mockDelete.mockImplementation(() => {
    throw new Error('cannot delete');
  });
  trackTemporaryImage('file://failed.jpg');
  releaseTemporaryImage('file://failed.jpg');
  expect(mockDelete).toHaveBeenCalledTimes(1);
});
