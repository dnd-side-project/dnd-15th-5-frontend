import { ROUTE_PATHS } from '@/shared/constants/routePaths';

import { isPositiveSafeInteger } from './isPositiveSafeInteger';

/** 기록 수정 전 상세 목록의 스크롤 위치를 읽습니다. */
export const getConsumptionReturnScrollTop = (state: unknown): number | undefined => {
  if (!state || typeof state !== 'object' || !('returnScrollTop' in state)) return undefined;
  const value = state.returnScrollTop;
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : undefined;
};

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
/** 같은 날짜에 여러 기록이 있어도 수정한 방문을 정확히 찾습니다. */
export const getConsumptionScrollId = (state: unknown) => {
  if (!state || typeof state !== 'object' || !('scrollToConsumptionId' in state)) return undefined;
  return isPositiveSafeInteger(state.scrollToConsumptionId)
    ? state.scrollToConsumptionId
    : undefined;
};

/** 명시적인 복귀 이동에도 원래 화면의 가게 정보와 스크롤 대상을 보존합니다. */
export const getConsumptionReturnState = (state: unknown) => {
  if (!state || typeof state !== 'object' || !('returnState' in state)) return undefined;
  return state.returnState && typeof state.returnState === 'object' ? state.returnState : undefined;
};

/** 편집 진입 직전 목록 항목에 저장한 식별자를 읽습니다. */
export const getConsumptionReturnEntryKey = (state: unknown) => {
  if (!state || typeof state !== 'object' || !('returnEntryKey' in state)) return undefined;
  return typeof state.returnEntryKey === 'string' ? state.returnEntryKey : undefined;
};

/** 가게 상세에 진입하기 전 소비 기록 목록의 복귀 정보를 읽습니다. 편집 화면의 복귀 정보와 분리합니다. */
export const getConsumptionListReturn = (state: unknown) => {
  if (!state || typeof state !== 'object' || !('consumptionListReturn' in state)) return undefined;
  const target = state.consumptionListReturn;
  const returnTo = getConsumptionReturnPath(target);
  if (!returnTo) return undefined;
  const pathname = returnTo.split('?')[0];
  if (pathname !== ROUTE_PATHS.home && pathname !== ROUTE_PATHS.spendingHistory) return undefined;
  return {
    returnTo,
    returnState: getConsumptionReturnState(target),
    returnEntryKey: getConsumptionReturnEntryKey(target),
  };
};
