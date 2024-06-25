import type { FencedCodeBlocksProps, ShortCodeBlocksProps, CodeProps } from '../../types/comp-markdown-comp-code.d.ts';

import './index.scss';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism as StyleHighlighter } from 'react-syntax-highlighter/dist/esm/styles/prism';

function FencedCodeBlocks({ children, match }: FencedCodeBlocksProps) {
  return (
    <SyntaxHighlighter
      style={StyleHighlighter}
      className={`markdown-code markdown-long-code`}
      language={match[1]}
      PreTag="div"
      showLineNumbers={true}
      showInlineLineNumbers={true}
      customStyle={{
        paddingLeft: '0',
      }}
    >
      {children}
    </SyntaxHighlighter>
  );
}

const styleKeyList = ['success', 'warn', 'danger', 'info'];

function getShortCodeBlocksConfig(children: string | React.ReactNode) {
  if (!children)
    return {
      children: '',
      tag: 'info',
    };

  let domText = '';
  const parser = new DOMParser();

  if (typeof children === 'string') {
    domText = children;
  } else {
    throw new Error('getShortCodeBlocksConfig函数问题 块引用的子节点存在未知数据类型或结构');
  }

  const doc = parser.parseFromString(domText, 'application/xml');

  if (doc.getElementsByTagName('parsererror').length > 0)
    return {
      children,
      tag: 'info',
    };

  const element = doc.childNodes[0] as Element;
  const tag = element.tagName;

  const content = element.innerHTML;

  // const attributes = doc.childNodes[0].attributes;

  if (styleKeyList.includes(tag))
    return {
      children: content,
      tag,
    };

  return {
    children: content,
    tag: 'info',
  };
}

function ShortCodeBlocks({ children, className }: ShortCodeBlocksProps) {
  const { children: _children, tag } = getShortCodeBlocksConfig(children);
  return (
    <code className={`markdown-code markdown-short-code markdown-short-code-${tag} ${className ?? ''}`}>
      {_children}
    </code>
  );
}

function Code({ className = '', children = '', ...props }: CodeProps) {
  const match = /language-(\w+)/.exec(className ?? '');
  const _children = children ? String(children).replace(/\n$/, '') : ' ';
  return match ? (
    <FencedCodeBlocks match={match} {...props}>
      {_children}
    </FencedCodeBlocks>
  ) : (
    <ShortCodeBlocks className={className} {...props}>
      {children}
    </ShortCodeBlocks>
  );
}

export default Code;
