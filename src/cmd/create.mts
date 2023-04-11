import fs from 'fs';
import path from 'path';
import axios from 'axios';
import Inquirer from 'inquirer';
import downloadRepo from 'download-git-repo';
import ncp from 'ncp';
import shell from 'shelljs';
import MetalSmith from 'metalsmith';
import { ejs } from 'consolidate';
import { promisify } from 'util';
import { Buffer } from 'node:buffer';
import constants from '../constants/index.mjs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname } from 'node:path';
import { Octokit } from '@octokit/core';
import { waitFnloading } from '../utils/index.mjs';
const __dirname = dirname(fileURLToPath(import.meta.url));

const { DOWNLOAD_DIRECTORY, TEMPLATE_REPOLIST, GIT_USER_NAME, GITHUB_API_HOST, GIT_USER_TOKEN } =
  constants;

const render = promisify(ejs.render);
const promisifyDownloadRepo = promisify(downloadRepo);
const promisifyNcp = promisify(ncp);

// 获取该项目的 tags
const fechTagList = async (repo) => {
  const octokit = new Octokit({
    auth: GIT_USER_TOKEN,
  });

  const { data } = await octokit.request('GET /repos/{owner}/{repo}/tags', {
    owner: GIT_USER_NAME,
    repo: repo,
    headers: {
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  console.log(data);
  // const { data } = await axios.get(`${GITHUB_API_HOST}/repos/${GIT_USER_NAME}/${repo}/tags`);
  return data;
};

// 下载仓库代码到临时文件夹，并返回该文件夹地址
const download = async (repo, tag) => {
  let api = `${GIT_USER_NAME}/${repo}`;
  if (tag) {
    api += `#${tag}`;
  }
  const dest = path.resolve(DOWNLOAD_DIRECTORY, repo);
  await promisifyDownloadRepo(api, dest);
  return dest;
};

export default async (projectName) => {
  // 选择一个模板
  const { repo } = await Inquirer.prompt({
    name: 'repo',
    type: 'list',
    message: 'please choise a template to create project',
    choices: TEMPLATE_REPOLIST,
  });

  // 选择 tag 版本
  let tags = await waitFnloading(fechTagList, 'fetching tags ....')(repo);
  tags = tags.map((item) => item.name);
  let tag;
  if (tags.length > 0) {
    const { _tag } = await Inquirer.prompt({
      name: 'tag',
      type: 'list',
      message: 'please choise tags to create project',
      choices: tags,
    });
    tag = _tag;
  }

  // 下载选择的模板代码
  const result = await waitFnloading(download, 'download template')(repo, tag);

  if (!fs.existsSync(path.join(result, 'ask.js'))) {
    await promisifyNcp(result, path.resolve(projectName));
  } else {
    await new Promise((resolve, reject) => {
      MetalSmith(__dirname)
        .source(result)
        .destination(path.resolve(projectName))
        .use(async (files, metal, done) => {
          const args = require(path.join(result, 'ask.js'));
          const obj = await Inquirer.prompt(args);
          const meta = metal.metadata();
          Object.assign(meta, obj);
          delete files['ask.js'];
          done();
        })
        .use((files, metal, done) => {
          const obj = metal.metadata();
          Reflect.ownKeys(files).forEach(async (file) => {
            // if (file.includes('js') || file.includes('json')) {
            //   let content = files[file].contents.toString();
            //   if (content.includes('<%')) {
            //     content = await render(content, obj);
            //     files[file].contents = Buffer.from(content);
            //   }
            // }
          });
          done();
        })
        .build((err) => {
          if (err) {
            reject();
          } else {
            resolve(true);
          }
        });
    });
  }
  shell.rm('-R', DOWNLOAD_DIRECTORY);
};
