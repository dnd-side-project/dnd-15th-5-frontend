/** 소비내역과 단골 리스트에 공통으로 적용하는 서버 데이터 캐시 정책입니다. */
export const REPORT_LIST_QUERY_CACHE_OPTIONS = {
  staleTime: 10 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
  refetchOnWindowFocus: true,
} as const;

/** 생성 이후 값이 바뀌지 않는 월간 리포트의 캐시 정책입니다. */
export const MONTHLY_REPORT_QUERY_CACHE_OPTIONS = {
  gcTime: Number.POSITIVE_INFINITY,
  staleTime: Number.POSITIVE_INFINITY,
} as const;
