/** 수정 화면에서 돌아갈 수 있는 앱 내부 경로를 라우트 상태에서 읽습니다. */
export const getConsumptionReturnPath = (state: unknown) => {
  if (!state || typeof state !== 'object' || !('returnTo' in state)) return undefined;
  const { returnTo } = state;
  return typeof returnTo === 'string' && returnTo.startsWith('/') && !returnTo.startsWith('//')
    ? returnTo
    : undefined;
};

/** 수정 전 선택한 기록 날짜를 지도·소비내역 페이지에서 동일하게 복원합니다. */
export const getConsumptionScrollDate = (state: unknown) => {
  if (!state || typeof state !== 'object' || !('scrollToDate' in state)) return undefined;
  return typeof state.scrollToDate === 'string' ? state.scrollToDate : undefined;
};
