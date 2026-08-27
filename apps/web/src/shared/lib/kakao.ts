import { KAKAO_JAVASCRIPT_KEY } from '@/shared/lib/env';

type KakaoShareLink = {
  mobileWebUrl: string;
  webUrl: string;
};

type KakaoShareFeedTemplate = {
  objectType: 'feed';
  content: {
    title: string;
    description: string;
    imageUrl: string;
    imageWidth: number;
    imageHeight: number;
    link: KakaoShareLink;
  };
  buttonTitle: string;
};

type KakaoImageUploadResponse = {
  infos: {
    original: {
      height?: number;
      url: string;
      width?: number;
    };
  };
};

type KakaoSdk = {
  init: (javascriptKey: string) => void;
  isInitialized: () => boolean;
  Share: {
    sendDefault: (settings: KakaoShareFeedTemplate) => Promise<unknown>;
    uploadImage: (settings: { file: FileList }) => Promise<KakaoImageUploadResponse>;
  };
};

declare global {
  interface Window {
    Kakao?: KakaoSdk;
  }
}

/** Kakao JavaScript SDK를 한 번만 초기화하고 공유 모듈을 반환합니다. */
export const getKakaoSdk = () => {
  const kakao = window.Kakao;

  if (!kakao) throw new Error('카카오 SDK를 불러오지 못했습니다');
  if (!KAKAO_JAVASCRIPT_KEY) throw new Error('카카오 JavaScript 키가 설정되지 않았습니다');

  if (!kakao.isInitialized()) kakao.init(KAKAO_JAVASCRIPT_KEY);

  return kakao;
};

/** 사용자가 공유 대상 선택 창을 닫은 경우인지 판별합니다. */
export const isKakaoShareCancelled = (error: unknown) => {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : error && typeof error === 'object' && 'message' in error
          ? String(error.message)
          : '';

  return /cancel|canceled|cancelled|closed|취소/i.test(message);
};
