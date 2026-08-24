import { isOAuthCancellationError } from './oauth';

describe('isOAuthCancellationError', () => {
  it.each(['access_denied', 'cancelled', 'canceled'])('%s를 사용자 취소로 분류한다', (error) => {
    expect(isOAuthCancellationError(error)).toBe(true);
  });

  it('그 외 OAuth 오류는 사용자 취소로 분류하지 않는다', () => {
    expect(isOAuthCancellationError('invalid_state')).toBe(false);
  });
});
