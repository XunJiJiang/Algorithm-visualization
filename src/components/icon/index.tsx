import type { IconProps } from './comp-icon.d.ts';

import './index.scss';
import '../../assets/font/iconfont.css';

export default function Icon({ name = '', className = '', size }: IconProps) {
  return <i className={`icon iconfont icon-${name} ${className}`} style={size ? { fontSize: size + 'px' } : {}} />;
}
