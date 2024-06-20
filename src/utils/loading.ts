const loadingContainer = document.querySelector('#loading-container') as HTMLElement;
const loadingRound1 = document.querySelector('#loadingRound1') as HTMLElement;
const loadingRound2 = document.querySelector('#loadingRound2') as HTMLElement;
const loadingRound3 = document.querySelector('#loadingRound3') as HTMLElement;

function loadingControl(isVisible = true, hasTransition = true) {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  if (isVisible) {
    const diameter = Math.min(windowWidth, windowHeight);
    visible(diameter, hasTransition);
  } else {
    const diameter = Math.sqrt(windowWidth ** 2 + windowHeight ** 2);
    invisible(diameter, hasTransition);
  }
}

function visible(diameter: number, hasTransition: boolean) {
  loadingContainer.style.height = '';
  setTimeout(() => {
    loadingRound1.style.transition = hasTransition ? 'all 1s' : 'none';
    loadingRound1.style.animationName = 'scaleAnimation';
    loadingRound3.style.setProperty('--diameter', `${diameter * 0.4}px`);
  }, 0);
  setTimeout(() => {
    loadingRound2.style.setProperty('--diameter', `${diameter * 0.6}px`);
  }, 100);
  setTimeout(() => {
    loadingRound1.style.setProperty('--diameter', `${diameter * 0.8}px`);
    loadingContainer.style.opacity = '1';
  }, 200);
}

function invisible(diameter: number, hasTransition: boolean) {
  setTimeout(() => {
    loadingRound1.style.setProperty('--diameter', `${diameter + 1000}px`);
  }, 0);
  setTimeout(() => {
    loadingRound2.style.setProperty('--diameter', `${diameter + 500}px`);
  }, 100);
  setTimeout(() => {
    loadingRound3.style.setProperty('--diameter', `${diameter}px`);
    loadingContainer.style.opacity = '0';
  }, 200);
  setTimeout(() => {
    loadingRound1.style.transition = hasTransition ? 'all 1s' : 'none';
    loadingRound1.style.animationName = 'none';
    loadingContainer.style.height = '0';
  }, 1200);
}

export default loadingControl;
