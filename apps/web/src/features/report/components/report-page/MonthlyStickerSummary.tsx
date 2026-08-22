import { Link } from 'react-router-dom';

import { ChevronRightIcon } from '@/shared/assets/icons';
import { cn } from '@/shared/lib/cn';

import { REPORT_PANEL_CLASS_NAME } from './reportPageStyles';

type MonthlyStickerSummaryProps = {
  additionalCount: number;
  emptyActionPath: string;
  recordCount: number;
  stickers: readonly string[];
};

/** 이번 달 기록에서 획득한 스티커와 추가 개수를 보여줍니다. */
export default function MonthlyStickerSummary({
  additionalCount,
  emptyActionPath,
  recordCount,
  stickers,
}: MonthlyStickerSummaryProps) {
  if (recordCount === 0) {
    return (
      <div
        className={cn(
          REPORT_PANEL_CLASS_NAME,
          'flex py-7.5 flex-col items-center justify-center gap-2 text-center'
        )}
      >
        <p className="text-body-02-semibold text-neutral-600">아직 받은 스티커가 없어요</p>
        <Link
          className="inline-flex items-center text-caption-01-medium text-neutral-500 focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:outline-none"
          to={emptyActionPath}
        >
          소비 기록 작성하러가기
          <ChevronRightIcon aria-hidden className="size-3 text-neutral-400" />
        </Link>
      </div>
    );
  }

  return (
    <div className={cn(REPORT_PANEL_CLASS_NAME, 'flex items-center justify-center p-4')}>
      <div className="flex w-full max-w-81.25 items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center justify-between">
          {stickers.map((src, index) => (
            <img
              alt=""
              className="size-13.75 shrink-0 object-contain"
              key={`${src}-${index}`}
              src={src}
            />
          ))}
        </div>
        <span className="flex size-8.75 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-label-01-medium text-neutral-500">
          +{additionalCount}
        </span>
      </div>
    </div>
  );
}
