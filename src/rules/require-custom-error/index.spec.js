/**
 * @fileoverview Test specifications for require-custom-error rule
 * @description Comprehensive test suite covering all scenarios for the require-custom-error rule,
 * including throw statements, class declarations, and various configuration options.
 */

import { describe } from 'vitest';
import { RuleTester } from 'eslint';
import { requireCustomError } from './index.js';

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
});

describe('require-custom-error', () => {
  ruleTester.run('require-custom-error', requireCustomError, {
    valid: [
      'throw new CustomError("message")',
      'throw new ValidationError("message")',
      'class CustomError extends Error {}',
      'class ValidationError extends Error {}',
      'class NetworkError extends CustomError {}',
      {
        code: 'throw new Error("message")',
        options: [{ allowedBaseErrors: [] }],
      },
      {
        code: 'throw new CustomException("message")',
        options: [{ requireErrorSuffix: false }],
      },
      {
        code: 'class Custom extends Error {}',
        options: [{ requireErrorSuffix: false }],
      },
    ],
    invalid: [
      {
        code: 'throw new Error("message")',
        errors: [{
          messageId: 'requireCustomError',
        }],
      },
      {
        code: 'throw new TypeError("message")',
        options: [{ allowedBaseErrors: ['Error', 'TypeError'] }],
        errors: [{
          messageId: 'requireCustomError',
        }],
      },
      {
        code: 'throw new Custom("message")',
        errors: [{
          messageId: 'requireErrorSuffix',
        }],
        output: 'throw new CustomError("message")',
      },
      {
        code: 'throw new Validation("message")',
        errors: [{
          messageId: 'requireErrorSuffix',
        }],
        output: 'throw new ValidationError("message")',
      },
      {
        code: 'class CustomError {}',
        errors: [{
          messageId: 'extendError',
        }],
      },
      {
        code: 'class ValidationError extends SomeClass {}',
        errors: [{
          messageId: 'extendError',
        }],
      },
    ],
  });
});