import fs from 'node:fs';
import path from 'node:path';

// Every source folder has an index file as its entry, and no file is named after its own folder
// (room-top-bar/room-top-bar.tsx → room-top-bar/index.tsx). Module roots (with a package.json) are exempt.

const indexNames = ['index.ts', 'index.tsx', 'index.mjs', 'index.js'];

const isModuleRoot = (dir, cwd) =>
  path.resolve(dir) === path.resolve(cwd) || fs.existsSync(path.join(dir, 'package.json'));

const hasIndex = (dir) => indexNames.some((name) => fs.existsSync(path.join(dir, name)));

const stemOf = (filename) => path.basename(filename).split('.')[0];

// A component earns its own folder only with more than 3 related files; otherwise it's
// `component-name.tsx` one folder up, with its styles in that folder's styled-components.ts.
const maxSmallFolder = 3;

const isSmallComponentFolder = (filename) =>
  path.basename(filename) === 'index.tsx' && fs.readdirSync(path.dirname(filename)).length <= maxSmallFolder;

export default {
  meta: {
    type: 'suggestion',
    docs: { description: 'Require an index entry file in every folder; no file named after its own folder.' },
    messages: {
      missingIndex: 'Folder "{{folder}}" has no index.ts / index.tsx entry file.',
      namedLikeFolder: '"{{file}}" is named after its folder. Make it the folder\'s index file instead.',
      smallFolder:
        'Component folder "{{folder}}" has 3 or fewer files. Move the component to "{{folder}}.tsx" one folder up and its styles into that folder\'s styled-components.ts.',
    },
    schema: [],
  },
  create: (context) => ({
    Program: (node) => {
      const dir = path.dirname(context.filename);
      const folder = path.basename(dir);
      const loc = { line: 1, column: 0 };

      if (isModuleRoot(dir, context.cwd)) return;

      if (!hasIndex(dir)) context.report({ node, loc, messageId: 'missingIndex', data: { folder } });

      if (stemOf(context.filename) === folder) {
        context.report({ node, loc, messageId: 'namedLikeFolder', data: { file: path.basename(context.filename) } });
      }

      if (isSmallComponentFolder(context.filename)) {
        context.report({ node, loc, messageId: 'smallFolder', data: { folder } });
      }
    },
  }),
};
