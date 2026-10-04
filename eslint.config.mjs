import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import local from './eslint-rules/index.mjs';

// Statements that count as a "code block": each one gets exactly one blank line before and after.
const codeBlocks = [
  'block-like',
  'if',
  'for',
  'while',
  'do',
  'switch',
  'try',
  'class',
  'interface',
  'multiline-expression',
  'multiline-const',
  'multiline-let',
];

const nestedFunctionMessage = 'Only arrow functions (lambdas) may be declared inside another function.';

const pureModuleMessage = 'engine and protocol are shared by web and core-api: keep them free of DOM, Node and framework code.';

// Names are camelCase. Types are PascalCase. Object keys and type members are not checked
// because they often mirror external shapes (CSS, HTTP headers, API JSON, ESLint visitors).
const namingBase = [
  { selector: 'default', format: ['camelCase'], leadingUnderscore: 'allow' },
  { selector: 'import', format: ['camelCase', 'PascalCase'] },
  { selector: 'typeLike', format: ['PascalCase'] },
  { selector: 'enumMember', format: ['PascalCase'] },
  { selector: ['objectLiteralProperty', 'objectLiteralMethod', 'typeProperty', 'typeMethod'], format: null },
  { selector: 'variable', modifiers: ['destructured'], format: null },
];

// PascalCase is allowed for functions only so React components can use it.
// local/pascal-case-components then checks that every PascalCase function really renders JSX.
const namingTs = [
  ...namingBase,
  { selector: 'function', format: ['camelCase', 'PascalCase'] },
  { selector: 'variable', types: ['function'], format: ['camelCase', 'PascalCase'] },
];

const houseStyle = {
  'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
  'max-lines-per-function': ['error', { max: 40, skipBlankLines: true, skipComments: true }],
  'no-restricted-syntax': [
    'error',
    { selector: ':function FunctionDeclaration', message: nestedFunctionMessage },
    { selector: ':function FunctionExpression', message: nestedFunctionMessage },
  ],
  '@stylistic/padding-line-between-statements': [
    'error',
    { blankLine: 'always', prev: '*', next: codeBlocks },
    { blankLine: 'always', prev: codeBlocks, next: '*' },
  ],
  '@stylistic/no-multiple-empty-lines': ['error', { max: 1, maxBOF: 0, maxEOF: 0 }],
  '@stylistic/lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
  '@typescript-eslint/naming-convention': ['error', ...namingBase],
  'local/kebab-case-filenames': 'error',
  'local/folder-index': 'error',
};

export default defineConfig([
  globalIgnores([
    '**/node_modules/',
    '**/dist/',
    '**/build/',
    '**/coverage/',
    '**/styled-system/',
    '**/*.d.ts',
    '.scratch/',
  ]),
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    plugins: { '@stylistic': stylistic, local },
    languageOptions: { globals: { ...globals.node } },
    rules: houseStyle,
  },
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/naming-convention': ['error', ...namingTs],
      'local/explicit-return-type': 'error',
      'local/pascal-case-components': 'error',
    },
  },
  {
    files: ['**/*.tsx'],
    languageOptions: { globals: { ...globals.browser } },
    plugins: { 'react-hooks': reactHooks },
    rules: reactHooks.configs.recommended.rules,
  },
  {
    // Shared modules run in the browser and on the server: no DOM, Node or framework code.
    files: ['modules/engine/src/**', 'modules/protocol/src/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['node:*', 'react', 'react-*', 'mobx*', 'express', 'colyseus*', '@colyseus/*'], message: pureModuleMessage },
          ],
        },
      ],
      'no-restricted-globals': ['error', 'window', 'document', 'navigator', 'localStorage', 'process', 'Buffer'],
    },
  },
  {
    // The protocol's state classes are Colyseus Schema (plain JS, runs anywhere); the rest of Colyseus stays out.
    files: ['modules/protocol/src/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['node:*', 'react', 'react-*', 'mobx*', 'express', 'colyseus*', '@colyseus/*', '!@colyseus/schema'],
              message: pureModuleMessage,
            },
          ],
        },
      ],
    },
  },
]);
