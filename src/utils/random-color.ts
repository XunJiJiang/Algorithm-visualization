  export function randomColor(start = 0, end = 0xffffff) {
    const color = Math.floor(Math.random() * (end - start) + start).toString(16);
    return `#${'0'.repeat(6 - color.length)}${color}`;
  }