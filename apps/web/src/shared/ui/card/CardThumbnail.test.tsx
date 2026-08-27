import { fireEvent, render } from '@testing-library/react';

import { CardThumbnail } from './CardThumbnail';

const THUMBNAIL_SRC = 'https://example.com/thumbnail.jpg';
const OTHER_THUMBNAIL_SRC = 'https://example.com/other-thumbnail.jpg';

describe('<CardThumbnail />', () => {
  it('이미지 URL이 있으면 이미지를 표시한다', () => {
    const { container } = render(<CardThumbnail src={THUMBNAIL_SRC} />);

    expect(container.querySelector('img')).toHaveAttribute('src', THUMBNAIL_SRC);
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });

  it('이미지 URL이 없으면 기본 썸네일 아이콘을 표시한다', () => {
    const { container } = render(<CardThumbnail src={null} />);

    expect(container.querySelector('img')).not.toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('이미지 로드에 실패하면 기본 썸네일 아이콘으로 교체한다', () => {
    const { container } = render(<CardThumbnail src={THUMBNAIL_SRC} />);

    const image = container.querySelector('img');
    expect(image).toBeInTheDocument();

    fireEvent.error(image as HTMLImageElement);

    expect(container.querySelector('img')).not.toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('로드 실패 후 다른 이미지 URL로 바뀌면 새 이미지를 다시 시도한다', () => {
    const { container, rerender } = render(<CardThumbnail src={THUMBNAIL_SRC} />);

    fireEvent.error(container.querySelector('img') as HTMLImageElement);
    expect(container.querySelector('svg')).toBeInTheDocument();

    rerender(<CardThumbnail src={OTHER_THUMBNAIL_SRC} />);

    expect(container.querySelector('img')).toHaveAttribute('src', OTHER_THUMBNAIL_SRC);
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });
});
