/**
 * 获取字符串长度(px)
 * @param msg 字符串
 * @param _style 样式
 * @param _style.fontSize 字体大小
 * @param _style.fontFamily 字体
 * @returns 字符串长度(px)
 */
export const getStringWidth = (
  msg: string,
  _style: {
    fontSize?: number;
    fontFamily?: string;
  }
) => {
  const style = {
    fontSize: _style.fontSize ?? 12,
    fontFamily: _style.fontFamily ?? 'initial',
  };
  const { fontSize, fontFamily } = style;
  const stringWidthDom = document.createElement('span');
  stringWidthDom.innerHTML = msg;
  stringWidthDom.style.position = 'absolute';
  stringWidthDom.style.left = '-9999px';
  if (fontSize) stringWidthDom.style.fontSize = fontSize + 'px';
  else stringWidthDom.style.fontSize = 'initial';
  stringWidthDom.style.fontFamily = fontFamily;
  document.body.appendChild(stringWidthDom);
  const width = stringWidthDom.offsetWidth;
  document.body.removeChild(stringWidthDom);
  return width;
};
