// PascalCase is reserved for React components: a PascalCase function must render JSX.
// Components are named functions, never arrows:
//   export function Avatar(…) { … }
//   export const Room = observer(function Room() { … });
// Covers `function Name()`, `const Name = …` and `const Name = memo(…)` / `forwardRef(…)` / `observer(…)`.

const pascalCase = /^[A-Z]/;
const wrappers = new Set(['memo', 'forwardRef', 'observer']);

const isWrapper = (callee) =>
  wrappers.has(callee.type === 'MemberExpression' ? callee.property.name : callee.name);

const declaredId = (node) => {
  if (node.type === 'FunctionDeclaration') return node.id;

  const parent = node.parent;

  if (parent.type === 'VariableDeclarator') return parent.id;

  if (parent.type === 'CallExpression' && isWrapper(parent.callee) && parent.parent.type === 'VariableDeclarator') {
    return parent.parent.id;
  }

  return null;
};

const report = (context, entry) => {
  const id = declaredId(entry.node);

  if (id?.type !== 'Identifier' || !pascalCase.test(id.name)) return;

  if (!entry.hasJsx) {
    context.report({ node: id, messageId: 'notComponent', data: { name: id.name } });

    return;
  }

  if (entry.node.id?.name !== id.name) {
    context.report({ node: id, messageId: 'namedFunction', data: { name: id.name } });
  }
};

export default {
  meta: {
    type: 'suggestion',
    docs: { description: 'PascalCase only for React components, written as named functions.' },
    messages: {
      notComponent: '`{{name}}` is PascalCase but renders no JSX. PascalCase is reserved for React components; use camelCase.',
      namedFunction:
        'Write the `{{name}}` component as a named function: `export function {{name}}(…) {…}` or `observer(function {{name}}(…) {…})`.',
    },
    schema: [],
  },
  create: (context) => {
    const stack = [];

    return {
      ':function': (node) => stack.push({ node, hasJsx: false }),
      'JSXElement, JSXFragment': () => stack.forEach((entry) => (entry.hasJsx = true)),
      ':function:exit': () => report(context, stack.pop()),
    };
  },
};
