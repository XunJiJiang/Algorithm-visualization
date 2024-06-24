import type { ImgProps } from '../../types/comp-markdown-comp-img.d.ts';

import './index.scss';

function Img({ src = '', alt = '', className = '', ...props }: ImgProps) {
  return (
    <img
      className={`markdown-img ${className ?? ''}`}
      src={src}
      alt={alt}
      onError={e => {
        if ('setAttribute' in e.target && typeof e.target.setAttribute === 'function')
          e.target.setAttribute('data-img-is-error', true);
      }}
      onLoad={e => {
        if ('setAttribute' in e.target && typeof e.target.setAttribute === 'function')
          e.target.setAttribute('data-img-is-error', false);
      }}
      {...props}
    />
  );
}

export default Img;
