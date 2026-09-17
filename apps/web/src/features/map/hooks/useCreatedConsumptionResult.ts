import { useEffect, useRef } from 'react';

import { useVisitedPlaceStickersQuery } from '@/features/map/apis/hooks/useVisitedPlaceStickersQuery';
import { useHomeBottomSheetStore } from '@/features/map/stores/homeBottomSheetStore';
import { useMapFocusStore } from '@/features/map/stores/mapFocusStore';
import { findCreatedConsumptionSticker } from '@/features/map/utils/findCreatedConsumptionSticker';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import {
  ANALYTICS_EVENTS,
  trackAnalyticsEvent,
  trackUtTaskCompleted,
} from '@/shared/lib/analytics/mixpanel';
import { UT_MISSION_IDS, UT_SCREEN_NAMES } from '@/shared/lib/analytics/screens';
import { useToast } from '@/shared/ui/toast';

import type { CreatedConsumptionPlace } from '@chapchap/shared/record';

const FIRST_VISIT_MESSAGE = '첫번째 방문기록이 생성되었어요!';
const REVISIT_MESSAGE = '방문기록이 등록되었어요';

type UseCreatedConsumptionResultOptions = {
  createdPlace?: CreatedConsumptionPlace;
  recordMethod?: 'manual' | 'receipt';
  onHandled: () => void;
};

const getCreatedPlaceKey = ({ placeName, latitude, longitude }: CreatedConsumptionPlace) =>
  `${placeName}:${latitude}:${longitude}`;

/**
 * 소비 기록 생성 뒤 최신 방문 장소를 찾아 지도 포커스·상세 시트·완료 Toast를 동기화합니다.
 *
 * 수기 작성은 라우트 state, 네이티브 영수증 작성은 URL 쿼리로 장소 정보를 전달하지만,
 * 홈에 도착한 뒤에는 이 훅 하나가 두 흐름을 동일하게 처리합니다.
 */
export const useCreatedConsumptionResult = ({
  createdPlace,
  recordMethod,
  onHandled,
}: UseCreatedConsumptionResultOptions) => {
  const { refetchStickers, stickers } = useVisitedPlaceStickersQuery();
  const showSelectedPlace = useHomeBottomSheetStore((state) => state.showSelectedPlace);
  const setSelectedPlaceFocus = useMapFocusStore((state) => state.setSelectedPlaceFocus);
  const { showToast } = useToast();
  const handledKeyRef = useRef<string | null>(null);
  const processingTokenRef = useRef<symbol | null>(null);

  useEffect(() => {
    if (!createdPlace) {
      return;
    }

    const createdPlaceKey = getCreatedPlaceKey(createdPlace);
    if (handledKeyRef.current === createdPlaceKey || processingTokenRef.current) {
      return;
    }

    const processingToken = Symbol(createdPlaceKey);
    processingTokenRef.current = processingToken;
    let isCancelled = false;

    const handleCreatedConsumption = async () => {
      let latestStickers = stickers;

      try {
        latestStickers = await refetchStickers();
      } catch {
        // NOTE: 갱신 요청이 실패해도 이미 캐시된 마커가 있으면 완료 흐름을 이어갑니다.
      }

      if (isCancelled) {
        return;
      }

      const matchedSticker = findCreatedConsumptionSticker(latestStickers, createdPlace);
      handledKeyRef.current = createdPlaceKey;

      if (matchedSticker) {
        const isFirstVisit = matchedSticker.visitCount === 1;
        setSelectedPlaceFocus(matchedSticker.position);
        showSelectedPlace(matchedSticker.id);
        showToast({
          type: 'success',
          message: isFirstVisit ? FIRST_VISIT_MESSAGE : REVISIT_MESSAGE,
          placement: 'above-bottom-sheet',
        });

        if (isFirstVisit) {
          const resolvedRecordMethod = recordMethod ?? 'manual';
          const missionId =
            resolvedRecordMethod === 'receipt'
              ? UT_MISSION_IDS.receiptFirstVisit
              : UT_MISSION_IDS.manualFirstVisit;
          trackAnalyticsEvent(ANALYTICS_EVENTS.uiStateViewed, {
            screen_name: UT_SCREEN_NAMES.mapPlaceDetailFirstVisitToast,
            screen_path: ROUTE_PATHS.home,
            mission_id: missionId,
            record_method: resolvedRecordMethod,
          });
          trackUtTaskCompleted(UT_SCREEN_NAMES.mapPlaceDetailFirstVisitToast, {
            mission_id: missionId,
            record_method: resolvedRecordMethod,
          });
        }
      } else {
        showToast({ type: 'success', message: REVISIT_MESSAGE });
      }

      onHandled();
    };

    void handleCreatedConsumption().finally(() => {
      if (processingTokenRef.current === processingToken) {
        processingTokenRef.current = null;
      }
    });

    return () => {
      isCancelled = true;
      if (processingTokenRef.current === processingToken) {
        processingTokenRef.current = null;
      }
    };
  }, [
    createdPlace,
    onHandled,
    recordMethod,
    refetchStickers,
    setSelectedPlaceFocus,
    showSelectedPlace,
    showToast,
    stickers,
  ]);
};
