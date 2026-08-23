import { Chip } from '@/shared/ui/chip';

import { CardThumbnail } from './CardThumbnail';
import { CardTitle } from './CardTitle';

import type { ComponentType, ReactNode, SVGProps } from 'react';

type PlaceTagCardTag = {
  label: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
};

type PlaceTagCardProps = {
  footer?: ReactNode;
  thumbnailSrc: string | null;
  thumbnailSize?: 'default' | 'large';
  title: string;
  tags: readonly PlaceTagCardTag[];
};

/**
 * 썸네일·이름·태그(지역·카테고리 등)로 장소를 표현하는 공통 카드입니다.
 *
 * 주소 대신 짧은 태그로 장소를 요약해서 보여줄 때 사용합니다. 태그는 아이콘이 있는 것과 없는 것을
 * 함께 쓸 수 있습니다(예: 지역 태그는 위치 아이콘, 카테고리 태그는 아이콘 없이 텍스트만). 태그가
 * 많아 한 줄을 넘으면 줄바꿈됩니다.
 * 클릭 동작이 필요하면 버튼이나 링크로 감싸서 사용합니다.
 *
 * @example
 * ```tsx
 * import { BlueLocationPinIcon } from '@/shared/assets/icons';
 * import { PlaceTagCard } from '@/shared/ui/card';
 *
 * <PlaceTagCard
 *   thumbnailSrc={shop.photoUrl}
 *   title={shop.name}
 *   tags={[
 *     { label: '용산구', icon: BlueLocationPinIcon },
 *     { label: '카페' },
 *   ]}
 * />
 * ```
 *
 * @param props - 카드 속성입니다.
 * @param props.footer - 태그 아래 오른쪽 정보 열에 표시할 선택 콘텐츠입니다.
 * @param props.thumbnailSrc - 썸네일 이미지 URL입니다. `null`이면 회색 배경으로 대체합니다.
 * @param props.thumbnailSize - 썸네일 크기입니다. 기본값은 60px이고 `large`는 90px입니다.
 * @param props.title - 장소 이름입니다.
 * @param props.tags - 표시할 태그 목록입니다. 각 태그의 `icon`은 선택 사항입니다.
 */
export function PlaceTagCard({
  footer,
  thumbnailSrc,
  thumbnailSize = 'default',
  title,
  tags,
}: PlaceTagCardProps) {
  return (
    <span className="flex w-full items-center gap-4">
      <CardThumbnail src={thumbnailSrc} size={thumbnailSize} />
      <span className="flex min-w-0 flex-col">
        <CardTitle weight="semibold">{title}</CardTitle>
        <span className="mt-2 flex flex-wrap gap-1">
          {tags.map(({ label, icon }) => (
            <Chip key={label} icon={icon}>
              {label}
            </Chip>
          ))}
        </span>
        {footer}
      </span>
    </span>
  );
}
