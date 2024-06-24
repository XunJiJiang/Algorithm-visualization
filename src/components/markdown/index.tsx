import type {
  ContentType,
  ContentsType,
  MarkdownComponentProps,
  MarkdownComponentRef
} from './types/comp-markdown.d.ts';
import type { Components } from 'react-markdown';

import './index.scss';
import { forwardRef, useImperativeHandle, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
// import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// import { prism as StyleHighlighter } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import Code from './components/code/index.tsx';
import A from './components/a/index.tsx';
import Blockquote from './components/blockquote/index.tsx';
import Pre from './components/pre/index.tsx';
import Img from './components/img/index.tsx';
import { H1, H2, H3 } from './components/title/index.tsx';

const MarkdownComponent = forwardRef(function _MarkdownComponent(
  { markdown }: MarkdownComponentProps,
  ref: React.ForwardedRef<MarkdownComponentRef>
) {
  // 保存目录项
  const contents = useRef<ContentsType>([]);

  // 保存当前指向的目录项下标, 当且仅当目录项的节点成功渲染时, 下标指向下一个目录项
  const contentsIndex = useRef(0);

  useEffect(() => {
    contents.current.forEach((content) => {
      const { node } = content;
      if (!node) return;
      // 保存节点的占位高度
      const offsetTop = node.offsetTop;
      const marginTop = parseInt(window.getComputedStyle(node).marginTop);
      content.offsetTop = offsetTop + marginTop;
    });
    // 重置当前指向的目录项下标
    contentsIndex.current = 0;
  });

  /**
   * 设置 contents
   */
  function setContents(content: ContentType) {
    // 当前目录项已经存入目录项列表时, 更新其对应的节点
    if (contents.current[contentsIndex.current] && content.node) {
      contents.current[contentsIndex.current].node = content.node;
    }

    // 当前目录项未存入目录项列表时, 存入目录项列表
    if (!contents.current[contentsIndex.current]) {
      contents.current[contentsIndex.current] = content;
    }

    // 若传入的目录项的节点成功渲染, 则成功存入目录项, 下标指向下一个目录项
    if (content.node) {
      contentsIndex.current++;
    }
  }

  const components: Components = {
    code(props) {
      return <Code {...props} />;
    },
    a({ className, children, ...props }) {
      return (
        <A className={`markdown-link ${className ?? ''}`} {...props}>
          {children}
        </A>
      );
    },
    blockquote(props) {
      return <Blockquote {...props} />;
    },
    pre(props) {
      return <Pre {...props} />;
    },
    img(props) {
      return <Img {...props} />;
    },
    h1(props) {
      return <H1 {...props} setContents={setContents} />;
    },
    h2(props) {
      return <H2 {...props} setContents={setContents} />;
    },
    h3(props) {
      return <H3 {...props} setContents={setContents} />;
    }
  };

  useImperativeHandle(ref, () => ({
    contents
  }));

  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      className="markdown"
      components={components}
    >
      {markdown}
    </Markdown>
  );
});

export default MarkdownComponent;
