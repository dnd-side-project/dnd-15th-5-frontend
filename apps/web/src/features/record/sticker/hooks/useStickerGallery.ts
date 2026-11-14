import { useEffect, useRef } from 'react';

import { requestToNative } from '@/shared/lib/bridge';

import type { ChangeEvent } from 'react';

type StickerGalleryOptions = {
  isApp: boolean;
  onRequestStart: () => AbortSignal;
  onSelect: (file: File) => void;
  onError: () => void;
};

/** 웹 파일 선택과 앱 갤러리를 연결하고 중복 요청·취소된 이미지 작업의 늦은 응답을 무시합니다. */
export const useStickerGallery = ({
  isApp,
  onRequestStart,
  onSelect,
  onError,
}: StickerGalleryOptions) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const requestRef = useRef<{ signal: AbortSignal } | null>(null);
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
    if (requestRef.current && !requestRef.current.signal.aborted) return;
    const request = { signal: onRequestStart() };
    requestRef.current = request;
    const isActive = () => requestRef.current === request && !request.signal.aborted;
    void requestToNative('pickStickerImage', {})
      .then((result) => {
        if (!isActive() || result.status !== 'success') return;
        const bytes = Uint8Array.from(atob(result.base64), (character) => character.charCodeAt(0));
        callbacksRef.current.onSelect(
          new File([bytes], 'sticker-image.jpg', { type: result.mimeType })
        );
      })
      .catch(() => {
        if (isActive()) callbacksRef.current.onError();
      })
      .finally(() => {
        if (requestRef.current === request) requestRef.current = null;
      });
  };
  return { inputRef, handleChange, openGallery };
};
