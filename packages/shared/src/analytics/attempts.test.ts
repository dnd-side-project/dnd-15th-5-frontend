import { createStepAttemptProperties } from './attempts';

describe('createStepAttemptProperties', () => {
  it('첫 시도와 재시도 횟수를 구분한다', () => {
    expect(createStepAttemptProperties(1)).toEqual({
      attempt_number: 1,
      retry_count: 0,
      is_retry: false,
    });
    expect(createStepAttemptProperties(3)).toEqual({
      attempt_number: 3,
      retry_count: 2,
      is_retry: true,
    });
  });
});
