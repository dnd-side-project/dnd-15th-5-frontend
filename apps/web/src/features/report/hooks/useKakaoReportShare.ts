import { useEffect, useState } from 'react';

import { useIssueShareLink } from '@/features/report/apis/mutations';
import { captureReportImageBlob, createImageFileList } from '@/features/report/utils/reportImage';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import {
  getKakaoSdk,
  isKakaoShareCancelled,
  type KakaoShareFeedTemplate,
} from '@/shared/lib/kakao';
import type { YearMonth } from '@/shared/types/yearMonth';
import { useToast } from '@/shared/ui/toast';
import { formatYearMonth } from '@/shared/utils/yearMonth';

import type { RefObject } from 'react';

const REPORT_SHARE_THUMBNAIL_WIDTH = 540;
const REPORT_SHARE_THUMBNAIL_HEIGHT = 750;

type UseKakaoReportShareOptions = {
  captureRef: RefObject<HTMLDivElement | null>;
  isEnabled: boolean;
  nickname: string;
  onShared?: () => void;
  selectedMonth: YearMonth;
};

type PreparedKakaoShare = {
  key: string;
  template: KakaoShareFeedTemplate;
};

/** 공유 데이터를 미리 준비하고 사용자 클릭 시 Kakao 공유 창을 즉시 여는 흐름을 관리합니다. */
export const useKakaoReportShare = ({
  captureRef,
  isEnabled,
  nickname,
  onShared,
  selectedMonth,
}: UseKakaoReportShareOptions) => {
  const { showToast } = useToast();
  const { mutateAsync: issueShareLink } = useIssueShareLink();
  const [isSharing, setIsSharing] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [preparedShare, setPreparedShare] = useState<PreparedKakaoShare | null>(null);
  const selectedYear = selectedMonth.year;
  const selectedMonthNumber = selectedMonth.month;
  const preparationKey = `${selectedYear}-${selectedMonthNumber}-${nickname}`;
  const shareTemplate = preparedShare?.key === preparationKey ? preparedShare.template : null;

  useEffect(() => {
    if (!isEnabled || preparedShare?.key === preparationKey) return;

    let isActive = true;

    const prepareKakaoShare = async () => {
      setIsPreparing(true);

      const yearMonth = formatYearMonth({ month: selectedMonthNumber, year: selectedYear });
      const response = await issueShareLink({ params: { yearMonth } });
      const shareToken = response.data?.shareToken;

      if (!shareToken) throw new Error('공유 링크를 발급하지 못했습니다');

      const sharePath = ROUTE_PATHS.sharedReport(shareToken);
      const shareUrl = new URL(sharePath, window.location.origin).href;
      const kakao = getKakaoSdk();
      const captureTarget = captureRef.current;

      if (!captureTarget) throw new Error('공유할 취향 카드를 찾지 못했습니다');

      const imageBlob = await captureReportImageBlob(captureTarget);
      const imageFiles = createImageFileList(imageBlob, `${selectedMonthNumber}월-취향카드.png`);
      const imageUploadResponse = await kakao.Share.uploadImage({ file: imageFiles });
      const uploadedImage = imageUploadResponse.infos.original;
      const link = {
        mobileWebUrl: shareUrl,
        webUrl: shareUrl,
      };

      if (!isActive) return;

      setPreparedShare({
        key: preparationKey,
        template: {
          objectType: 'feed',
          content: {
            title: `자주 가는 곳들이 ${nickname}님을 설명한다면? 👀`,
            description: `${selectedMonthNumber}월의 방문 기록이 찾아낸 결과를 확인해보세요.`,
            imageUrl: uploadedImage.url,
            imageWidth: uploadedImage.width ?? REPORT_SHARE_THUMBNAIL_WIDTH,
            imageHeight: uploadedImage.height ?? REPORT_SHARE_THUMBNAIL_HEIGHT,
            link,
          },
          buttonTitle: '취향 카드 보기',
        },
      });
    };

    void prepareKakaoShare()
      .catch(() => {
        if (!isActive) return;

        showToast({
          message: '카카오톡 공유에 실패했어요. 다시 시도해 주세요.',
          type: 'error',
        });
      })
      .finally(() => {
        if (isActive) setIsPreparing(false);
      });

    return () => {
      isActive = false;
    };
  }, [
    captureRef,
    isEnabled,
    issueShareLink,
    nickname,
    preparationKey,
    preparedShare?.key,
    selectedMonthNumber,
    selectedYear,
    showToast,
  ]);

  const shareToKakao = () => {
    if (!shareTemplate || isPreparing || isSharing) return;

    setIsSharing(true);

    try {
      // NOTE: 모바일 브라우저가 앱 딥링크를 허용하도록 사용자 클릭 이벤트 안에서 즉시 호출한다.
      const shareRequest = getKakaoSdk().Share.sendDefault(shareTemplate);

      void shareRequest
        .then(() => onShared?.())
        .catch((error: unknown) => {
          if (!isKakaoShareCancelled(error)) {
            showToast({
              message: '카카오톡 공유에 실패했어요. 다시 시도해 주세요.',
              type: 'error',
            });
          }
        })
        .finally(() => setIsSharing(false));
    } catch (error) {
      setIsSharing(false);

      if (!isKakaoShareCancelled(error)) {
        showToast({
          message: '카카오톡 공유에 실패했어요. 다시 시도해 주세요.',
          type: 'error',
        });
      }
    }
  };

  return {
    isKakaoShareReady: shareTemplate !== null,
    isPreparingKakaoShare: isPreparing,
    isSharing,
    shareToKakao,
  };
};
