import { BrowserWindow, app, dialog, ipcMain, net, protocol } from 'electron';
import './security-restrictions.js';
import { restoreOrCreateWindow } from '/@/mainWindow';
import { platform } from 'node:process';
import { statSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { basename, extname, resolve } from 'node:path';

/**
 * Prevent electron from running multiple instances.
 */
const isSingleInstance = app.requestSingleInstanceLock();
if (!isSingleInstance) {
  app.quit();
  process.exit(0);
}

protocol.registerSchemesAsPrivileged([
  { scheme: 'svg', privileges: { standard: true, secure: true, supportFetchAPI: true } },
]);

app.on('second-instance', restoreOrCreateWindow);

/**
 * Disable Hardware Acceleration to save more system resources.
 */
app.disableHardwareAcceleration();

/**
 * Shout down background process if all windows was closed
 */
app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit();
  }
});

/**
 * @see https://www.electronjs.org/docs/latest/api/app#event-activate-macos Event: 'activate'.
 */
app.on('activate', restoreOrCreateWindow);

/**
 * Create the application window when the background process is ready.
 */
app
  .whenReady()
  .then(() => {
    protocol.handle('svg', (request) => {
      const { host, pathname } = new URL(request.url);
      return net.fetch('file://' + resolve(host + ':\\', pathname));
    });

    ipcMainListener();
    restoreOrCreateWindow();
  })
  .catch((e) => console.error('Failed create window:', e));

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

