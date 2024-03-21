import { statSync, existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { basename, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BrowserWindow, app, dialog, ipcMain, net, protocol } from 'electron';
import Logger from 'electron-log';

console.log(process.argv);

const isSingleInstance = app.requestSingleInstanceLock([process.argv[1]]);
if (!isSingleInstance) {
  app.quit();
  process.exit(0);
}

protocol.registerSchemesAsPrivileged([
  { scheme: 'svg', privileges: { standard: true, secure: true, supportFetchAPI: true } },
]);

app.addListener('second-instance', (event, commandLine, workingDirectory, additionalData) => {
  const svg = (additionalData as string[])[0];
  if (existsSync(svg) && extname(svg) === '.svg') {
    createWindow(svg);
  }
});

app.addListener('window-all-closed', () => {
  Logger.info('window-all-closed');
});

app.addListener('ready', () => {
  protocol.handle('svg', (request) => {
    const { host, pathname } = new URL(request.url);
    return net.fetch('file://' + resolve(host + ':\\', pathname));
  });

  ipcMainListener();
  createWindow(process.argv[1]);
});

function ipcMainListener() {
  ipcMain.handle('readFolderSVG', async ({ sender }) => {
    let folder: string[] | undefined;
    try {
      const win = BrowserWindow.fromWebContents(sender)!;
      folder = await dialog.showOpenDialogSync(win, { properties: ['openDirectory'] });
    } catch (error) {}
    if (!folder) return;

    const folderDir = folder[0];
    const files = await readdir(folderDir);
    return files.reduce((prev: Array<Record<'basename' | 'path', string>>, next) => {
      next = resolve(folderDir, next);
      if (statSync(next).isFile() && extname(next) === '.svg') {
        prev.push({ basename: basename(next), path: next });
      }
      return prev;
    }, []);
  });
}

function createWindow(svg?: string) {
  const browserWindow = new BrowserWindow({
    webPreferences: {
      sandbox: false,
      preload: join(app.getAppPath(), 'packages/preload/dist/index.mjs'),
    },
  });

  browserWindow.webContents.openDevTools();

  if (import.meta.env.DEV && import.meta.env.VITE_DEV_SERVER_URL !== undefined) {
    browserWindow.loadURL(import.meta.env.VITE_DEV_SERVER_URL);
  } else {
    browserWindow.loadFile(fileURLToPath(new URL('./../../renderer/dist/index.html', import.meta.url)));
  }

  browserWindow.webContents.addListener('did-finish-load', () => {
    if (svg) {
      browserWindow.webContents.send('openSVG', svg);
    }
  });
}

