import { useNavigate } from 'react-router-dom';

import {
  ContactButton,
  LogoutButton,
  MyPageMenuItem,
  MyPageMenuSection,
  MyPageProfileSection,
  MyPageShortcutMenu,
  WithdrawAccountButton,
  useGetMyAccount,
} from '@/features/my-page';
import { TermsIcon } from '@/shared/assets/icons';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import { StateView } from '@/shared/ui/state-view';

export default function MyPage() {
  const navigate = useNavigate();
  const accountQuery = useGetMyAccount();
  const account = accountQuery.data?.data;

  // TODO: 계정 정보 조회 중에는 프로필 영역에 스켈레톤 UI를 표시한다.
  if (accountQuery.isError || (!accountQuery.isPending && !account)) {
    return (
      <main className="-mx-4 min-h-dvh bg-neutral-00 px-4">
        <StateView
          variant="error"
          headingAs="h1"
          title="계정 정보를 불러오지 못했어요"
          description="잠시 후 다시 시도해주세요."
          actionLabel="다시 불러오기"
          onAction={() => void accountQuery.refetch()}
          className="pt-30"
        />
      </main>
    );
  }

  return (
    <main className="-mx-4 min-h-dvh bg-primary-100">
      <MyPageProfileSection
        nickname={account?.nickname}
        profileImageUrl={account?.profileImageUrl}
        onBack={() => navigate(-1)}
      />

      <section className="min-h-[calc(100dvh-211px)] rounded-t-30 bg-neutral-00 shadow-my-page-sheet">
        <h2 className="sr-only">마이페이지 메뉴</h2>

        <MyPageShortcutMenu
          onRecordClick={() => navigate(ROUTE_PATHS.spendingHistory)}
          onNotificationClick={() => navigate(ROUTE_PATHS.notifications)}
        />

        <MyPageMenuSection>
          <MyPageMenuItem icon={TermsIcon} label="이용약관 및 개인정보처리방침" />
          <ContactButton />
        </MyPageMenuSection>

        <MyPageMenuSection className="mt-4">
          <LogoutButton />
          <WithdrawAccountButton />
        </MyPageMenuSection>
      </section>
    </main>
  );
}
