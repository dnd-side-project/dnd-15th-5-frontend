import type { CurrentStatusResponse } from '@/features/report/apis/dto';
import { cn } from '@/shared/lib/cn';

import { REPORT_PANEL_CLASS_NAME } from './reportPageStyles';

type RecentDiscoveryPanelProps = {
  messages: NonNullable<CurrentStatusResponse['recentDiscoveryMessage']>;
};

/** 최근 소비 기록에서 발견한 인사이트 문구를 보여줍니다. */
export default function RecentDiscoveryPanel({ messages }: RecentDiscoveryPanelProps) {
  return (
    <div
      className={cn(
        REPORT_PANEL_CLASS_NAME,
        'flex h-18 py-4 items-center justify-center text-center text-body-02-semibold text-neutral-600'
      )}
    >
      <p className="line-clamp-2 whitespace-pre-line">{messages}</p>
    </div>
  );
}
