import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
// ├─┬─┬ build
// ├─┬─┬ dist-electron
// │ │ ├── main.js
// │ │ ├── preload.mjs
// │ │ ├── index.html
// │ │ └── doc.html
process.env.APP_ROOT = path.join(__dirname, '..');

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'build');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST;

let startWin: BrowserWindow | null;

let win: BrowserWindow | null;

let docWin: BrowserWindow | null;

function createStartWindow() {
  startWin = new BrowserWindow({
    width: 200,
    minWidth: 200,
    height: 200,
    minHeight: 200,
    titleBarStyle: 'hidden',
    titleBarOverlay: false,
    transparent: true,
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  });

  if (VITE_DEV_SERVER_URL) {
    startWin.loadURL(path.join(VITE_DEV_SERVER_URL, 'start-load.html'));
    startWin.webContents.openDevTools();
  } else {
    startWin.loadFile('start-load.html');
  }

  createWindow();

  win?.once('ready-to-show', () => {
    setTimeout(() => {
      startWin?.close();
      setTimeout(() => {
        win?.show();
      }, 200);
    }, 300);
  });

  startWin.on('closed', () => {
    startWin = null;
  });
}

function createWindow() {
  win = new BrowserWindow({
    width: 1024,
    minWidth: 880,
    height: 600,
    minHeight: 400,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#2f3241',
      symbolColor: '#74b1be',
      height: 30,
    },
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
    show: false,
  });

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
    win.webContents.openDevTools();
  } else {
    win.loadFile('index.html');
  }

  ipcMain.on('open-default-browser', (_event, url) => {
    shell.openExternal(url);
  });

  ipcMain.on('open-doc', () => {
    if (!docWin) {
      createDocWindow();
    } else {
      docWin.close();
    }
  });

  // TODO: 乱搞
  // win?.setBounds({ x: 100, y: 100, width: 1024, height: 600 });

  // win.on('moved', () => {
  //   win?.setBounds({ x: 100, y: 100, width: 1024, height: 600 });
  // });

  // win.on('resized', () => {
  //   win?.setBounds({ x: 100, y: 100, width: 1024, height: 600 });
  // });

  // win.on('minimize', () => {
  //   setTimeout(() => {
  //     win?.maximize();
  //   }, 1000);
  // });

  // win.on('maximize', () => {
  //   setTimeout(() => {
  //     win?.unmaximize();
  //   }, 1000);
  // });

  // win.on('closed', () => {
  //   createWindow();
  // });
  // TODO: 乱搞
}

function createDocWindow() {
  if (!win) return;
  docWin = new BrowserWindow({
    parent: win,
    width: win?.getSize()[0],
    minWidth: 880,
    height: win?.getSize()[1],
    minHeight: 400,
    x: win?.getPosition()[0] - win?.getSize()[0],
    y: win?.getPosition()[1],
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  });

  docWin.menuBarVisible = false;

  if (VITE_DEV_SERVER_URL) {
    docWin.loadURL(path.join(VITE_DEV_SERVER_URL, 'doc.html'));
    docWin.webContents.openDevTools();
  } else {
    docWin.loadFile('doc.html');
  }

  // const winCheck = () => {
  //   if (
  //     win?.isMaximized() ||
  //     win?.isMinimized() ||
  //     win?.isFullScreen() ||
  //     docWin?.isMaximized() ||
  //     docWin?.isMinimized() ||
  //     docWin?.isFullScreen()
  //   ) {
  //     return false;
  //   } else {
  //     return true;
  //   }
  // };

  // const setDocWinBounds = () => {
  //   if (!winCheck()) return;
  //   const winX = win?.getPosition()[0] || 100;
  //   const winY = win?.getPosition()[1] || 100;
  //   const docWidth = docWin?.getSize()[0] || 1024;
  //   docWin?.setBounds({ x: winX - docWidth, y: winY }, true);
  // };

  // const setWinBounds = () => {
  //   if (!winCheck()) return;
  //   const docX = docWin?.getPosition()[0] || 100;
  //   const docY = docWin?.getPosition()[1] || 100;
  //   const docWidth = docWin?.getSize()[0] || 1024;
  //   win?.setBounds({ x: docX + docWidth, y: docY }, true);
  // };

  // docWin.on('resized', setWinBounds);

  // docWin.on('move', setWinBounds);

  // win.on('resized', setDocWinBounds);

  // win.on('move', setDocWinBounds);

  // docWin.on('closed', () => {
  //   win?.removeListener('resized', setDocWinBounds);
  //   win?.removeListener('move', setDocWinBounds);
  //   docWin?.removeAllListeners();
  //   docWin = null;
  // });
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    win = null;
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createStartWindow();
  }
});

app.whenReady().then(createStartWindow);
