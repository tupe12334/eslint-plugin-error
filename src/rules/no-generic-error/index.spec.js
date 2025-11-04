import { describe } from 'vitest';
import { RuleTester } from 'eslint';
import { noGenericError } from './index.js';

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
});

describe('no-generic-error', () => {
  ruleTester.run('no-generic-error', noGenericError, {
    valid: [
      'throw new CustomError("message")',
      'throw new ValidationError("message")',
      'throw new NotFoundError("message")',
      'throw customError',
      'throw someVariable',
      {
        code: 'throw new Error("message")',
        options: [{ allowedErrorNames: ['Error'] }],
      },
    ],
    invalid: [
      {
        code: 'throw new Error("message")',
        errors: [{
          messageId: 'noGenericErrorWithSuggestion',
          data: { suggestion: 'CustomError' },
        }],
      },
      {
        code: 'throw new Error("validation failed")',
        errors: [{
          messageId: 'noGenericErrorWithSuggestion',
          data: { suggestion: 'ValidationError' },
        }],
      },
      {
        code: 'throw new Error("user not found")',
        errors: [{
          messageId: 'noGenericErrorWithSuggestion',
          data: { suggestion: 'NotFoundError' },
        }],
      },
      {
        code: 'throw new Error("unauthorized access")',
        errors: [{
          messageId: 'noGenericErrorWithSuggestion',
          data: { suggestion: 'UnauthorizedError' },
        }],
      },
      {
        code: 'throw new Error("connection timeout")',
        errors: [{
          messageId: 'noGenericErrorWithSuggestion',
          data: { suggestion: 'TimeoutError' },
        }],
      },
      {
        code: 'throw new Error("network error")',
        errors: [{
          messageId: 'noGenericErrorWithSuggestion',
          data: { suggestion: 'NetworkError' },
        }],
      },
      {
        code: 'throw new Error()',
        errors: [{
          messageId: 'noGenericError',
        }],
      },
    ],
  });
});