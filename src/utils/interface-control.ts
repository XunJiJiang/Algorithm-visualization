const menuNode = document.querySelector('#menu-container') as HTMLElement;
const rootMenuNode = document.querySelector('#root-menu-container') as HTMLElement;
const codeMenuNode = document.querySelector('#code-menu-container') as HTMLElement;
const codeNode = document.querySelector('#code-container') as HTMLElement;
const canvasNode = document.querySelector('#canvas-container') as HTMLElement;

function rootMenuNodeDisappear() {
  rootMenuNode.style.transform = 'translate(0, 200px)';
  setTimeout(() => {
    (menuNode.childNodes[3] as HTMLParagraphElement).style.transform = 'translate(0, 200px)';
  }, 70);
  setTimeout(() => {
    ((menuNode.childNodes[1] as HTMLTitleElement) || (menuNode.childNodes[0] as HTMLTitleElement)).style.transform =
      'translate(0, 200px)';
  }, 140);
  setTimeout(() => {
    menuNode.style.opacity = '0';
  }, 20);
  setTimeout(() => {
    menuNode.style.height = 'none';
  }, 1000);
}

function rootMenuNodeAppear() {
  menuNode.style.height = '';
  menuNode.style.opacity = '1';
  setTimeout(() => {
    (menuNode.childNodes[1] as HTMLTitleElement).style.transform = 'translate(0, 0)';
    (menuNode.childNodes[3] as HTMLParagraphElement).style.transform = 'translate(0, 0)';
    rootMenuNode.style.transform = 'translate(0, 0)';
  }, 10);
}

function codeMenuNodeDisappear() {
  codeMenuNode.style.transform = 'translate(-100%, 0%)';
}

codeMenuNodeDisappear();

function codeMenuNodeAppear() {
  codeMenuNode.style.transform = 'translate(0%, 0%)';
  setTimeout(() => {
    codeMenuNode.offsetHeight;
  }, 1000);
}

function codeNodeDisappear() {
  // codeNode.style.transform = 'scale(0.5)';
  // codeNode.style.opacity = '0';
}

function codeNodeAppear() {
  // codeNode.style.transform = 'scale(1)';
  // codeNode.style.opacity = '1';
}

function canvasNodeDisappear() {
  // canvasNode.style.transform = 'scale(0.5)';
  // canvasNode.style.opacity = '0';
}

function canvasNodeAppear() {
  // canvasNode.style.transform = 'scale(1)';
  // canvasNode.style.opacity = '1';
}

const interfaceControl = {
  rootMenuNodeDisappear,
  rootMenuNodeAppear,
  codeMenuNodeDisappear,
  codeMenuNodeAppear,
  codeNodeDisappear,
  codeNodeAppear,
  canvasNodeDisappear,
  canvasNodeAppear,
};

export default interfaceControl;
