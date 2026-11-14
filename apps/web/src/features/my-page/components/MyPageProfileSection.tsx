import { EditIcon } from '@/shared/assets/icons';
import PageHeader from '@/shared/layout/page-header';
import { ProfileAvatar } from '@/shared/ui/profile-avatar';

type MyPageProfileSectionProps = {
  nickname?: string;
  profileImageUrl?: string | null;
  profileImageCode?: string;
  onBack: () => void;
  onEdit: () => void;
};

export default function MyPageProfileSection({
  nickname,
  profileImageUrl,
  profileImageCode,
  onBack,
  onEdit,
}: MyPageProfileSectionProps) {
  return (
    <section className="h-52.75" aria-labelledby="my-page-nickname">
      <div className="px-4">
        <PageHeader onBack={onBack} />
      </div>

      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          aria-label="프로필 수정"
          onClick={onEdit}
          className="relative size-25 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
        >
          <ProfileAvatar
            className="size-full"
            profileImageCode={profileImageCode}
            profileImageUrl={profileImageUrl}
          />
          <span className="absolute right-0 bottom-0 flex size-7 items-center justify-center rounded-full bg-neutral-00">
            <EditIcon className="size-full" aria-hidden="true" />
          </span>
        </button>
        <h1
          id="my-page-nickname"
          className="text-title-02-semibold text-neutral-700"
          data-mp-mask=""
        >
          {nickname || '닉네임'}
        </h1>
      </div>
    </section>
  );
}
