import { useLocation } from 'react-router-dom';

import { ROUTE_PATHS } from '@/shared/constants/routePaths';

/** 공개 진입점만 색인을 허용하고 SPA 이동 시 대표 URL과 색인 지시를 갱신합니다. */
export default function SearchEngineMetadata() {
  const { pathname } = useLocation();
  const isPublicEntry = pathname === ROUTE_PATHS.login;

  return (
    <>
      <meta name="robots" content={isPublicEntry ? 'index, follow' : 'noindex, nofollow'} />
      {isPublicEntry && <link rel="canonical" href="https://chapchap.kr/" />}
    </>
  );
}
