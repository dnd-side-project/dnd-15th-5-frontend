import {
  ProfileEditCancelDialog,
  ProfileImageSelector,
  useProfileEditor,
} from '@/features/my-page';
import { BackButton } from '@/shared/ui/back-button';
import { Button } from '@/shared/ui/button';
import { StateView } from '@/shared/ui/state-view';

/** 프로필 수정 페이지입니다. */
export default function MyProfileEditPage() {
  const {
    account,
    accountQuery,
    canSave,
    handleBack,
    handleContinueEditing,
    handleDiscardChanges,
    handleSave,
    isCancelDialogOpen,
    isSaving,
    isSaveError,
    nickname,
    nicknameErrorMessage,
    profileImageCode,
    setNickname,
    setProfileImageCode,
    showNicknameError,
  } = useProfileEditor();

  if (accountQuery.isError || (!accountQuery.isPending && !account)) {
    return (
      <main className="-mx-4 px-4">
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

  if (accountQuery.isPending || !account) {
    return <main className="-mx-4" aria-label="계정 정보 불러오는 중" />;
  }

  return (
    <main className="mobile-frame fixed inset-0 flex flex-col overflow-y-auto">
      <div className="h-14 shrink-0">
        <BackButton className="ml-4" onClick={handleBack} />
      </div>

      <ProfileImageSelector selectedCode={profileImageCode} onSelect={setProfileImageCode} />

      <div className="px-4 pt-8">
        <label htmlFor="profile-nickname" className="text-body-02-semibold text-neutral-700">
          이름
        </label>
        <input
          id="profile-nickname"
          type="text"
          value={nickname}
          autoComplete="nickname"
          onChange={(event) => setNickname(event.target.value)}
          aria-invalid={showNicknameError}
          aria-describedby={showNicknameError ? 'nickname-error' : undefined}
          className={`mt-2 h-13 w-full rounded-08 border px-4 text-body-01-regular text-neutral-700 outline-none placeholder:text-neutral-400 ${showNicknameError ? 'border-notification focus:border-notification' : 'border-neutral-300 focus:border-primary-500'}`}
        />
        {showNicknameError && (
          <p
            id="nickname-error"
            role="alert"
            className="mt-2 text-label-01-medium text-notification"
          >
            {nicknameErrorMessage}
          </p>
        )}
        {isSaveError && (
          <p role="alert" className="mt-2 text-label-01-medium text-notification">
            저장하지 못했어요. 잠시 후 다시 시도해주세요.
          </p>
        )}
      </div>

      <div className="mt-auto px-4 pt-8 pb-safe-bottom">
        <Button
          type="button"
          disabled={!canSave}
          isLoading={isSaving}
          onClick={handleSave}
          className="mb-8 h-14 rounded-full"
        >
          저장하기
        </Button>
      </div>

      {isCancelDialogOpen && (
        <ProfileEditCancelDialog
          onCancel={handleDiscardChanges}
          onContinue={handleContinueEditing}
        />
      )}
    </main>
  );
}
