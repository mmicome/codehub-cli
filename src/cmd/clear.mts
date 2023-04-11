import constants from '../constants/index.mjs';
import shell from 'shelljs';
import path from 'node:path';

const { DOWNLOAD_DIRECTORY } = constants;
export default (templateName: string) => {
  let dest = DOWNLOAD_DIRECTORY;
  if (templateName) {
    dest = path.resolve(DOWNLOAD_DIRECTORY, templateName);
  }
  shell.rm('-R', dest);
};
