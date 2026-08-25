import MonthSelector from '@/features/report/components/common/MonthSelector';
import type { YearMonth } from '@/shared/types/yearMonth';
import { BackButton } from '@/shared/ui/back-button';

type MonthlyReportHeaderProps = {
  hasNewerMonth: boolean;
  hasOlderMonth: boolean;
  onBack: () => void;
  onNewerMonth: () => void;
  onOlderMonth: () => void;
  selectedMonth: YearMonth;
};

/** 월간 리포트의 이전·다음 달 이동과 뒤로가기를 제공합니다. */
export default function MonthlyReportHeader({
  hasNewerMonth,
  hasOlderMonth,
  onBack,
  onNewerMonth,
  onOlderMonth,
  selectedMonth,
}: MonthlyReportHeaderProps) {
  return (
    <header className="px-4.25">
      <BackButton className="mt-0" onClick={onBack} />
      <MonthSelector
        className="mt-5"
        hasNewerMonth={hasNewerMonth}
        hasOlderMonth={hasOlderMonth}
        headingAs="div"
        headingLabel={`${selectedMonth.month}월 리포트`}
        onNewerMonth={onNewerMonth}
        onOlderMonth={onOlderMonth}
        selectedMonth={selectedMonth}
      />
    </header>
  );
}
