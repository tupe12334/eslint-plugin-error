function createRule(meta, create) {
  return { meta, create };
}

const noLiteralErrorMessage = createRule(
  {
    type: 'problem',
    docs: {
      description: 'Disallow creating errors with literal string messages',
      category: 'Best Practices',
      recommended: true,
      url: 'https://github.com/tupe12334/eslint-plugin-error/blob/main/docs/rules/no-literal-error-message.md'
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowedErrorClasses: {
            type: 'array',
            items: { type: 'string' },
            default: [],
            description: 'Specific error class names allowed to have literal messages'
          },
          allowedPatterns: {
            type: 'array',
            items: { type: 'string' },
            default: [],
            description: 'Regex patterns for error class names that are allowed to have literal messages'
          },
          checkTemplateLiterals: {
            type: 'boolean',
            default: true,
            description: 'Whether to also detect template literals as violations'
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      noLiteralMessage: 'Avoid literal string message "{{message}}" in {{errorClass}}. Create a dedicated error class with a hardcoded message instead.',
      noTemplateLiteralMessage: 'Avoid template literal message in {{errorClass}}. Create a dedicated error class with a hardcoded message instead.',
    },
  },
  function create(context) {
    const options = context.options[0] || {};
    const allowedErrorClasses = new Set(options.allowedErrorClasses || []);
    const allowedPatterns = (options.allowedPatterns || []).map(p => new RegExp(p));
    const checkTemplateLiterals = options.checkTemplateLiterals !== false;

    const BUILTIN_ERRORS = new Set([
      'Error',
      'TypeError',
      'RangeError',
      'SyntaxError',
      'ReferenceError',
      'EvalError',
      'URIError',
      'AggregateError',
    ]);

    function isErrorClassName(name) {
      return name === 'Error' || name.endsWith('Error');
    }

    function isBuiltinError(name) {
      return BUILTIN_ERRORS.has(name);
    }

    function isAllowedErrorClass(className) {
      if (allowedErrorClasses.has(className)) {
        return true;
      }
      return allowedPatterns.some(pattern => pattern.test(className));
    }

    function isLiteralString(node) {
      return node.type === 'Literal' && typeof node.value === 'string';
    }

    function isTemplateLiteral(node) {
      return node.type === 'TemplateLiteral';
    }

    function getErrorClassName(callee) {
      if (callee.type === 'Identifier') {
        return callee.name;
      }
      if (callee.type === 'MemberExpression' && callee.property.type === 'Identifier') {
        return callee.property.name;
      }
      return null;
    }

    function reportLiteralMessage(node, errorClassName, firstArg) {
      if (isLiteralString(firstArg)) {
        const message = firstArg.value;
        context.report({
          node: firstArg,
          messageId: 'noLiteralMessage',
          data: {
            message: message.length > 30 ? message.substring(0, 30) + '...' : message,
            errorClass: errorClassName,
          },
        });
      } else if (checkTemplateLiterals && isTemplateLiteral(firstArg)) {
        context.report({
          node: firstArg,
          messageId: 'noTemplateLiteralMessage',
          data: {
            errorClass: errorClassName,
          },
        });
      }
    }

    function checkNewExpression(node) {
      const errorClassName = getErrorClassName(node.callee);

      if (!errorClassName || !isErrorClassName(errorClassName)) {
        return;
      }

      if (isAllowedErrorClass(errorClassName)) {
        return;
      }

      const firstArg = node.arguments && node.arguments[0];
      if (!firstArg) {
        return;
      }

      reportLiteralMessage(node, errorClassName, firstArg);
    }

    function checkCallExpression(node) {
      const errorClassName = getErrorClassName(node.callee);

      if (!errorClassName || !isBuiltinError(errorClassName)) {
        return;
      }

      if (isAllowedErrorClass(errorClassName)) {
        return;
      }

      const firstArg = node.arguments && node.arguments[0];
      if (!firstArg) {
        return;
      }

      reportLiteralMessage(node, errorClassName, firstArg);
    }

    return {
      ThrowStatement(node) {
        const argument = node.argument;
        if (argument && argument.type === 'NewExpression') {
          checkNewExpression(argument);
        } else if (argument && argument.type === 'CallExpression') {
          checkCallExpression(argument);
        }
      },

      NewExpression(node) {
        const parent = node.parent;
        if (parent && parent.type !== 'ThrowStatement') {
          checkNewExpression(node);
        }
      },

      CallExpression(node) {
        const parent = node.parent;
        if (parent && parent.type !== 'ThrowStatement') {
          checkCallExpression(node);
        }
      },
    };
  }
);

export { noLiteralErrorMessage };
