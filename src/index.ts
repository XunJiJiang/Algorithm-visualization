import './style.scss';
import eventRun from './utils/root-menu';
import { loadingControl } from './utils/loading';

eventRun();

loadingControl(false, false);

// setTimeout(() => {
//   loadingControl(false, true);
// }, 1000);

// Use contextBridge
// window.ipcRenderer.on('main-process-message', (_event, message) => {});
