import './style.scss';
import setRootMenuNode from './utils/root-menu.ts';

// document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
//   <div>

//   </div>
// `;

setRootMenuNode(document.querySelector<HTMLDivElement>('#root-menu')!);

// Use contextBridge
window.ipcRenderer.on('main-process-message', (_event, message) => {
  console.log(message);
});
