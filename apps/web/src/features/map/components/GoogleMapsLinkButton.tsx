import { getGoogleMapsPlaceUrl } from '@/features/map/utils/recommendation';
import { ExternalLinkIcon } from '@/shared/assets/icons';
import { LinkButton } from '@/shared/ui/button';

type GoogleMapsLinkButtonProps = {
  address: string;
  googleMapsUri?: string | null;
  placeName: string;
};

/** Google Maps에서 장소를 여는 아이콘 버튼입니다. */
export default function GoogleMapsLinkButton({
  address,
  googleMapsUri,
  placeName,
}: GoogleMapsLinkButtonProps) {
  return (
    <LinkButton
      to={getGoogleMapsPlaceUrl(placeName, address, googleMapsUri)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${placeName} 지도앱에서 확인하기`}
      variant="icon-primary"
      size="large"
      className="w-16 shrink-0"
    >
      <ExternalLinkIcon aria-hidden="true" className="size-6" />
    </LinkButton>
  );
}
