import { StartClient } from '@/features/auth/apis/dto';
import { isNativeApp } from '@/shared/lib/bridge';

/** 현재 실행 환경에 맞는 백엔드 인증 클라이언트 유형을 반환합니다. */
export const getAuthClient = () => (isNativeApp() ? StartClient.APP : StartClient.WEB);
