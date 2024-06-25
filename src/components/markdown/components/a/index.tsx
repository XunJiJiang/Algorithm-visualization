import type { APopoverProps } from '../../types/comp-markdown-comp-a.d.ts';

import './index.scss';
import { useRef, useEffect } from 'react';
import Icon from '../../../icon/index.tsx';
import { getStringWidth } from '../../../../utils/getStringWidth';

export default function APopover({ className = '', children, href = '' }: APopoverProps) {
  const aRef = useRef<HTMLAnchorElement>(null);
  const popoverRef = useRef<HTMLElement>(null);
  const timeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!aRef.current || !aRef.current.parentNode || !popoverRef.current) return;
    // 获取其距离父元素左侧的距离
    const aParentNodeLeft = (aRef.current.parentNode as HTMLElement).offsetLeft;
    const aParentNodeWidth = (aRef.current.parentNode as HTMLElement).offsetWidth;
    const aLift = aRef.current.offsetLeft - aParentNodeLeft;
    const aWidth = getStringWidth(aRef.current.innerText, { fontSize: 16 });
    const popoverWidth = getStringWidth(popoverRef.current.innerText, { fontSize: 16 }) + 20;
    if (popoverWidth > aParentNodeWidth) {
      // 以下分支的前提是popover的中心在a元素的中心
      // popover的宽度大于父元素的宽度, 设置popover的宽度为父元素的宽度
      popoverRef.current.style.width = aParentNodeWidth - 20 + 'px';
    } else if (aLift + aWidth / 2 + popoverWidth / 2 > aParentNodeWidth) {
      //  popover右侧超出父元素右侧, 设置popover右侧与父元素右侧对齐
      popoverRef.current.style.left = -(aLift + popoverWidth - aParentNodeWidth) + 'px';
    } else if (aLift > (popoverWidth - aWidth) / 2) {
      // popover两侧均未超出父元素, 设置popover中心与a元素中心对齐
      popoverRef.current.style.left = aWidth / 2 - popoverWidth / 2 + 'px';
    } else {
      // popover左侧超出父元素左侧, 设置popover左侧与父元素左侧对齐
      popoverRef.current.style.left = 'auto';
    }
  }, []);

  return (
    <a
      ref={aRef}
      className={`${className} a-link`}
      onMouseEnter={() => {
        if (!popoverRef.current) return;
        clearTimeout(timeout.current);
        popoverRef.current.style.display = 'block';
        const _ = popoverRef.current.offsetHeight;
        Promise.resolve(_).then(() => {
          if (!popoverRef.current) return;
          popoverRef.current.classList.add('a-popover-show');
        });
      }}
      onMouseLeave={() => {
        if (!popoverRef.current) return;
        popoverRef.current.classList.remove('a-popover-show');
        timeout.current = setTimeout(() => {
          if (!popoverRef.current) return;
          popoverRef.current.style.display = 'none';
        }, 300);
      }}
      onClick={e => {
        e.preventDefault();
        window.ipcRenderer.send('open-default-browser', href);
      }}
    >
      {children}
      <Icon name="link" className="a-popover-icon" />
      <span ref={popoverRef} className="a-popover">
        {href}
      </span>
    </a>
  );
}
