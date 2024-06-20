const menuNode = document.querySelector('#menu-container') as HTMLElement;
const rootMenuNode = document.querySelector('#root-menu-container') as HTMLElement;
const codeMenuNode = document.querySelector('#code-menu-container') as HTMLElement;
const codeNode = document.querySelector('#code-container') as HTMLElement;
const canvasNode = document.querySelector('#canvas-container') as HTMLElement;

function rootMenuNodeDisappear() {
  menuNode.style.display = 'none';
}

function rootMenuNodeAppear() {
  menuNode.style.display = 'flex';
}

function codeMenuNodeDisappear() {
  codeMenuNode.style.display = 'none';
}

function codeMenuNodeAppear() {
  codeMenuNode.style.display = 'block';
}

function codeNodeDisappear() {
  codeNode.style.display = 'none';
}

function codeNodeAppear() {
  codeNode.style.display = 'block';
}

function canvasNodeDisappear() {
  canvasNode.style.display = 'none';
}

function canvasNodeAppear() {
  canvasNode.style.display = 'block';
}

codeMenuNodeDisappear();
codeNodeDisappear();
canvasNodeDisappear();

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
