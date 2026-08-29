import { useParams } from 'react-router-dom';

import { useGetSharedPersonaCard } from '@/features/report/apis/queries';
import ReportPreferenceShareScreen from '@/features/report/components/monthly-report/report-preference-card/ReportPreferenceShareScreen';
import { mapSharedPersonaCard } from '@/features/report/utils/sharedPersona';
import { Spinner } from '@/shared/ui/spinner';
import { StateView } from '@/shared/ui/state-view';

/** 공유 토큰으로 로그인 없이 다른 사용자의 월간 취향 카드를 보여줍니다. */
export default function SharedReportPage() {
  const { shareToken = '' } = useParams();
  const sharedCardQuery = useGetSharedPersonaCard(shareToken, {
    query: {
      enabled: Boolean(shareToken),
      select: ({ data }) => (data ? mapSharedPersonaCard(data) : undefined),
      retry: 1,
    },
  });

  if (sharedCardQuery.isPending) {
    return (
      <main
        aria-label="공유 취향 카드 불러오는 중"
        className="flex min-h-dvh items-center justify-center"
        role="status"
      >
        <Spinner className="size-7 text-primary-500" />
      </main>
    );
  }

  if (!sharedCardQuery.data) {
    return (
      <main className="flex min-h-dvh items-center bg-neutral-00 px-4">
        <StateView
          actionLabel="챱챱 시작하기"
          description={'공유 링크가 만료되었거나\n올바르지 않아요'}
          headingAs="h1"
          title="취향 카드를 불러오지 못했어요"
          to="/"
          variant="error"
        />
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh items-start justify-center overflow-x-hidden">
      <ReportPreferenceShareScreen {...sharedCardQuery.data} />
    </main>
  );
}
