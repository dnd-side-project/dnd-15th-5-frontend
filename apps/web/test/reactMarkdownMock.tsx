import type { ReactNode } from 'react';

type ReactMarkdownMockProps = {
  children?: ReactNode;
};

/** react-markdown은 ESM 전용 배포라 Jest에서 파싱하지 못해, 원문을 그대로 렌더링하는 스텁으로 대체한다. */
export default function ReactMarkdownMock({ children }: ReactMarkdownMockProps) {
  return <div>{children}</div>;
}
