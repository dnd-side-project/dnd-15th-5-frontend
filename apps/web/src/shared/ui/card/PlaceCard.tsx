import { CardLocation } from './CardLocation';
import { CardThumbnail } from './CardThumbnail';
import { CardTitle } from './CardTitle';

type PlaceCardProps = {
  thumbnailSrc: string | null;
  title: string;
  location: string;
};

/**
 * 썸네일·이름·주소로 장소를 표현하는 공통 카드입니다.
 *
 * 주소를 그대로 보여줄 때 사용합니다. 태그로 요약해서 보여주려면 `PlaceTagCard`를 사용합니다.
 * 이름과 주소는 한 줄을 넘으면 말줄임됩니다.
 * 클릭 동작이 필요하면 버튼이나 링크로 감싸서 사용합니다.
 *
 * @example
 * ```tsx
 * import { PlaceCard } from '@/shared/ui/card';
 *
 * <button type="button" onClick={() => handleSelect(shop)}>
 *   <PlaceCard thumbnailSrc={shop.photoUrl} title={shop.name} location={shop.address} />
 * </button>
 * ```
 *
 * @param props - 카드 속성입니다.
 * @param props.thumbnailSrc - 썸네일 이미지 URL입니다. `null`이면 회색 배경으로 대체합니다.
 * @param props.title - 장소 이름입니다.
 * @param props.location - 장소 주소입니다.
 */
export function PlaceCard({ thumbnailSrc, title, location }: PlaceCardProps) {
  return (
    <div className="flex w-full items-center gap-4">
      <CardThumbnail src={thumbnailSrc} />
      <div className="min-w-0">
        <CardTitle>{title}</CardTitle>
        <CardLocation>{location}</CardLocation>
      </div>
    </div>
  );
}
