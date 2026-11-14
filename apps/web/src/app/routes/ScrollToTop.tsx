import { useLocation } from 'react-router-dom';

import { useScrollToTop } from '@/shared/hooks/useScrollToTop';

/** 라우트 변경 시 문서 스크롤 위치를 최상단으로 초기화합니다. */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useScrollToTop(pathname);

  return null;
}
