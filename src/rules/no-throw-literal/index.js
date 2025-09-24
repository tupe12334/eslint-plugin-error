/**
 * @fileoverview Rule to disallow throwing literals as exceptions
 * @description This rule disallows throwing literals, primitives, or plain objects as exceptions.
 * Only error objects should be thrown to ensure proper error handling and stack trace information.
 * This promotes better debugging experience and consistent error handling patterns.
 *
 * @example
 * // ❌ Bad - Throwing literals and primitives
 * throw 'error message';
 * throw 404;
 * throw { message: 'error', code: 404 };
 * throw undefined;
 *
 * // ✅ Good - Throwing error objects
 * throw new Error('error message');
 * throw new CustomError('Something went wrong');
 * throw errorVariable; // assuming errorVariable is an Error instance
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
 * Checks if a node represents an Error object construction
 * @param {Object} node - AST node to check
 * @returns {boolean} True if the node creates an Error object
 *
 * @example
 * isErrorObject({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Error' } }) // true
 * isErrorObject({ type: 'NewExpression', callee: { type: 'Identifier', name: 'ValidationError' } }) // true
 * isErrorObject({ type: 'Literal', value: 'string' }) // false
 */
function isErrorObject(node) {
  if (node.type === 'NewExpression') {
    const callee = node.callee;
    if (callee && callee.type === 'Identifier') {
      return callee.name.endsWith('Error') || callee.name === 'Error';
    }
  }
  return false;
}

/**
 * Checks if a node represents a literal value
 * @param {Object} node - AST node to check
 * @returns {boolean} True if the node is a literal value
 *
 * @example
 * isLiteral({ type: 'Literal', value: 'string' }) // true
 * isLiteral({ type: 'TemplateLiteral' }) // true
 * isLiteral({ type: 'UnaryExpression', operator: '-', argument: { type: 'Literal' } }) // true
 * isLiteral({ type: 'Identifier', name: 'variable' }) // false
 */
function isLiteral(node) {
  return node.type === 'Literal' ||
         node.type === 'TemplateLiteral' ||
         (node.type === 'UnaryExpression' && node.operator === '-' && node.argument.type === 'Literal');
}

/**
 * ESLint rule: no-throw-literal
 *
 * Disallows throwing literals, primitives, or plain objects as exceptions.
 * Only error objects should be thrown to ensure proper error handling.
 *
 * @type {Object}
 */
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
          /**
           * Whether to allow throwing plain objects
           * @type {boolean}
           * @default false
           */
          allowThrowingObjects: {
            type: 'boolean',
            default: false,
          },
          /**
           * Whether to allow throwing unknown variables
           * @type {boolean}
           * @default false
           */
          allowThrowingUnknown: {
            type: 'boolean',
            default: false,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      object: 'Expected an error object to be thrown.',
      undef: 'Do not throw undefined.',
      literal: 'Expected an error object to be thrown, not a literal.',
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
    const allowThrowingObjects = options.allowThrowingObjects || false;
    const allowThrowingUnknown = options.allowThrowingUnknown || false;

    return {
      /**
       * Handles ThrowStatement AST nodes
       * Checks various types of thrown values and reports violations
       * @param {Object} node - ThrowStatement AST node
       */
      ThrowStatement(node) {
        if (!node.argument) {
          return;
        }

        const argument = node.argument;

        // Check for throwing undefined
        if (argument.type === 'Identifier' && argument.name === 'undefined') {
          context.report({
            node: argument,
            messageId: 'undef',
          });
          return;
        }

        // Check for throwing literal values
        if (isLiteral(argument)) {
          context.report({
            node: argument,
            messageId: 'literal',
            /**
             * Auto-fix function to wrap literal in Error constructor
             * @param {Object} fixer - ESLint fixer object
             * @returns {Object} Fix object to wrap literal with Error
             */
            fix(fixer) {
              const sourceCode = context.getSourceCode();
              const text = sourceCode.getText(argument);
              return fixer.replaceText(argument, `new Error(${text})`);
            },
          });
          return;
        }

        // Check for throwing plain objects (when not allowed)
        if (!allowThrowingObjects &&
            argument.type === 'ObjectExpression' &&
            !isErrorObject(argument)) {
          context.report({
            node: argument,
            messageId: 'object',
          });
        }

        // Check for throwing unknown identifiers (when not allowed)
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