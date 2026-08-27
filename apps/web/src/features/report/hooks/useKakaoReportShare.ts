import { useState } from 'react';

import { useIssueShareLink } from '@/features/report/apis/mutations';
import { captureReportImageBlob, createImageFileList } from '@/features/report/utils/reportImage';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import { getKakaoSdk, isKakaoShareCancelled } from '@/shared/lib/kakao';
import type { YearMonth } from '@/shared/types/yearMonth';
import { useToast } from '@/shared/ui/toast';
import { formatYearMonth } from '@/shared/utils/yearMonth';

import type { RefObject } from 'react';

const REPORT_SHARE_THUMBNAIL_WIDTH = 540;
const REPORT_SHARE_THUMBNAIL_HEIGHT = 750;

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

      const sharePath = ROUTE_PATHS.sharedReport(shareToken);
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
          title: `자주 가는 곳들이 ${nickname}님을 설명한다면? 👀`,
          description: `${selectedMonth.month}월의 방문 기록이 찾아낸 결과를 확인해보세요.`,
          imageUrl: uploadedImage.url,
          imageWidth: uploadedImage.width ?? REPORT_SHARE_THUMBNAIL_WIDTH,
          imageHeight: uploadedImage.height ?? REPORT_SHARE_THUMBNAIL_HEIGHT,
          link,
        },
        buttonTitle: '취향 카드 보기',
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
