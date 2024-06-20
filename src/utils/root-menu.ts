import interfaceControl from './interface-control';
import { loadingControl, changePageInLoading } from './loading.ts';

const menuNode = document.querySelector('#menu-container') as HTMLElement;
const rootMenuNode = document.querySelector('#root-menu-container') as HTMLElement;
const rootMenuNodeLi = document.getElementsByClassName('root-menu-container-li') as unknown as [
  HTMLLIElement,
  HTMLLIElement,
  HTMLLIElement
];
const codeMenuNode = document.querySelector('#code-menu-container') as HTMLElement;
const codeMenuBack = document.querySelector('#code-menu-back') as HTMLElement;
const codeNode = document.querySelector('#code-container') as HTMLElement;
const canvasNode = document.querySelector('#canvas-container') as HTMLElement;

function setRootMenuNode() {
  rootMenuNodeLi[0].addEventListener('click', () => {
    changePageInLoading(() => {
      interfaceControl.rootMenuNodeDisappear();
      interfaceControl.codeMenuNodeAppear();
      interfaceControl.codeNodeAppear();
      interfaceControl.canvasNodeAppear();
    });
  });

  rootMenuNodeLi[1].addEventListener('click', () => {
    console.log('click');
  });

  codeMenuBack.addEventListener('click', () => {
    changePageInLoading(() => {
      interfaceControl.rootMenuNodeAppear();
      interfaceControl.codeMenuNodeDisappear();
      interfaceControl.codeNodeDisappear();
      interfaceControl.canvasNodeDisappear();
    });
  });
}

export default setRootMenuNode;
