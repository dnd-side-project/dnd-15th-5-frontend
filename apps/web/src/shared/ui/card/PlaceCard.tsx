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
 * 이름과 주소는 한 줄을 넘으면 말줄임되며, 클릭 동작은 바깥의 버튼이나 링크가 담당합니다.
 */
export function PlaceCard({ thumbnailSrc, title, location }: PlaceCardProps) {
  return (
    <span className="flex w-full items-center gap-4">
      <CardThumbnail src={thumbnailSrc} radius="medium" />
      <span className="flex min-w-0 flex-col gap-2">
        <CardTitle weight="medium" className="text-neutral-700">
          {title}
        </CardTitle>
        <CardLocation>{location}</CardLocation>
      </span>
    </span>
  );
}
