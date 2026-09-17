import { cn } from '@/shared/lib/cn';

import { REPORT_PREFERENCE_CARD_VARIANTS } from './reportPreferenceCardVariants';
import ReportPreferenceSharedCard from './ReportPreferenceSharedCard';
import './reportPreferenceCard.css';

import type { ReportPreferenceSharedCardProps } from './ReportPreferenceSharedCard';

const PHOTO_CAPTURE_CONTENT_SCALE = 0.96;

type ReportPreferenceShareScreenProps = ReportPreferenceSharedCardProps & {
  isPhotoCapture?: boolean;
  nickname: string;
};

/** 이미지 저장용 취향 카드를 공유 페이지 배경과 사용자 문구 안에 배치합니다. */
export default function ReportPreferenceShareScreen({
  description,
  hasShadow = true,
  isPhotoCapture = false,
  metrics,
  nickname,
  tags,
  title,
  variant,
}: ReportPreferenceShareScreenProps) {
  const variantConfig = REPORT_PREFERENCE_CARD_VARIANTS[variant];

  return (
    <article
      aria-label={`${nickname}님의 ${title} 취향 카드 공유 화면`}
      className={cn(
        'report-preference-share relative flex w-full shrink-0 items-center justify-center overflow-hidden',
        isPhotoCapture ? 'h-full' : 'min-h-dvh',
        variantConfig.shareClassName
      )}
    >
      <div
        className="flex w-full flex-col items-center"
        data-report-preference-share-content
        // NOTE: 1080×1440 출력 비율을 유지하면서 위아래에 최소 50px의 안전 여백을 확보한다.
        style={isPhotoCapture ? { transform: `scale(${PHOTO_CAPTURE_CONTENT_SCALE})` } : undefined}
      >
        <h1 className="report-preference-share-title-enter flex items-center justify-center gap-2.5 text-body-02-medium text-neutral-00">
          <span aria-hidden className="report-preference-share-title-sparkle--left">
            ✦
          </span>
          <span data-mp-mask="">{nickname}</span>님의 취향 카드
          <span aria-hidden className="report-preference-share-title-sparkle--right">
            ✦
          </span>
        </h1>

        <div className="report-preference-share-card-enter mt-4.75">
          <ReportPreferenceSharedCard
            description={description}
            hasShadow={isPhotoCapture ? false : hasShadow}
            metrics={metrics}
            tags={tags}
            title={title}
            variant={variant}
          />
        </div>
      </div>
    </article>
  );
}
