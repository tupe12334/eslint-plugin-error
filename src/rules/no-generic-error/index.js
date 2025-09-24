/**
 * @fileoverview Rule to disallow throwing generic Error instances
 * @description This rule prevents the use of generic Error constructor and suggests
 * appropriate custom error types based on the error message content. It promotes
 * better error handling practices by encouraging descriptive, typed error classes.
 *
 * @example
 * // ❌ Bad - Generic error
 * throw new Error('Validation failed');
 *
 * // ✅ Good - Custom error
 * throw new ValidationError('Validation failed');
 */

/**
 * Creates a rule with the given metadata and implementation
 * @param {Object} meta - Rule metadata
 * @param {Function} create - Rule implementation function
 * @returns {Object} ESLint rule object
 */
function createRule(meta, create) {
  return { meta, create };
}

/**
 * Analyzes error message content and suggests appropriate custom error type
 * @param {Object|undefined} messageArg - The AST node representing the error message argument
 * @returns {string|null} Suggested error class name or null if no suggestion available
 *
 * @example
 * getErrorSuggestion({ type: 'Literal', value: 'validation failed' }) // returns 'ValidationError'
 * getErrorSuggestion({ type: 'Literal', value: 'user not found' }) // returns 'NotFoundError'
 */
function getErrorSuggestion(messageArg) {
  if (!messageArg || messageArg.type !== 'Literal' || typeof messageArg.value !== 'string') {
    return null;
  }

  const message = messageArg.value.toLowerCase();

  // Validation-related errors
  if (message.includes('validation') || message.includes('invalid')) {
    return 'ValidationError';
  }

  // Not found errors
  if (message.includes('not found') || message.includes('missing')) {
    return 'NotFoundError';
  }

  // Authorization errors
  if (message.includes('unauthorized') || message.includes('permission')) {
    return 'UnauthorizedError';
  }

  // Timeout errors
  if (message.includes('timeout') || message.includes('time out')) {
    return 'TimeoutError';
  }

  // Network-related errors
  if (message.includes('network') || message.includes('connection')) {
    return 'NetworkError';
  }

  return 'CustomError';
}

/**
 * ESLint rule: no-generic-error
 *
 * Disallows throwing generic Error instances and suggests appropriate custom error types
 * based on the error message content. This rule helps maintain consistent error handling
 * patterns and improves code readability and debugging.
 *
 * @type {Object}
 */
const noGenericError = createRule(
  {
    type: 'problem',
    docs: {
      description: 'Disallow throwing generic Error instances',
      category: 'Best Practices',
      recommended: false,
      url: 'https://github.com/tupe12334/eslint-plugin-error/blob/main/docs/rules/no-generic-error.md'
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          /**
           * Array of error class names that are allowed to be used directly
           * @type {string[]}
           * @default []
           */
          allowedErrorNames: {
            type: 'array',
            items: { type: 'string' },
            default: [],
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      noGenericError: 'Avoid throwing generic Error. Use a custom error class instead.',
      noGenericErrorWithSuggestion: 'Avoid throwing generic Error. Consider using {{suggestion}} instead.',
    },
  },
  /**
   * Rule implementation function
   * @param {Object} context - ESLint rule context
   * @param {Object} context.options - Rule options
   * @param {Function} context.report - Function to report violations
   * @param {Function} context.getSourceCode - Function to get source code
   * @returns {Object} Visitor object for AST traversal
   */
  function create(context) {
    const options = context.options[0] || {};
    const allowedErrorNames = options.allowedErrorNames || [];

    return {
      /**
       * Handles ThrowStatement AST nodes
       * @param {Object} node - ThrowStatement AST node
       */
      ThrowStatement(node) {
        const argument = node.argument;

        // Check if we're throwing a new Error instance
        if (argument && argument.type === 'NewExpression') {
          const callee = argument.callee;

          if (callee.type === 'Identifier' && callee.name === 'Error') {
            // Skip if Error is explicitly allowed
            if (allowedErrorNames.includes('Error')) {
              return;
            }

            const suggestion = getErrorSuggestion(argument.arguments && argument.arguments[0]);

            context.report({
              node: argument,
              messageId: suggestion ? 'noGenericErrorWithSuggestion' : 'noGenericError',
              data: { suggestion },
              /**
               * Auto-fix function to replace Error with suggested custom error
               * @param {Object} fixer - ESLint fixer object
               * @returns {Object|null} Fix object or null if no fix available
               */
              fix(fixer) {
                if (suggestion) {
                  return fixer.replaceText(callee, suggestion);
                }
                return null;
              },
            });
          }
        }
      },
    };
  }
);

export { noGenericError };