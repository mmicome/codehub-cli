import fs from 'node:fs';
import path from 'node:path';
// import { version as VERSION }  from '../../package.json';
const loadJSON = (path) => JSON.parse(fs.readFileSync(new URL(path, import.meta.url)).toString());
const { version: VERSION } = loadJSON('../../package.json');
// 模板的临时下载目录
const DOWNLOAD_DIRECTORY = path.resolve(
  `${process.env[process.platform === 'darwin' ? 'HOME' : 'USERPROFILE']}`,
  '.template'
);

// 项目模板列表
const TEMPLATE_REPOLIST = ['codehub-cli', 'codehub-commons', 'codehub-data'];

// git 用户名
const GIT_USER_NAME = 'mmicome';

//git TOKEN
const GIT_USER_TOKEN = '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';

const GITHUB_API_HOST = 'https://api.github.com';

export default {
  VERSION,
  DOWNLOAD_DIRECTORY,
  TEMPLATE_REPOLIST,
  GIT_USER_NAME,
  GITHUB_API_HOST,
  GIT_USER_TOKEN,
};
