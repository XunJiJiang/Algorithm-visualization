import type {
  NodeType,
  GetBlockquoteConfigFunc,
  CreateChildrenFunc,
  BlockquoteProps,
} from '../../types/comp-markdown-comp-blockquote.d.ts';

import './index.scss';

import Icon from '../../../icon/index.tsx';

const styleKeyList = ['success', 'warn', 'danger', 'info'];

const createChildren: CreateChildrenFunc = (children, tag, hasTitle = false, title = '', attributes = {}) => {
  if (!styleKeyList.includes(tag)) return children;

  if (!hasTitle) {
    const _children = children
      .map((item, i) => {
        if (!('icon' in attributes) && (i === 0 || i === 1)) return false;
        if ('icon' in attributes && i === 1) {
          return (
            <p
              key={`markdown-blockquote-title-${tag}-icon`}
              className={`markdown-blockquote-title markdown-blockquote-title-icon markdown-blockquote-title-${tag}`}
            >
              <Icon name={attributes.icon!.value} className="markdown-blockquote-title-icon" />
            </p>
          );
        }
        return item;
      })
      .filter(item => !!item);

    return _children;
  }

  if (hasTitle) {
    const _children = children.map((item, i) => {
      if (i === 1) {
        return (
          <p
            key={`markdown-blockquote-title-${tag}-title`}
            className={`markdown-blockquote-title markdown-blockquote-title-${tag}`}
          >
            {'icon' in attributes && (
              <>
                <Icon name={attributes.icon!.value} className="markdown-blockquote-title-icon" />
                <span> </span>
              </>
            )}
            {title}
          </p>
        );
      }
      return item;
    });
    return _children;
  }

  return children;
};

const getBlockquoteConfig: GetBlockquoteConfigFunc = node => {
  if (!node) return [null, false, '', {}];

  let domText = '';
  const parser = new DOMParser();

  if ('value' in node) {
    domText += node.value;
  } else if ('children' in node) {
    if (Array.isArray(node.children)) {
      node.children.forEach(item => {
        domText += item.value;
      });
    } else {
      throw new Error('getBlockquoteConfig函数问题 块引用的子节点是对象不是数组');
    }
  } else {
    throw new Error('getBlockquoteConfig函数问题 块引用的子节点存在未知数据类型或结构');
  }

  const doc = parser.parseFromString(domText, 'application/xml');

  if (doc.getElementsByTagName('parsererror').length > 0) return [null, false, '', {}];

  const _node = doc.childNodes[0] as Element;

  const tag = _node.tagName;

  const title = _node.innerHTML;

  const attributes = _node.attributes;

  return [tag, title !== '', title, attributes];
};

export default function Blockquote({ node, className = '', children = [''] }: BlockquoteProps) {
  const [_children, _className] = (() => {
    if (node && node.children && node.children[1]) {
      const [key, hasTitle, title, attributes] = getBlockquoteConfig(node.children[1] as NodeType);
      if (Array.isArray(children) && key && styleKeyList.includes(key)) {
        return [createChildren(children, key, hasTitle, title, attributes), `markdown-blockquote-${key}`];
      } else {
        return [children, 'markdown-blockquote-info'];
      }
    } else {
      const _children = [
        '\n',
        <p key="markdown-blockquote-blank-block" className="markdown-blockquote-blank-block">
          空白的块引用
        </p>,
        '\n',
      ];
      return [_children, 'markdown-blockquote-info'];
    }
  })();
  return <blockquote className={`markdown-blockquote ${_className} ${className ?? ''}`}>{_children}</blockquote>;
}
