import './style.scss';
import eventRun from './utils/root-menu.ts';
import { loadingControl } from './utils/loading.ts';

eventRun();

loadingControl(true);

setTimeout(() => {
  loadingControl(false);
}, 2000);

// Use contextBridge
window.ipcRenderer.on('main-process-message', (_event, message) => {
  console.log(message);
});
