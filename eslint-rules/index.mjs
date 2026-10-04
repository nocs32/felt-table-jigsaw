import explicitReturnType from './explicit-return-type.mjs';
import folderIndex from './folder-index.mjs';
import kebabCaseFilenames from './kebab-case-filenames.mjs';
import pascalCaseComponents from './pascal-case-components.mjs';

export default {
  meta: { name: 'eslint-plugin-local' },
  rules: {
    'explicit-return-type': explicitReturnType,
    'folder-index': folderIndex,
    'kebab-case-filenames': kebabCaseFilenames,
    'pascal-case-components': pascalCaseComponents,
  },
};
