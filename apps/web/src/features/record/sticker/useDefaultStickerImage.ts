import { useEffect, useState } from 'react';

import { loadDefaultSticker } from './loadDefaultSticker';

/** 기본 스티커 PNG를 불러오고, 재시도·이탈 시 임시 URL을 정리합니다. */
export const useDefaultStickerImage = (image: string) => {
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let objectUrl = '';
    void loadDefaultSticker(image, controller.signal)
      .then((stickerBlob) => {
        if (controller.signal.aborted) return;
        objectUrl = URL.createObjectURL(stickerBlob);
        setImageUrl(objectUrl);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(cause instanceof Error ? cause.message : '스티커를 만들지 못했어요.');
        }
      });
    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [image, requestVersion]);

  return {
    imageUrl,
    error,
    retry: () => {
      setImageUrl('');
      setError('');
      setRequestVersion((version) => version + 1);
    },
  };
};
