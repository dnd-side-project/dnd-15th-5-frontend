import { EditIcon } from '@/shared/assets/icons';
import { BackButton } from '@/shared/ui/back-button';
import { DefaultProfile } from '@/shared/ui/default-profile';

type MyPageProfileSectionProps = {
  nickname?: string;
  profileImageUrl?: string | null;
  onBack: () => void;
};

export default function MyPageProfileSection({
  nickname,
  profileImageUrl,
  onBack,
}: MyPageProfileSectionProps) {
  return (
    <section className="h-52.75" aria-labelledby="my-page-nickname">
      <div className="h-14">
        <BackButton className="ml-4" onClick={onBack} />
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="relative size-25">
          {profileImageUrl ? (
            <img
              className="size-full rounded-full object-cover"
              src={profileImageUrl}
              alt="프로필"
            />
          ) : (
            <DefaultProfile className="size-full" />
          )}
          <span className="absolute right-0 bottom-0 flex size-7 items-center justify-center rounded-full bg-neutral-00">
            <EditIcon className="size-full" aria-hidden="true" />
          </span>
        </div>
        <h1 id="my-page-nickname" className="text-title-02-semibold text-neutral-700">
          {nickname || '닉네임'}
        </h1>
      </div>
    </section>
  );
}
