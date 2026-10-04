import ts from 'typescript';

// Functions that return a value must declare their return type.
// Functions that return nothing (void, undefined, never, Promise<void>) may leave it out.
// Lambdas whose type comes from where they are passed (call arguments, JSX props,
// typed variables and objects, `as` / `satisfies`) are already typed and are skipped.

const nothingFlags = ts.TypeFlags.Void | ts.TypeFlags.Undefined | ts.TypeFlags.Never;
const functionTypes = new Set(['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression']);
const castTypes = new Set(['TSAsExpression', 'TSSatisfiesExpression', 'TSTypeAssertion', 'JSXExpressionContainer']);
const noReturnTypeKinds = new Set(['constructor', 'set']);

const isNothing = (type) => {
  if (type.isUnion()) {
    return type.types.every(isNothing);
  }

  return (type.flags & nothingFlags) !== 0;
};

const enclosingFunction = (node) => {
  let current = node.parent;

  while (current && !functionTypes.has(current.type)) {
    current = current.parent;
  }

  return current;
};

const isTypedPosition = (node) => {
  const parent = node.parent;

  if (castTypes.has(parent.type)) return true;

  if (parent.type === 'CallExpression' || parent.type === 'NewExpression') return parent.arguments.includes(node);

  if (parent.type === 'VariableDeclarator') return Boolean(parent.id.typeAnnotation);

  if (parent.type === 'PropertyDefinition') return Boolean(parent.typeAnnotation);

  if (parent.type === 'Property' || parent.type === 'ArrayExpression') return isTypedPosition(parent.type === 'Property' ? parent.parent : parent);

  if (parent.type === 'ArrowFunctionExpression') return Boolean(parent.returnType);

  if (parent.type === 'ReturnStatement') return Boolean(enclosingFunction(parent)?.returnType);

  return false;
};

const isExempt = (node) =>
  Boolean(node.returnType) ||
  (node.parent.type === 'MethodDefinition' && noReturnTypeKinds.has(node.parent.kind)) ||
  isTypedPosition(node);

const returnTypeOf = (services, node) => {
  const checker = services.program.getTypeChecker();
  const signature = checker.getSignatureFromDeclaration(services.esTreeNodeToTSNodeMap.get(node));

  if (!signature) return undefined;

  const returnType = checker.getReturnTypeOfSignature(signature);
  const settled = node.async ? (checker.getAwaitedType(returnType) ?? returnType) : returnType;

  return isNothing(settled) ? undefined : checker.typeToString(returnType);
};

const check = (context, node) => {
  if (isExempt(node)) return;

  const type = returnTypeOf(context.sourceCode.parserServices, node);

  if (type) {
    const loc = { start: node.loc.start, end: node.body.loc.start };

    context.report({ loc, messageId: 'missing', data: { type } });
  }
};

export default {
  meta: {
    type: 'suggestion',
    docs: { description: 'Require an explicit return type on every function that returns a value.' },
    messages: { missing: 'This function returns `{{type}}`. Declare the return type explicitly.' },
    schema: [],
  },
  create: (context) => ({
    ':function': (node) => check(context, node),
  }),
};
