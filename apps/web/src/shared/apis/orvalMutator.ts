import { axiosInstance } from './axiosInstance';

import type { AxiosError, AxiosRequestConfig } from 'axios';

/**
 * Orval 생성 API가 공통 Axios 설정을 사용하도록 연결한다.
 * 응답에서는 서버가 반환한 body만 추출한다.
 */
export const apiClient = <Response>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<Response> => {
  return axiosInstance<Response>({
    ...config,
    ...options,
  }).then(({ data }) => data);
};

export type ErrorType<Error> = AxiosError<Error>;
export type BodyType<Body> = Body;
