import type { PageTemplateProps } from './types/comp-page-template.d.ts';
import type { ContentsINPageRef } from './types/comp-page-template-comp-contents.d.ts';
import type { ContentsType, MarkdownComponentRef } from '../markdown/types/comp-markdown.d.ts';

import './index.scss';
import { useRef, useState } from 'react';
import MarkdownComponent from '../markdown/index.tsx';
import Contents from './components/contents/index.tsx';

const scrollEvent = 'scroll';

export function PageTemplate({ children, markdown = '> 没有 markdown 文本' }: PageTemplateProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const markdownRef = useRef<MarkdownComponentRef | null>(null);

  const markdownContentsRef = useRef<ContentsINPageRef | null>(null);

  const [markdownContents, setMarkdownContents] = useState<ContentsType>([]);

  /**
   * 滚动事件处理
   */
  function scrollHandler() {
    if (markdownContentsRef.current && markdownContentsRef.current.changeLocation) {
      const viewHeight = window.innerHeight;
      const inView: ContentsType = [];
      for (let i = markdownContents.length - 1; i >= 0; i--) {
        const content = markdownContents[i];
        if (
          scrollRef.current &&
          content.offsetTop <= scrollRef.current.scrollTop + viewHeight / 2 &&
          content.offsetTop >= scrollRef.current.scrollTop - 16
        ) {
          inView.push(content);
        }
        if (scrollRef.current && content.offsetTop < scrollRef.current.scrollTop - 16) {
          if (inView.length === 0) {
            markdownContentsRef.current.changeLocation(content);
          } else {
            const lastInView = inView.pop();
            if (lastInView) {
              markdownContentsRef.current.changeLocation(lastInView);
            }
          }
          break;
        }
      }
    }
  }

  return (
    <div
      ref={node => {
        if (node) {
          node.removeEventListener(scrollEvent, scrollHandler);
          node.addEventListener(scrollEvent, scrollHandler);
        }
        scrollRef.current = node;
        return node;
      }}
      className="page-template-box"
      id="page-template-box"
    >
      <div className="page-template">
        <div className="page-template-markdown">
          <MarkdownComponent
            ref={node => {
              if (node && node.contents.current && markdownContents.length === 0) {
                setMarkdownContents(node.contents.current);
              }
              return markdownRef;
            }}
            markdown={markdown}
          />
        </div>
        {children && <div className="page-template-render">{children}</div>}
        {markdownContents.filter(c => c.level !== 1).length > 0 && (
          <div className="page-template-contents">
            <Contents ref={markdownContentsRef} contents={markdownContents} />
          </div>
        )}
      </div>
    </div>
  );
}
