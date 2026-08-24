import axios from 'axios';

import { API_BASE_URL } from '@/shared/constants/api';

const API_TIMEOUT_MS = 10_000;

/**
 * ChapChap 백엔드 API 요청에 사용하는 공통 Axios 인스턴스입니다.
 * 인증 쿠키가 요청에 포함되며, 개발 환경에서는 Vite proxy가 `/api`를 백엔드로 전달합니다.
 */
export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: API_TIMEOUT_MS,
});
