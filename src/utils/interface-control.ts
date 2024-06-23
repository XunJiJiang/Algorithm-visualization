const menuNode = document.querySelector('#menu-container') as HTMLElement;
// const rootMenuNode = document.querySelector('#root-menu-container') as HTMLElement;
const codeMenuNode = document.querySelector('#code-menu-container') as HTMLElement;
const codeNode = document.querySelector('#code-container') as HTMLElement;
const canvasNode = document.querySelector('#canvas-container') as HTMLElement;
const controllerNode = document.querySelector('#controller') as HTMLElement;

function rootMenuNodeDisappear() {
  menuNode.style.display = 'none';
}

function rootMenuNodeAppear() {
  menuNode.style.display = '';
}

function codeMenuNodeDisappear() {
  codeMenuNode.style.display = 'none';
}

function codeMenuNodeAppear() {
  codeMenuNode.style.display = '';
}

function codeNodeDisappear() {
  codeNode.style.display = 'none';
}

function codeNodeAppear() {
  codeNode.style.display = '';
}

function canvasNodeDisappear() {
  canvasNode.style.display = 'none';
}

function canvasNodeAppear() {
  canvasNode.style.display = '';
}

function controllerNodeDisappear() {
  controllerNode.style.display = 'none';
}

function controllerNodeAppear() {
  controllerNode.style.display = '';
}

codeMenuNodeDisappear();
codeNodeDisappear();
canvasNodeDisappear();
controllerNodeDisappear();

// TODO: 开发时，用于快速启动代码页面的函数
// function openCodePage() {
//   codeMenuNodeAppear();
//   codeNodeAppear();
//   canvasNodeAppear();
//   rootMenuNodeDisappear();
//   controllerNodeAppear();
// }

// openCodePage();

const interfaceControl = {
  rootMenuNodeDisappear,
  rootMenuNodeAppear,
  codeMenuNodeDisappear,
  codeMenuNodeAppear,
  codeNodeDisappear,
  codeNodeAppear,
  canvasNodeDisappear,
  canvasNodeAppear,
  controllerNodeDisappear,
  controllerNodeAppear,
};

export default interfaceControl;
