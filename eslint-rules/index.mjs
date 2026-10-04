import explicitReturnType from './explicit-return-type.mjs';
import pascalCaseComponents from './pascal-case-components.mjs';

export default {
  meta: { name: 'eslint-plugin-local' },
  rules: {
    'explicit-return-type': explicitReturnType,
    'pascal-case-components': pascalCaseComponents,
  },
};
