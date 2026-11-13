import { useEffect, useRef, useState } from 'react';

import {
  disposeStickerBackground,
  prepareStickerBackground,
} from '@/features/record/sticker/background-removal/removeStickerBackground';

type ImageAction = 'capture' | 'crop' | 'process' | null;
type ImageTaskState = { action: ImageAction; message: string; error: string };

const IDLE_STATE: ImageTaskState = { action: null, message: '', error: '' };

/**
 * 이미지 작업의 취소 신호·진행 상태·blob URL 수명을 한곳에서 관리합니다.
 *
 * 새 작업을 시작하면 이전 작업을 취소하고, 취소된 요청의 늦은 진행률·오류·완료는 반영하지 않습니다.
 * 이 훅으로 만든 blob URL은 `releaseUrls`나 언마운트 시 해제합니다.
 *
 * NOTE: 배경 제거 Worker는 취소 시 종료되므로, 사진 처리로 이어지는 진입마다 `prepareBackground`로 다시 준비한다.
 */
export const useStickerImageTask = () => {
  const [state, setState] = useState<ImageTaskState>(IDLE_STATE);
  const controller = useRef<AbortController | null>(null);
  const urls = useRef(new Set<string>());

  const releaseUrls = (keep: string[] = []) => {
    for (const url of urls.current) {
      if (keep.includes(url)) continue;
      URL.revokeObjectURL(url);
      urls.current.delete(url);
    }
  };

  useEffect(() => {
    const currentUrls = urls.current;
    prepareStickerBackground();
    return () => {
      controller.current?.abort();
      disposeStickerBackground();
      currentUrls.forEach((url) => URL.revokeObjectURL(url));
      currentUrls.clear();
    };
  }, []);

  const updateIfActive = (request: AbortController, next: Partial<ImageTaskState>) => {
    if (!request.signal.aborted) setState((current) => ({ ...current, ...next }));
  };

  const start = (action: ImageAction = null) => {
    controller.current?.abort();
    const request = new AbortController();
    controller.current = request;
    setState({ ...IDLE_STATE, action });
    return request;
  };

  const fail = (cause: unknown, fallback: string, request?: AbortController) => {
    const error = cause instanceof Error ? cause.message : fallback;
    if (request) updateIfActive(request, { error });
    else setState((current) => ({ ...current, error }));
  };

  /** 작업 실패는 요청이 유효할 때만 표시하고, 끝나면 대기 상태를 해제합니다. */
  const run = async (request: AbortController, fallback: string, work: () => Promise<void>) => {
    try {
      await work();
    } catch (cause) {
      fail(cause, fallback, request);
    } finally {
      updateIfActive(request, { action: null });
    }
  };

  return {
    isCapturing: state.action === 'capture',
    isCropping: state.action === 'crop',
    isProcessing: state.action === 'process',
    message: state.message,
    error: state.error,
    start,
    run,
    fail,
    prepareBackground: prepareStickerBackground,
    /** 촬영·자르기에 이어 같은 요청으로 스티커 생성을 진행할 때 대기 상태를 바꿉니다. */
    continueAs: (request: AbortController, action: ImageAction) =>
      updateIfActive(request, { action }),
    reportProgress: (request: AbortController, message: string) =>
      updateIfActive(request, { message }),
    createUrl: (blob: Blob) => {
      const url = URL.createObjectURL(blob);
      urls.current.add(url);
      return url;
    },
    releaseUrls,
  };
};
