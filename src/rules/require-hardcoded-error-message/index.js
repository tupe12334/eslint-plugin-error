function createRule(meta, create) {
  return { meta, create };
}

const requireHardcodedErrorMessage = createRule(
  {
    type: 'suggestion',
    docs: {
      description: 'Require repeated error messages to be hardcoded in error class constructor',
      category: 'Best Practices',
      recommended: false,
      url: 'https://github.com/tupe12334/eslint-plugin-error/blob/main/docs/rules/require-hardcoded-error-message.md'
    },
    schema: [
      {
        type: 'object',
        properties: {
          threshold: {
            type: 'number',
            default: 2,
            minimum: 2,
          },
          ignoreErrorClasses: {
            type: 'array',
            items: { type: 'string' },
            default: [],
          },
          checkImportedErrors: {
            type: 'boolean',
            default: true,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      repeatedErrorMessage: 'The error message "{{message}}" is used {{count}} times with {{errorClass}}. Consider hardcoding this message in the error class constructor. Ensure you have tests covering this error scenario.',
    },
  },
  function create(context) {
    const options = context.options[0] || {};
    const threshold = options.threshold || 2;
    const ignoreErrorClasses = new Set(options.ignoreErrorClasses || []);
    const checkImportedErrors = options.checkImportedErrors !== false;

    // Track: errorClassName -> message -> [nodes]
    const errorMessageMap = new Map();

    // Track imported error classes
    const importedErrors = new Set();

    return {
      ImportDeclaration(node) {
        // Always track imports so we can skip them if checkImportedErrors is false
        node.specifiers.forEach(spec => {
          if (spec.type === 'ImportSpecifier' || spec.type === 'ImportDefaultSpecifier') {
            importedErrors.add(spec.local.name);
          }
        });
      },

      ThrowStatement(node) {
        const argument = node.argument;

        // Check if it's a new expression: throw new CustomError("message")
        if (argument && argument.type === 'NewExpression') {
          const callee = argument.callee;

          // Only check Identifier callees (direct error constructors)
          if (callee.type === 'Identifier') {
            const errorClassName = callee.name;

            // Skip if it's in the ignore list
            if (ignoreErrorClasses.has(errorClassName)) {
              return;
            }

            // Skip base Error class
            if (errorClassName === 'Error') {
              return;
            }

            // Skip if it's an imported error and we're not checking those
            if (!checkImportedErrors && importedErrors.has(errorClassName)) {
              return;
            }

            // Check if there's a literal string message as the first argument
            const firstArg = argument.arguments && argument.arguments[0];
            if (firstArg && firstArg.type === 'Literal' && typeof firstArg.value === 'string') {
              const message = firstArg.value;

              // Initialize tracking structure
              if (!errorMessageMap.has(errorClassName)) {
                errorMessageMap.set(errorClassName, new Map());
              }

              const messageMap = errorMessageMap.get(errorClassName);
              if (!messageMap.has(message)) {
                messageMap.set(message, []);
              }

              messageMap.get(message).push(firstArg);
            }
          }
        }
      },

      'Program:exit'() {
        // Report violations after analyzing the entire file
        errorMessageMap.forEach((messageMap, errorClassName) => {
          messageMap.forEach((nodes, message) => {
            if (nodes.length >= threshold) {
              // Report on all occurrences
              nodes.forEach(node => {
                context.report({
                  node,
                  messageId: 'repeatedErrorMessage',
                  data: {
                    message,
                    count: nodes.length,
                    errorClass: errorClassName,
                  },
                });
              });
            }
          });
        });
      },
    };
  }
);

export { requireHardcodedErrorMessage };
