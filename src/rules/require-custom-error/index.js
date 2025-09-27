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
      requireCustomError: 'Use custom error classes instead of generic Error. Ensure you have tests covering this error scenario.',
      requireErrorSuffix: 'Custom error class names should end with "Error". Ensure you have tests covering this error scenario.',
      extendError: 'Custom error classes should extend Error or another error class. Ensure you have tests covering this error scenario.',
    },
  },
  function create(context) {
    const options = context.options[0] || {};
    const allowedBaseErrors = options.allowedBaseErrors || ['Error'];
    const requireErrorSuffix = options.requireErrorSuffix !== false;

    const importedIdentifiers = new Set();
    const declaredClasses = new Set();

    return {
      ImportDeclaration(node) {
        node.specifiers.forEach(spec => {
          if (spec.type === 'ImportSpecifier' || spec.type === 'ImportDefaultSpecifier') {
            importedIdentifiers.add(spec.local.name);
          } else if (spec.type === 'ImportNamespaceSpecifier') {
            importedIdentifiers.add(spec.local.name);
          }
        });
      },

      ClassDeclaration(node) {
        if (node.id) {
          declaredClasses.add(node.id.name);
        }

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
            } else if (requireErrorSuffix && !callee.name.endsWith('Error') && !importedIdentifiers.has(callee.name)) {
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
    };
  }
);

export { requireCustomError };