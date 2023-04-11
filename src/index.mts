import { program } from 'commander';
import path from 'path';
import constants from './constants/index.mjs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname } from 'node:path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const { VERSION } = constants;

const mapActions = {
  create: {
    alias: 'c',
    description: 'create a project',
    examples: ['codehub create <project-name>'],
  },
  config: {
    alias: 'conf',
    description: 'config project variable',
    examples: ['codehub config set <k> <v>', 'codehub config get <k>'],
  },
  clear: {
    alias: 'rm',
    description: 'clear cache',
    examples: ['codehub clear <template-name>'],
  },
  '*': {
    alias: '',
    description: 'command not found',
    examples: [],
  },
};

Reflect.ownKeys(mapActions).forEach((action) => {
  program
    .command(action as string) // 配置命令的名字
    .alias(mapActions[action].alias) // 配置命令的别名
    .description(mapActions[action].description) // 配置命令对应的描述
    .action(async () => {
      if (action === '*') {
        console.log(mapActions[action].description);
      } else {
        // 每个命令都对应一个文件夹
        const args = [...process.argv.slice(3)];
        console.log(path.resolve(__dirname, 'cmd', (action as string) + '.mjs'));
        const ac = await import(
          pathToFileURL(path.resolve(__dirname, 'cmd', (action as string) + '.mjs')).toString()
        );
        console.log(ac);
        ac.default(...args);
      }
    });
});

// 监听用户的help 事件
program.on('--help', () => {
  console.log('\nExamples:');
  Reflect.ownKeys(mapActions).forEach((action) => {
    mapActions[action].examples.forEach((example) => {
      console.log(`  ${example}`);
    });
  });
});

program.version(VERSION).parse(process.argv);
