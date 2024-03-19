/**
 * @module preload
 */
import { ipcRenderer } from 'electron';
import { versions } from './versions';

function readFolderSVG(): Promise<string[] | undefined> {
  return ipcRenderer.invoke('readFolderSVG');
}

export { versions, readFolderSVG };

