import { noGenericError } from './rules/no-generic-error/index.js';
import { requireCustomError } from './rules/require-custom-error/index.js';
import { noThrowLiteral } from './rules/no-throw-literal/index.js';

const plugin = {
  meta: {
    name: 'eslint-plugin-error',
    version: '1.0.0',
  },
  rules: {
    'no-generic-error': noGenericError,
    'require-custom-error': requireCustomError,
    'no-throw-literal': noThrowLiteral,
  },
  configs: {
    recommended: {
      plugins: {
        error: plugin,
      },
      rules: {
        'error/no-generic-error': 'error',
        'error/require-custom-error': 'error',
        'error/no-throw-literal': 'error',
      },
    },
    strict: {
      plugins: {
        error: plugin,
      },
      rules: {
        'error/no-generic-error': 'error',
        'error/require-custom-error': 'error',
        'error/no-throw-literal': 'error',
      },
    },
  },
};

export default plugin;