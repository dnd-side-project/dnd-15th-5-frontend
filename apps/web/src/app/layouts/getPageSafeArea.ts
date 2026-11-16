import { matchPath } from 'react-router-dom';

import { ROUTE_PATHS, ROUTE_PATTERNS } from '@/shared/constants/routePaths';

type SafeAreaOwner = 'frame' | 'content';

const PAGE_SAFE_AREA_RULES: {
  path: string;
  top: SafeAreaOwner;
  bottom: SafeAreaOwner;
}[] = [
  { path: ROUTE_PATHS.home, top: 'content', bottom: 'content' },
  { path: ROUTE_PATHS.homeRecommendationMap, top: 'content', bottom: 'content' },
  { path: ROUTE_PATHS.homeRecommendationSearch, top: 'content', bottom: 'frame' },
  { path: ROUTE_PATHS.record, top: 'content', bottom: 'content' },
  { path: ROUTE_PATTERNS.editRecord, top: 'content', bottom: 'content' },
  { path: ROUTE_PATTERNS.shopDetail, top: 'frame', bottom: 'content' },
  { path: ROUTE_PATTERNS.sharedReport, top: 'frame', bottom: 'content' },
  { path: ROUTE_PATHS.notificationSettings, top: 'frame', bottom: 'content' },
];

/** 경로별로 프레임과 콘텐츠 중 어느 쪽이 각 Safe Area를 확보하는지 반환합니다. */
export const getPageSafeArea = (pathname: string) => {
  const rule = PAGE_SAFE_AREA_RULES.find(({ path }) => matchPath({ path, end: true }, pathname));

  return {
    usesOwnTopSafeArea: rule?.top === 'content',
    usesOwnBottomSafeArea: rule?.bottom === 'content',
  };
};
