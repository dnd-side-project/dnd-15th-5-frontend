import { Navigate, useLocation } from 'react-router-dom';

import { ROUTE_PATHS } from '@/shared/constants/routePaths';

/** 기존 PoC 주소도 가게 검색을 포함한 정식 기록 플로우로 연결합니다. */
export default function StickerPocRedirect() {
  const { search, state } = useLocation();
  return <Navigate to={{ pathname: ROUTE_PATHS.record, search }} state={state} replace />;
}
