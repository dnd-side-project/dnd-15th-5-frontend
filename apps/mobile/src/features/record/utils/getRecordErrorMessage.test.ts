import { getRecordErrorMessage } from './getRecordErrorMessage';

describe('getRecordErrorMessage', () => {
  it('서버 오류와 일반 오류의 메시지를 추출한다', () => {
    expect(
      getRecordErrorMessage({ response: { data: { message: '영수증을 확인해 주세요.' } } })
    ).toBe('영수증을 확인해 주세요.');
    expect(getRecordErrorMessage(new Error('파일을 읽지 못했습니다.'))).toBe(
      '파일을 읽지 못했습니다.'
    );
  });

  it('표시할 메시지가 없으면 null을 반환한다', () => {
    expect(getRecordErrorMessage(null)).toBeNull();
    expect(getRecordErrorMessage({ response: { data: { message: ' ' } } })).toBeNull();
  });
});
