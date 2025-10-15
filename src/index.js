import { noGenericError } from './rules/no-generic-error/index.js';
import { requireCustomError } from './rules/require-custom-error/index.js';
import { noThrowLiteral } from './rules/no-throw-literal/index.js';
import { requireHardcodedErrorMessage } from './rules/require-hardcoded-error-message/index.js';

const plugin = {
  meta: {
    name: 'eslint-plugin-error',
    version: '1.0.0',
  },
  rules: {
    'no-generic-error': noGenericError,
    'require-custom-error': requireCustomError,
    'no-throw-literal': noThrowLiteral,
    'require-hardcoded-error-message': requireHardcodedErrorMessage,
  },
  configs: {
    recommended: {
      rules: {
        'error/no-generic-error': 'error',
        'error/require-custom-error': 'error',
        'error/no-throw-literal': 'error',
      },
    },
    strict: {
      rules: {
        'error/no-generic-error': 'error',
        'error/require-custom-error': 'error',
        'error/no-throw-literal': 'error',
      },
    },
  },
};

export default plugin;