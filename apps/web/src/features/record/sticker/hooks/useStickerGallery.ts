import { useEffect, useRef } from 'react';

import { requestToNative } from '@/shared/lib/bridge';

import type { ChangeEvent } from 'react';

type StickerGalleryOptions = {
  isApp: boolean;
  onSelect: (file: File) => void;
  onError: () => void;
};

/** 웹 파일 선택과 앱 갤러리 요청을 연결하고 중복 요청·화면 이탈 후 응답을 무시합니다. */
export const useStickerGallery = ({ isApp, onSelect, onError }: StickerGalleryOptions) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const requestRef = useRef<symbol | null>(null);
  const callbacksRef = useRef({ onSelect, onError });
  useEffect(() => {
    callbacksRef.current = { onSelect, onError };
  }, [onSelect, onError]);
  useEffect(
    () => () => {
      requestRef.current = null;
    },
    []
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) onSelect(file);
  };
  const openGallery = () => {
    if (!isApp) {
      inputRef.current?.click();
      return;
    }
    if (requestRef.current) return;
    const request = Symbol('gallery');
    requestRef.current = request;
    void requestToNative('pickStickerImage', {})
      .then((result) => {
        if (requestRef.current !== request || result.status !== 'success') return;
        const bytes = Uint8Array.from(atob(result.base64), (character) => character.charCodeAt(0));
        callbacksRef.current.onSelect(
          new File([bytes], 'sticker-image.jpg', { type: result.mimeType })
        );
      })
      .catch(() => {
        if (requestRef.current === request) callbacksRef.current.onError();
      })
      .finally(() => {
        if (requestRef.current === request) requestRef.current = null;
      });
  };
  return { inputRef, handleChange, openGallery };
};
