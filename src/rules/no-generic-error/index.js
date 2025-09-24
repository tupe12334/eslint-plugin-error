function createRule(meta, create) {
  return { meta, create };
}

function getErrorSuggestion(messageArg) {
  if (!messageArg || messageArg.type !== 'Literal' || typeof messageArg.value !== 'string') {
    return null;
  }

  const message = messageArg.value.toLowerCase();

  if (message.includes('validation') || message.includes('invalid')) {
    return 'ValidationError';
  }
  if (message.includes('not found') || message.includes('missing')) {
    return 'NotFoundError';
  }
  if (message.includes('unauthorized') || message.includes('permission')) {
    return 'UnauthorizedError';
  }
  if (message.includes('timeout') || message.includes('time out')) {
    return 'TimeoutError';
  }
  if (message.includes('network') || message.includes('connection')) {
    return 'NetworkError';
  }

  return 'CustomError';
}

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
      noGenericError: 'Avoid throwing generic Error. Use a custom error class instead. Ensure you have tests covering this error scenario.',
      noGenericErrorWithSuggestion: 'Avoid throwing generic Error. Consider using {{suggestion}} instead. Ensure you have tests covering this error scenario.',
    },
  },
  function create(context) {
    const options = context.options[0] || {};
    const allowedErrorNames = options.allowedErrorNames || [];

    return {
      ThrowStatement(node) {
        const argument = node.argument;

        if (argument && argument.type === 'NewExpression') {
          const callee = argument.callee;

          if (callee.type === 'Identifier' && callee.name === 'Error') {
            if (allowedErrorNames.includes('Error')) {
              return;
            }

            const suggestion = getErrorSuggestion(argument.arguments && argument.arguments[0]);

            context.report({
              node: argument,
              messageId: suggestion ? 'noGenericErrorWithSuggestion' : 'noGenericError',
              data: { suggestion },
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