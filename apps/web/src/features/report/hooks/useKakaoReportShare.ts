import { useState } from 'react';

import { useIssueShareLink } from '@/features/report/apis/mutations';
import { captureReportImageBlob, createImageFileList } from '@/features/report/utils/reportImage';
import { createYearMonthPath, ROUTE_PATHS } from '@/shared/constants/routePaths';
import { getKakaoSdk, isKakaoShareCancelled } from '@/shared/lib/kakao';
import type { YearMonth } from '@/shared/types/yearMonth';
import { useToast } from '@/shared/ui/toast';
import { formatYearMonth } from '@/shared/utils/yearMonth';

import type { RefObject } from 'react';

const REPORT_SHARE_IMAGE_WIDTH = 488;
const REPORT_SHARE_IMAGE_HEIGHT = 1_032;

type UseKakaoReportShareOptions = {
  captureRef: RefObject<HTMLDivElement | null>;
  nickname: string;
  onShared?: () => void;
  selectedMonth: YearMonth;
};

/** 공유 토큰을 발급하고 Kakao 공유 대상 선택 창을 여는 흐름을 관리합니다. */
export const useKakaoReportShare = ({
  captureRef,
  nickname,
  onShared,
  selectedMonth,
}: UseKakaoReportShareOptions) => {
  const { showToast } = useToast();
  const issueShareLinkMutation = useIssueShareLink();
  const [isSharing, setIsSharing] = useState(false);

  const shareToKakao = async () => {
    if (isSharing) return;

    setIsSharing(true);

    try {
      const yearMonth = formatYearMonth(selectedMonth);
      const response = await issueShareLinkMutation.mutateAsync({ params: { yearMonth } });
      const shareToken = response.data?.shareToken;

      if (!shareToken) throw new Error('공유 링크를 발급하지 못했습니다');

      const sharePath = createYearMonthPath(ROUTE_PATHS.sharedReport(shareToken), yearMonth);
      const shareUrl = new URL(sharePath, window.location.origin).href;
      const kakao = getKakaoSdk();
      const captureTarget = captureRef.current;

      if (!captureTarget) throw new Error('공유할 취향 카드를 찾지 못했습니다');

      const imageBlob = await captureReportImageBlob(captureTarget);
      const imageFiles = createImageFileList(imageBlob, `${selectedMonth.month}월-취향카드.png`);
      const imageUploadResponse = await kakao.Share.uploadImage({ file: imageFiles });
      const uploadedImage = imageUploadResponse.infos.original;
      const link = {
        mobileWebUrl: shareUrl,
        webUrl: shareUrl,
      };

      await kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: `💌 ${nickname}님의 ${selectedMonth.month}월 취향 카드가 도착했어요`,
          description: `자주 찾는 장소에 담긴 ${nickname}님의 동네 취향을 구경해보세요!`,
          imageUrl: uploadedImage.url,
          imageWidth: uploadedImage.width ?? REPORT_SHARE_IMAGE_WIDTH,
          imageHeight: uploadedImage.height ?? REPORT_SHARE_IMAGE_HEIGHT,
          link,
        },
        buttonTitle: '취향 카드 구경하기',
      });
      onShared?.();
    } catch (error) {
      if (!isKakaoShareCancelled(error)) {
        showToast({
          message: '카카오톡 공유에 실패했어요. 다시 시도해 주세요.',
          type: 'error',
        });
      }
    } finally {
      setIsSharing(false);
    }
  };

  return { isSharing, shareToKakao };
};
