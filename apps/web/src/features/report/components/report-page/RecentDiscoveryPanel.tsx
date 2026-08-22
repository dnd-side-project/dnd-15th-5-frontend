import { cn } from '@/shared/lib/cn';

import { REPORT_PANEL_CLASS_NAME } from './reportPageStyles';

type RecentDiscoveryPanelProps = {
  messages: readonly [string, string] | null;
};

/** 최근 소비 기록에서 발견한 인사이트 문구를 보여줍니다. */
export default function RecentDiscoveryPanel({ messages }: RecentDiscoveryPanelProps) {
  if (!messages) {
    return (
      <div
        className={cn(
          REPORT_PANEL_CLASS_NAME,
          'flex py-4 items-center justify-center text-center text-body-02-semibold text-neutral-600'
        )}
      >
        최근 발견 기록이 없어요.
      </div>
    );
  }

  return (
    <div
      className={cn(
        REPORT_PANEL_CLASS_NAME,
        'flex items-center justify-center py-6 text-center text-body-01-medium text-neutral-900'
      )}
    >
      <p>
        {messages[0]}
        <br />
        {messages[1]}
      </p>
    </div>
  );
}
