import path from 'node:path';

// File and folder names are kebab-case: my-file-name.ts, room-top-bar/, …
// Dot-separated parts are allowed (eslint.config.mjs, snap.test.ts, vite-env.d.ts).

const kebabPart = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ignoredSegments = new Set(['..', 'node_modules', '.claude', '.scratch']);

const isKebab = (name) => name.split('.').every((part) => kebabPart.test(part));

const badSegments = (filename, cwd) =>
  path
    .relative(cwd, filename)
    .split(path.sep)
    .filter((segment) => !ignoredSegments.has(segment) && !isKebab(segment));

export default {
  meta: {
    type: 'suggestion',
    docs: { description: 'Require kebab-case file and folder names.' },
    messages: { notKebab: '"{{name}}" is not kebab-case. Name files and folders like my-file-name.ts.' },
    schema: [],
  },
  create: (context) => ({
    Program: (node) => {
      for (const name of badSegments(context.filename, context.cwd)) {
        context.report({ node, loc: { line: 1, column: 0 }, messageId: 'notKebab', data: { name } });
      }
    },
  }),
};
