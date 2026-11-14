import { useContext, useEffect, useState } from 'react';

import { RecommendationAccountContext } from '@/features/map/recommendationAccountContext';

const DISPLAY_DURATION_MS = 3_000;
const consumedDays = new Map<string, string>();

const getLocalDay = () => {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
};

/** 추천 화면에 진입할 때 마운트하고, 동네 제목의 relative 부모 안에 배치합니다. */
export default function RecommendationAddressHint() {
  const userId = useContext(RecommendationAccountContext);
  const [visibleUser, setVisibleUser] = useState<string | null>(null);
  const identity = userId == null ? null : String(userId);

  useEffect(() => {
    if (identity === null) return;

    const key = `chapchap:recommendation-address-hint:${encodeURIComponent(identity)}`;
    const day = getLocalDay();
    let storedDay: string | null = null;
    try {
      storedDay = window.localStorage.getItem(key);
    } catch {
      // 저장소가 차단되어도 현재 세션에서는 하루 한 번만 표시합니다.
    }
    if (storedDay === day || consumedDays.get(key) === day) return;

    let hasShown = false;
    let hideTimer: number | undefined;
    const consume = () => {
      consumedDays.set(key, day);
      try {
        window.localStorage.setItem(key, day);
      } catch {
        // 메모리 기록으로 저장 실패를 보완합니다.
      }
    };
    // StrictMode의 초기 setup/cleanup에서는 노출 이력을 남기지 않습니다.
    const showTimer = window.setTimeout(() => {
      hasShown = true;
      setVisibleUser(identity);
      hideTimer = window.setTimeout(() => {
        consume();
        setVisibleUser(null);
      }, DISPLAY_DURATION_MS);
    }, 0);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
      if (hasShown) {
        consume();
        setVisibleUser(null);
      }
    };
  }, [identity]);

  if (identity === null || visibleUser !== identity) return null;

  return (
    <span
      role="status"
      className="pointer-events-none absolute bottom-full left-8 z-sticky-header mb-2 whitespace-nowrap rounded-08 bg-primary-400 px-3 py-2 text-label-01-medium text-neutral-00 after:absolute after:top-full after:left-5 after:border-x-4 after:border-t-4 after:border-x-transparent after:border-t-primary-400 after:content-['']"
    >
      추천 받을 주소가 맞나요?
    </span>
  );
}
