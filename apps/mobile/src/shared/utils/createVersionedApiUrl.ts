/** /api 또는 /api/v1 형태의 환경 설정에서 /v1을 중복하지 않고 API 주소를 만듭니다. */
export const createVersionedApiUrl = (apiBaseUrl: string, path: string) => {
  const baseUrl = apiBaseUrl.replace(/\/+$/u, '');
  const versionedBaseUrl = baseUrl.endsWith('/v1') ? baseUrl : `${baseUrl}/v1`;
  return `${versionedBaseUrl}/${path.replace(/^\/+/u, '')}`;
};
