import { useNavigate } from 'react-router-dom';

import {
  LogoutButton,
  MyPageMenuItem,
  MyPageMenuSection,
  MyPageProfileSection,
  MyPageShortcutMenu,
  useGetMyAccount,
} from '@/features/my-page';
import { AccountRemoveIcon, ContactIcon, TermsIcon } from '@/shared/assets/icons';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';

export default function MyPage() {
  const navigate = useNavigate();
  const accountQuery = useGetMyAccount();
  const account = accountQuery.data?.data;

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
          <MyPageMenuItem icon={ContactIcon} label="문의하기" />
        </MyPageMenuSection>

        <MyPageMenuSection className="mt-4">
          <LogoutButton />
          <MyPageMenuItem icon={AccountRemoveIcon} label="회원탈퇴" />
        </MyPageMenuSection>
      </section>
    </main>
  );
}
