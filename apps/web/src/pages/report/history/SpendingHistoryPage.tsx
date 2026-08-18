import { ReportTabs } from '@/features/report';

export default function SpendingHistoryPage() {
  return (
    <main>
      <ReportTabs active="history" />
      <p>소비 기록 페이지</p>
    </main>
  );
}
