/** 첫 실행과 재시도를 같은 기준으로 집계할 수 있는 이벤트 속성을 만든다. */
export const createStepAttemptProperties = (attemptNumber: number) => {
  const normalizedAttemptNumber = Math.max(1, Math.floor(attemptNumber));

  return {
    attempt_number: normalizedAttemptNumber,
    retry_count: normalizedAttemptNumber - 1,
    is_retry: normalizedAttemptNumber > 1,
  } as const;
};
