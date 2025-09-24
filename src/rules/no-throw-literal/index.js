function createRule(meta, create) {
  return { meta, create };
}

function isErrorObject(node) {
  if (node.type === 'NewExpression') {
    const callee = node.callee;
    if (callee && callee.type === 'Identifier') {
      return callee.name.endsWith('Error') || callee.name === 'Error';
    }
  }
  return false;
}

function isLiteral(node) {
  return node.type === 'Literal' ||
         node.type === 'TemplateLiteral' ||
         (node.type === 'UnaryExpression' && node.operator === '-' && node.argument.type === 'Literal');
}

const noThrowLiteral = createRule(
  {
    type: 'problem',
    docs: {
      description: 'Disallow throwing literals as exceptions',
      category: 'Best Practices',
      recommended: false,
      url: 'https://github.com/tupe12334/eslint-plugin-error/blob/main/docs/rules/no-throw-literal.md'
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          allowThrowingObjects: {
            type: 'boolean',
            default: false,
          },
          allowThrowingUnknown: {
            type: 'boolean',
            default: false,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      object: 'Expected an error object to be thrown. Ensure you have tests covering this error scenario.',
      undef: 'Do not throw undefined. Ensure you have tests covering this error scenario.',
      literal: 'Expected an error object to be thrown, not a literal. Ensure you have tests covering this error scenario.',
    },
  },
  function create(context) {
    const options = context.options[0] || {};
    const allowThrowingObjects = options.allowThrowingObjects || false;
    const allowThrowingUnknown = options.allowThrowingUnknown || false;

    return {
      ThrowStatement(node) {
        if (!node.argument) {
          return;
        }

        const argument = node.argument;

        if (argument.type === 'Identifier' && argument.name === 'undefined') {
          context.report({
            node: argument,
            messageId: 'undef',
          });
          return;
        }

        if (isLiteral(argument)) {
          context.report({
            node: argument,
            messageId: 'literal',
            fix(fixer) {
              const sourceCode = context.getSourceCode();
              const text = sourceCode.getText(argument);
              return fixer.replaceText(argument, `new Error(${text})`);
            },
          });
          return;
        }

        if (!allowThrowingObjects &&
            argument.type === 'ObjectExpression' &&
            !isErrorObject(argument)) {
          context.report({
            node: argument,
            messageId: 'object',
          });
        }

        if (!allowThrowingUnknown &&
            argument.type === 'Identifier' &&
            !isErrorObject(argument) &&
            argument.name !== 'undefined') {
          context.report({
            node: argument,
            messageId: 'object',
          });
        }
      },
    };
  }
);

export { noThrowLiteral };