/**
 * @module preload
 */
import { ipcRenderer } from 'electron';
import { versions } from './versions';

function readFolderSVG(): Promise<Array<Record<'basename' | 'path', string>> | undefined> {
  return ipcRenderer.invoke('readFolderSVG');
}

export { versions, readFolderSVG };

