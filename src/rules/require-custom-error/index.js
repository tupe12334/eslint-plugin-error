function createRule(meta, create) {
  return { meta, create };
}

const requireCustomError = createRule(
  {
    type: 'problem',
    docs: {
      description: 'Require custom error classes that extend Error',
      category: 'Best Practices',
      recommended: false,
      url: 'https://github.com/tupe12334/eslint-plugin-error/blob/main/docs/rules/require-custom-error.md'
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          allowedBaseErrors: {
            type: 'array',
            items: { type: 'string' },
            default: ['Error'],
          },
          requireErrorSuffix: {
            type: 'boolean',
            default: true,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      requireCustomError: 'Use custom error classes instead of generic Error.',
      requireErrorSuffix: 'Custom error class names should end with "Error".',
      extendError: 'Custom error classes should extend Error or another error class.',
    },
  },
  function create(context) {
    const options = context.options[0] || {};
    const allowedBaseErrors = options.allowedBaseErrors || ['Error'];
    const requireErrorSuffix = options.requireErrorSuffix !== false;

    return {
      ThrowStatement(node) {
        const argument = node.argument;

        if (argument && argument.type === 'NewExpression') {
          const callee = argument.callee;

          if (callee.type === 'Identifier') {
            if (allowedBaseErrors.includes(callee.name)) {
              context.report({
                node: argument,
                messageId: 'requireCustomError',
              });
            } else if (requireErrorSuffix && !callee.name.endsWith('Error')) {
              context.report({
                node: callee,
                messageId: 'requireErrorSuffix',
                fix(fixer) {
                  return fixer.replaceText(callee, `${callee.name}Error`);
                },
              });
            }
          }
        }
      },

      ClassDeclaration(node) {
        if (!node.id || !node.id.name.endsWith('Error')) {
          return;
        }

        const hasErrorSuperClass = node.superClass &&
          ((node.superClass.type === 'Identifier' &&
            (allowedBaseErrors.includes(node.superClass.name) ||
             node.superClass.name.endsWith('Error'))) ||
           (node.superClass.type === 'MemberExpression'));

        if (!hasErrorSuperClass) {
          context.report({
            node: node.id,
            messageId: 'extendError',
          });
        }
      },
    };
  }
);

export { requireCustomError };