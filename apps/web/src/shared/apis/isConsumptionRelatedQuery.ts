type QueryWithKey = {
  queryKey: readonly unknown[];
};

/** 소비 기록 변경 시 함께 갱신해야 하는 소비·리포트 쿼리인지 확인합니다. */
export const isConsumptionRelatedQuery = ({ queryKey }: QueryWithKey) => {
  const [key] = queryKey;

  return typeof key === 'string' && (key.startsWith('/consumptions') || key === '/reports/current');
};
