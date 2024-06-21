import interfaceControl from './interface-control';
import { loadingControl, changePageInLoading } from './loading';
import { resize } from './echarts';
import { runBubbleSort, runMinimumSpanningTree } from './code';

const menuNode = document.querySelector('#menu-container') as HTMLElement;
const rootMenuNode = document.querySelector('#root-menu-container') as HTMLElement;
const rootMenuNodeLi = document.getElementsByClassName('root-menu-container-li') as unknown as [
  HTMLLIElement,
  HTMLLIElement,
  HTMLLIElement
];

function eventRun() {
  rootMenuNodeLi[0].addEventListener('click', () => {
    changePageInLoading(() => {
      interfaceControl.rootMenuNodeDisappear();
      interfaceControl.codeMenuNodeAppear();
      interfaceControl.codeNodeAppear();
      interfaceControl.canvasNodeAppear();
      interfaceControl.controllerNodeAppear();
    });
  });

  rootMenuNodeLi[1].addEventListener('click', () => {
    console.log('click');
  });

  codePage();

  codePageButton();
}

const codeMenuNode = document.querySelector('#code-menu-container') as HTMLElement;
const codeMenuDargBar = document.querySelector('#code-menu-drag-bar') as HTMLElement;
const codeMenuBack = document.querySelector('#code-menu-back') as HTMLElement;
const codeNode = document.querySelector('#code-container') as HTMLElement;
const codeDragBar = document.querySelector('#code-drag-bar') as HTMLElement;
const canvasNode = document.querySelector('#canvas-container') as HTMLElement;
const codeMenuItem = document.getElementsByClassName('code-menu-item') as unknown as HTMLDivElement[];

function codePage() {
  const codeMenuDargBarHandler = (e: MouseEvent) => {
    codeMenuDargBar.setAttribute('dragging', 'true');
    const x = e.clientX;
    const __width = parseFloat(codeMenuNode.style.getPropertyValue('--button-black-width')) || 400;
    const max = 600;
    const min = 200;
    let _width = __width;
    const mousemoveHandler = (e: MouseEvent) => {
      const moveX = e.clientX - x;
      _width = __width + moveX;
      codeMenuNode.style.setProperty('--button-black-width', `${__width + moveX}px`);
      codeNode.style.setProperty('--code-menu-width', `${__width + 50 + moveX}px`);
      canvasNode.style.setProperty('--code-menu-width', `${__width + 50 + moveX}px`);
    };
    const mouseupHandler = () => {
      document.removeEventListener('mousemove', mousemoveHandler);
      document.removeEventListener('mouseup', mouseupHandler);
      if (_width < min) {
        codeMenuNode.style.setProperty('--button-black-width', `${min}px`);
        codeNode.style.setProperty('--code-menu-width', `${min + 50}px`);
        canvasNode.style.setProperty('--code-menu-width', `${min + 50}px`);
      }
      if (_width > max) {
        codeMenuNode.style.setProperty('--button-black-width', `${max}px`);
        codeNode.style.setProperty('--code-menu-width', `${max + 50}px`);
        canvasNode.style.setProperty('--code-menu-width', `${max + 50}px`);
      }
      codeMenuDargBar.setAttribute('dragging', 'false');
      resize();
    };
    document.addEventListener('mousemove', mousemoveHandler);
    document.addEventListener('mouseup', mouseupHandler);
  };
  codeMenuDargBar.addEventListener('mousedown', codeMenuDargBarHandler);

  codeDragBar.addEventListener('mousedown', e => {
    const __codeMenuWidth = parseFloat(codeMenuNode.style.getPropertyValue('--button-black-width')) || 400;
    if (e.clientX < __codeMenuWidth + 56) {
      codeMenuDargBarHandler(e);
    }
    codeDragBar.setAttribute('dragging', 'true');
    const y = e.clientY;
    const __height = parseFloat(codeNode.style.getPropertyValue('--code-container-height')) / 100 || 0.3;
    const max = 0.7;
    const min = 0.1;
    let _height = __height;
    const mousemoveHandler = (e: MouseEvent) => {
      const moveY = e.clientY - y;

      _height = __height + (moveY * 1.63) / window.innerWidth;

      codeNode.style.setProperty('--code-container-height', `${_height * 100}%`);
      canvasNode.style.setProperty('--code-container-height', `${_height * 100}%`);
    };
    const mouseupHandler = () => {
      document.removeEventListener('mousemove', mousemoveHandler);
      document.removeEventListener('mouseup', mouseupHandler);
      if (_height < min) {
        codeNode.style.setProperty('--code-container-height', `${min * 100}%`);
        canvasNode.style.setProperty('--code-container-height', `${min * 100}%`);
      }
      if (_height > max) {
        codeNode.style.setProperty('--code-container-height', `${max * 100}%`);
        canvasNode.style.setProperty('--code-container-height', `${max * 100}%`);
      }
      resize(resize);
      codeDragBar.setAttribute('dragging', 'false');
    };
    document.addEventListener('mousemove', mousemoveHandler);
    document.addEventListener('mouseup', mouseupHandler);
  });
}

function codePageButton() {
  codeMenuBack.addEventListener('click', () => {
    changePageInLoading(() => {
      interfaceControl.rootMenuNodeAppear();
      interfaceControl.codeMenuNodeDisappear();
      interfaceControl.codeNodeDisappear();
      interfaceControl.canvasNodeDisappear();
      interfaceControl.controllerNodeDisappear();
    });
  });

  for (let i = 0; i < codeMenuItem.length; i++) {
    codeMenuItem[i].addEventListener('click', () => {
      console.log('click', codeMenuItem[i].innerHTML);
      if (codeMenuItem[i].innerHTML === '冒泡排序') {
        runBubbleSort();
      } else if (codeMenuItem[i].innerHTML === '最小生成树问题') {
        runMinimumSpanningTree();
      }
    });
  }
}

window.addEventListener('resize', resize);

export default eventRun;
