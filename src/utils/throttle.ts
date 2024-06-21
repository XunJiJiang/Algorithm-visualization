function throttle(func: Function, delay = 1000) {
  let timeoutId: NodeJS.Timeout | null;
  let lastExecTime = 0;

  return function (...args: any[]) {
    const currentTime = Date.now();

    if (currentTime - lastExecTime < delay) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        lastExecTime = currentTime;
        func(...args);
      }, delay);
    } else {
      lastExecTime = currentTime;
      func(...args);
    }
  };
}

export { throttle };
