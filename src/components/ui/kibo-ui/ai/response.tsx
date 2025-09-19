'use client';

import {
  type BundledLanguage,
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockFilename,
  CodeBlockFiles,
  CodeBlockHeader,
  CodeBlockItem,
  type CodeBlockProps,
  CodeBlockSelect,
  CodeBlockSelectContent,
  CodeBlockSelectItem,
  CodeBlockSelectTrigger,
  CodeBlockSelectValue,
} from '../code-block';
import type { HTMLAttributes } from 'react';
import { memo } from 'react';
import ReactMarkdown, { type Options } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import rehypeRaw from 'rehype-raw';

export type AIResponseProps = HTMLAttributes<HTMLDivElement> & {
  options?: Options;
  children: Options['children'];
};

const components: Options['components'] = {
  p: ({ node, children, className, ...props }) => (
    <p className={cn('mb-4 leading-relaxed', className)} {...props}>
      {children}
    </p>
  ),
  ol: ({ node, children, className, ...props }) => (
    <ol className={cn('ml-4 list-outside list-decimal', className)} {...props}>
      {children}
    </ol>
  ),
  li: ({ node, children, className, ...props }) => (
    <li className={cn('py-1', className)} {...props}>
      {children}
    </li>
  ),
  ul: ({ node, children, className, ...props }) => (
    <ul className={cn('ml-4 list-outside list-decimal', className)} {...props}>
      {children}
    </ul>
  ),
  strong: ({ node, children, className, ...props }) => (
    <span className={cn('font-semibold', className)} {...props}>
      {children}
    </span>
  ),
  a: ({ node, children, className, ...props }) => (
    <a
      className={cn('font-medium text-primary underline', className)}
      rel="noreferrer"
      target="_blank"
      {...props}
    >
      {children}
    </a>
  ),

  h1: ({ node, children, className, ...props }) => (
    <h1
      className={cn('mt-6 mb-2 font-semibold text-3xl', className)}
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ node, children, className, ...props }) => (
    <h2
      className={cn('mt-6 mb-2 font-semibold text-2xl', className)}
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ node, children, className, ...props }) => (
    <h3 className={cn('mt-6 mb-2 font-semibold text-xl', className)} {...props}>
      {children}
    </h3>
  ),
  h4: ({ node, children, className, ...props }) => (
    <h4 className={cn('mt-6 mb-2 font-semibold text-lg', className)} {...props}>
      {children}
    </h4>
  ),
  h5: ({ node, children, className, ...props }) => (
    <h5
      className={cn('mt-6 mb-2 font-semibold text-base', className)}
      {...props}
    >
      {children}
    </h5>
  ),
  h6: ({ node, children, className, ...props }) => (
    <h6 className={cn('mt-6 mb-2 font-semibold text-sm', className)} {...props}>
      {children}
    </h6>
  ),
  pre: ({ node, className, children }) => {
    let language = 'text';

    // Try to detect language from <code> className
    const codeNode = node?.children?.[0];
    if (codeNode?.type === 'element' && codeNode.tagName === 'code') {
      const classNames = codeNode.properties?.className;
      if (Array.isArray(classNames)) {
        const langClass = classNames.find(
          (cls) => typeof cls === 'string' && cls.startsWith('language-')
        );
        if (langClass) {
          language = langClass.toString().replace('language-', '');
        }
      }
    }

    // Check if children is actually a <code> element
    const childrenIsCode =
      typeof children === 'object' &&
      children !== null &&
      'type' in children &&
      children.type === 'code';

    // If it's not a <code> element yet (streaming incomplete), render plain <pre>
    if (!childrenIsCode) {
      return <pre className={className}>{children}</pre>;
    }

    // Safely extract code string (fallback to empty string)
    const codeString =
      (children as any)?.props?.children?.toString?.() ?? '';

    // If code is still empty (streaming), render plain <pre>
    if (!codeString.trim()) {
      return <pre className={className}>{children}</pre>;
    }

    // Prepare data for CodeBlock
    const data: CodeBlockProps['data'] = [
      {
        language,
        filename: `code.${language}`,
        code: codeString,
      },
    ];

    return (
      <CodeBlock
        className={cn('my-4 h-auto', className)}
        data={data}
        defaultValue={data[0].language}
      >
        <CodeBlockHeader>
          <CodeBlockFiles>
            {(item) => (
              <CodeBlockFilename key={item.language} value={item.language}>
                {item.filename}
              </CodeBlockFilename>
            )}
          </CodeBlockFiles>
          <CodeBlockCopyButton
            className="border-none"
            onCopy={() => console.log('Copied code to clipboard')}
            onError={() => console.error('Failed to copy code to clipboard')}
          />
        </CodeBlockHeader>
        <CodeBlockBody>
          {(item) => (
            <CodeBlockItem key={item.language} value={item.language}>
              <CodeBlockContent
                language={item.language as BundledLanguage}
                themes={{
                  light: 'slack-ochin',
                  dark: 'gruvbox-dark-medium',
                }}
              >
                {item.code}
              </CodeBlockContent>
            </CodeBlockItem>
          )}
        </CodeBlockBody>
      </CodeBlock>
    );
  }
};

export const AIResponse = memo(
  ({ className, options, children, ...props }: AIResponseProps) => {
    return (
      <div
        className={cn(
          'size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
          className
        )}
        {...props}
      >
        <ReactMarkdown
          components={components}
          remarkPlugins={[remarkGfm]}
          {...options}
        >
          {children}
        </ReactMarkdown>
      </div>
    )
  },
  (prevProps, nextProps) =>
    prevProps.children === nextProps.children
);
