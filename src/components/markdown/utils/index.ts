import type { CreateIdSlicesFunc, CreateIdFunc } from '../types/comp-markdown-utils.d.ts';

// 记录每个标题的 id 的由空格分割的字符串对应的 key
const idSliceMap = new Map();
// 下一个分割字符串的 key
let keyIndex = 1;

const createIdSlices: CreateIdSlicesFunc = children => {
  if (typeof children === 'string') return children.split(' ');
  if (typeof children === 'object' && children !== null) {
    if (Array.isArray(children)) {
      return children
        .map(item => {
          if (typeof item === 'string') return item;
          else return createIdSlices(item.props.children);
        })
        .flat();
    } else return createIdSlices('props' in children ? children.props.children : null);
  }
  throw new Error('createIdSlices 函数可能存在问题');
};

/**
 * 创建标题的 id
 */
export const createId: CreateIdFunc = children => {
  const idSlices = createIdSlices(children);
  let id = '';
  idSlices.forEach(slice => {
    const key = idSliceMap.get(slice);
    if (key) {
      id += `-${key}`;
    } else {
      id += `-${keyIndex}`;
      idSliceMap.set(slice, keyIndex++);
    }
  });
  return 'markdown-title' + id + '-';
  // + randomCharacters(20);
};
