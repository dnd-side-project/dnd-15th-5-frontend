let accessToken: string | null = null;

/** 네이티브 API 요청에 사용할 단기 Access Token을 메모리에서 조회한다. */
export const getAccessToken = () => accessToken;

/** 네이티브 API 요청에 사용할 단기 Access Token을 메모리에 보관한다. */
export const setAccessToken = (nextAccessToken: string) => {
  accessToken = nextAccessToken;
};

/** 로그아웃하거나 재발급에 실패했을 때 메모리의 Access Token을 제거한다. */
export const clearAccessToken = () => {
  accessToken = null;
};
