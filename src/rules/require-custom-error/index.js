/**
 * @fileoverview Rule to require custom error classes that extend Error
 * @description This rule enforces the use of custom error classes instead of generic
 * error constructors and ensures that custom error classes follow proper inheritance
 * and naming conventions. It promotes consistent error handling patterns across the codebase.
 *
 * @example
 * // ❌ Bad - Generic error usage
 * throw new Error('Something went wrong');
 * throw new TypeError('Invalid type');
 * class CustomError {} // doesn't extend Error
 *
 * // ✅ Good - Custom error classes with proper inheritance
 * throw new CustomError('Something went wrong');
 * class ValidationError extends Error {}
 * throw new ValidationError('Validation failed');
 *
 * // ✅ Good - Custom error with hardcoded message (no message needed at throw site)
 * class HardcodedError extends Error {
 *   constructor() { super('Hardcoded message'); }
 * }
 * throw new HardcodedError(); // This is allowed - rule doesn't check constructor arguments
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
 * ESLint rule: require-custom-error
 *
 * Requires the use of custom error classes instead of generic error constructors
 * and enforces naming conventions and proper inheritance for error classes.
 *
 * @type {Object}
 */
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
          /**
           * Array of base error classes that are not allowed to be thrown directly
           * @type {string[]}
           * @default ['Error']
           */
          allowedBaseErrors: {
            type: 'array',
            items: { type: 'string' },
            default: ['Error'],
          },
          /**
           * Whether custom error class names should end with "Error"
           * @type {boolean}
           * @default true
           */
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
  /**
   * Rule implementation function
   * @param {Object} context - ESLint rule context
   * @param {Object} context.options - Rule options
   * @param {Function} context.report - Function to report violations
   * @returns {Object} Visitor object for AST traversal
   */
  function create(context) {
    const options = context.options[0] || {};
    const allowedBaseErrors = options.allowedBaseErrors || ['Error'];
    const requireErrorSuffix = options.requireErrorSuffix !== false;

    return {
      /**
       * Handles ThrowStatement AST nodes
       * Checks if thrown errors are using forbidden base error classes
       * or missing required "Error" suffix
       * @param {Object} node - ThrowStatement AST node
       */
      ThrowStatement(node) {
        const argument = node.argument;

        if (argument && argument.type === 'NewExpression') {
          const callee = argument.callee;

          if (callee.type === 'Identifier') {
            // Check if using forbidden base error class
            if (allowedBaseErrors.includes(callee.name)) {
              context.report({
                node: argument,
                messageId: 'requireCustomError',
              });
            }
            // Check if missing "Error" suffix when required
            else if (requireErrorSuffix && !callee.name.endsWith('Error')) {
              context.report({
                node: callee,
                messageId: 'requireErrorSuffix',
                /**
                 * Auto-fix function to add "Error" suffix to class name
                 * @param {Object} fixer - ESLint fixer object
                 * @returns {Object} Fix object to add Error suffix
                 */
                fix(fixer) {
                  return fixer.replaceText(callee, `${callee.name}Error`);
                },
              });
            }
          }
        }
      },

      /**
       * Handles ClassDeclaration AST nodes
       * Checks if error classes properly extend Error or another error class
       * @param {Object} node - ClassDeclaration AST node
       */
      ClassDeclaration(node) {
        // Only check classes that have "Error" in their name
        if (!node.id || !node.id.name.endsWith('Error')) {
          return;
        }

        // Check if the class extends an appropriate error class
        const hasErrorSuperClass = node.superClass &&
          ((node.superClass.type === 'Identifier' &&
            (allowedBaseErrors.includes(node.superClass.name) ||
             node.superClass.name.endsWith('Error'))) ||
           // Allow member expressions like Error.BaseError
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