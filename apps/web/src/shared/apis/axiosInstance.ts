import axios from 'axios';

const API_TIMEOUT_MS = 10_000;

/**
 * ChapChap 백엔드 API 요청에 사용하는 공통 Axios 인스턴스입니다.
 * 인증 쿠키가 요청에 포함되며, 운영 환경에서는 같은 origin의 `/api` 경로를 사용합니다.
 */
export const axiosInstance = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: API_TIMEOUT_MS,
});
