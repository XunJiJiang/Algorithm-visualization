import type {
  ChangeLocationFunc,
  ContentsINPageProps,
  ContentsINPageRef,
  ContentLabelType,
} from '../../types/comp-page-template-comp-contents.d.ts';

import type { ContentType } from '../../../markdown/types/comp-markdown.d.ts';

import './index.scss';
import { useRef, forwardRef, useImperativeHandle, useEffect } from 'react';

function createHref(label: ContentLabelType): string {
  if (typeof label === 'string') {
    return label;
  }

  if (typeof label === 'object' && label !== null) {
    if (Array.isArray(label)) {
      return label.reduce((prev: string, current: ContentLabelType) => {
        return prev + createHref(current);
      }, '');
    } else {
      if ('props' in label) return label!.props.children;
    }
  }

  throw new Error('createHref 发生未知错误');
}

const ContentsINPage = forwardRef(function _ContentsINPage(
  { contents }: ContentsINPageProps,
  ref: React.ForwardedRef<ContentsINPageRef>
) {
  const ulRef = useRef(null);

  const liList = useRef<HTMLElement[]>([]);

  const lastFocusLi = useRef<HTMLElement | null>(null);

  const changeLocation: ChangeLocationFunc = content => {
    const liNode = document.getElementById(`contents-in-page-${content.id}`) ?? content.node;
    lastFocusLi.current && lastFocusLi.current.setAttribute('data-active', `${false}`);
    liNode.setAttribute('data-active', `${true}`);
    lastFocusLi.current = liNode;
  };

  useEffect(() => {
    const viewHeight = window.innerHeight;
    if (liList.current[0] && contents[0].offsetTop <= viewHeight / 2) {
      liList.current[0].setAttribute('data-active', `${true}`);
    }
  });

  useImperativeHandle(ref, () => ({
    changeLocation,
  }));

  return (
    <nav className="contents-in-page">
      <span className="contents-in-page-title">目录</span>
      <ul ref={ulRef}>
        {contents
          .filter((content: ContentType) => {
            return content.level !== 1;
          })
          .map((content: ContentType, index: number) => {
            return (
              <li
                id={`contents-in-page-${content.id}`}
                className="contents-in-page-item-box"
                ref={node => {
                  node && liList.current.push(node);
                }}
                key={index}
                onClick={() => {
                  const id = content.id;
                  const node = content.node;
                  if (id && node) {
                    node.scrollIntoView();
                  } else {
                    console.warn('目录项对应的节点不存在');
                  }
                }}
              >
                <a
                  href={`#${createHref(content.label)}`}
                  className={`contents-in-page-item contents-in-page-item-${content.level}`}
                >
                  {content.label}
                </a>
              </li>
            );
          })}
      </ul>
    </nav>
  );
});

export default ContentsINPage;
