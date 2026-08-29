import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { cn } from '@/shared/lib/cn';

import type { Components } from 'react-markdown';

type MarkdownPolicyContentProps = {
  className?: string;
  content: string;
};

const MARKDOWN_COMPONENTS: Components = {
  h1: ({ children }) => <h1 className="text-heading-01-bold text-neutral-700">{children}</h1>,
  h2: ({ children }) => <h2 className="mt-8 text-title-01-bold text-neutral-700">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-5 text-title-02-bold text-neutral-700">{children}</h3>,
  p: ({ children }) => <p className="mt-3 text-body-01-regular text-neutral-600">{children}</p>,
  ul: ({ children }) => (
    <ul className="mt-3 list-disc space-y-1 pl-5 text-body-01-regular text-neutral-600">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-3 list-decimal space-y-1 pl-5 text-body-01-regular text-neutral-600">
      {children}
    </ol>
  ),
  li: ({ children }) => <li>{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-neutral-700">{children}</strong>,
  code: ({ children }) => (
    <code className="rounded-05 bg-neutral-100 px-1 py-0.5 text-caption-01-medium text-neutral-700">
      {children}
    </code>
  ),
  table: ({ children }) => (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full min-w-150 border-collapse text-caption-01-regular">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-neutral-100">{children}</thead>,
  th: ({ children }) => (
    <th className="border border-neutral-200 px-3 py-2 text-left text-neutral-700">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border border-neutral-200 px-3 py-2 align-top text-neutral-600">{children}</td>
  ),
};

/**
 * 약관·정책 문서의 마크다운 본문을 디자인 토큰 스타일로 렌더링합니다.
 *
 * `--color-*`가 꺼져 있어 시안 팔레트 색만 클래스로 쓸 수 있으므로, 마크다운 기본 태그마다
 * 스타일을 직접 매핑합니다. 표는 열이 많아 `overflow-x-auto`로 감싸 가로 스크롤합니다.
 */
export default function MarkdownPolicyContent({ className, content }: MarkdownPolicyContentProps) {
  return (
    <div className={cn('pb-10', className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={MARKDOWN_COMPONENTS}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
