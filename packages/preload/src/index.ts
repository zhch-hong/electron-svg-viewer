/**
 * @module preload
 */
import { ipcRenderer } from 'electron';

function readFolderSVG(): Promise<Array<Record<'basename' | 'path', string>> | undefined> {
  return ipcRenderer.invoke('readFolderSVG');
}

function onOpenSVG(params: (svgPath: string) => void) {
  ipcRenderer.on('openSVG', (event, svgPath: string) => params(svgPath));
}

export { readFolderSVG, onOpenSVG };

