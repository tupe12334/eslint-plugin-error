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
      // Test: Custom error with no message at throw site (hardcoded in constructor)
      'throw new ValidationError()',
      // Test: Custom error class with hardcoded message in constructor
      `class HardcodedError extends Error {
        constructor() {
          super('Hardcoded message');
        }
      }
      throw new HardcodedError();`,
      // Test: Custom error that accepts optional message but has default
      `class OptionalMessageError extends Error {
        constructor(message = 'Default hardcoded message') {
          super(message);
        }
      }
      throw new OptionalMessageError();`,
      // Test: Imported errors can have any name (named import)
      `import { AuthFailure } from 'auth-lib';
      throw new AuthFailure("message");`,
      // Test: Imported errors can have any name (default import)
      `import NetworkTimeout from 'network-lib';
      throw new NetworkTimeout("message");`,
      // Test: Imported errors can have any name (namespace import)
      `import * as Auth from 'auth-lib';
      throw new Auth.Failure("message");`,
      // Test: Multiple imports with various names
      `import { Custom, ValidationFailure } from 'errors';
      throw new Custom("message");
      throw new ValidationFailure("message");`,
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
      // Test: Locally declared errors still need Error suffix even when imports exist
      {
        code: `import { AuthFailure } from 'auth-lib';
        throw new LocalCustom("message");`,
        errors: [{
          messageId: 'requireErrorSuffix',
        }],
        output: `import { AuthFailure } from 'auth-lib';
        throw new LocalCustomError("message");`,
      },
    ],
  });
});