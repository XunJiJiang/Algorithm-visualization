import { defineConfig } from 'vite';
import path from 'node:path';
import electron from 'vite-plugin-electron/simple';
import react from '@vitejs/plugin-react';
import { viteStaticCopy as copy } from 'vite-plugin-static-copy';

function imgPath() {
  return {
    name: 'img-path',
    transform(src: string, id: string) {
      if (id.endsWith('.png') || id.endsWith('.jpg') || id.endsWith('.jpeg') || id.endsWith('.gif')) {
        return;
      }
      return;
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    imgPath(),
    // @ts-ignore
    electron({
      main: {
        // Shortcut of `build.lib.entry`.
        entry: 'electron/main.ts',
      },
      preload: {
        // Shortcut of `build.rollupOptions.input`.
        // Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
        input: path.join(__dirname, 'electron/preload.ts'),
      },
      // Ployfill the Electron and Node.js API for Renderer process.
      // If you want use Node.js in Renderer process, the `nodeIntegration` needs to be enabled in the Main process.
      // See 👉 https://github.com/electron-vite/vite-plugin-electron-renderer
      renderer:
        process.env.NODE_ENV === 'test'
          ? // https://github.com/electron-vite/vite-plugin-electron-renderer/issues/78#issuecomment-2053600808
            undefined
          : {},
    }),
    copy({
      targets: [
        {
          src: 'package.json',
          dest: '',
          transform(contents) {
            const json = JSON.parse(contents.toString());
            json.main = 'main.js';
            delete json.scripts;
            const electronV = json.devDependencies.electron;
            delete json.dependencies;
            json.devDependencies = {
              electron: electronV,
            };
            json.build.directories.output = path.join('..', json.build.directories.output ?? 'dist-app');
            return JSON.stringify(json, null, 2);
          },
        },
        {
          src: 'dist-electron/main.js',
          dest: '',
        },
        {
          src: 'dist-electron/preload.mjs',
          dest: '',
        },
      ],
    }),
  ],
  build: {
    rollupOptions: {
      // ...
      // input:"src/index.js"
      input: {
        main: 'index.html',
        doc: 'doc.html',
      },
    },
  },
});

/**
 * 构建说明:
 *  1. 在根目录 运行 npx tsc
 *  2. 在根目录 运行 npx vite build
 *  3. 将 build 文件夹下的内容拷贝到 dist-electron 文件夹下
 *  4. 在 dist-electron 文件夹下 创建 package.json 文件
 * ```
 * {
 *   "name": "algorithm-visualization",
 *   "description": "An awesome project",
 *   "author": "XunJiJiang",
 *   "version": "0.0.1",
 *   "type": "module",
 *   "main": "main.js",
 *   "build": {
 *     "appId": "com.electrontest.av",
 *     "productName": "algorithm-visualization",
 *     "target": "NSIS",
 *     "nsis": {
 *       "allowToChangeInstallationDirectory": true,
 *       "oneClick": false
 *     },
 *     "directories": {
 *       "output": "../dist-app"
 *     }
 *   },
 *   "devDependencies": {
 *     "electron": "^31.0.2"
 *   }
 * }
 * ```
 *  5. 在 dist-electron 文件夹下 运行 electron-builder (需要全局安装 electron-builder)
 */
