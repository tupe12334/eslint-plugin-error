import { describe } from 'vitest';
import { RuleTester } from 'eslint';
import { noLiteralErrorMessage } from './index.js';

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
});

describe('no-literal-error-message', () => {
  ruleTester.run('no-literal-error-message', noLiteralErrorMessage, {
    valid: [
      // Custom error with no message (message hardcoded in class)
      'throw new ValidationError()',
      'throw new NotFoundError()',
      'throw new CustomError()',

      // Errors with variable messages (acceptable - variable reference)
      'throw new Error(errorMessage)',
      'throw new CustomError(getMessage())',
      'throw new ValidationError(config.errorMessage)',

      // Non-error constructors are ignored
      'throw new SomeClass("message")',
      'const obj = new DataClass("literal")',

      // Allowed error classes via config
      {
        code: 'throw new Error("allowed message")',
        options: [{ allowedErrorClasses: ['Error'] }],
      },
      {
        code: 'throw new LegacyError("legacy message")',
        options: [{ allowedErrorClasses: ['LegacyError'] }],
      },

      // Allowed via regex patterns
      {
        code: 'throw new DevError("debug message")',
        options: [{ allowedPatterns: ['^Dev.*'] }],
      },
      {
        code: 'throw new TestValidationError("test message")',
        options: [{ allowedPatterns: ['Test.*Error'] }],
      },

      // Template literals disabled
      {
        code: 'throw new Error(`template ${value}`)',
        options: [{ checkTemplateLiterals: false }],
      },

      // Member expression with non-error class
      'throw new Utils.Helper("message")',

      // Re-throwing caught errors
      'try { foo(); } catch (e) { throw e; }',

      // Variable reference
      'throw existingError',

      // CallExpression without new - only built-in errors are checked
      // Custom error factory functions are allowed
      'throw CustomError("message")',
      'throw createError("message")',
      'throw getValidationError("message")',

      // Built-in error without new but with variable (OK)
      'throw Error(errorMessage)',
      'throw TypeError(getType())',

      // Allowed via config
      {
        code: 'throw Error("allowed")',
        options: [{ allowedErrorClasses: ['Error'] }],
      },
    ],

    invalid: [
      // Basic Error with literal
      {
        code: 'throw new Error("User not found")',
        errors: [{
          messageId: 'noLiteralMessage',
          data: { message: 'User not found', errorClass: 'Error' },
        }],
      },

      // Custom error with literal
      {
        code: 'throw new ValidationError("Invalid input")',
        errors: [{
          messageId: 'noLiteralMessage',
          data: { message: 'Invalid input', errorClass: 'ValidationError' },
        }],
      },

      // Template literal
      {
        code: 'throw new Error(`User ${userId} not found`)',
        errors: [{
          messageId: 'noTemplateLiteralMessage',
          data: { errorClass: 'Error' },
        }],
      },

      // Template literal without interpolation
      {
        code: 'throw new Error(`Static template literal`)',
        errors: [{
          messageId: 'noTemplateLiteralMessage',
          data: { errorClass: 'Error' },
        }],
      },

      // Member expression errors
      {
        code: 'throw new Errors.ValidationError("Invalid")',
        errors: [{
          messageId: 'noLiteralMessage',
          data: { message: 'Invalid', errorClass: 'ValidationError' },
        }],
      },

      // Long message truncation
      {
        code: 'throw new Error("This is a very long error message that should be truncated in the report")',
        errors: [{
          messageId: 'noLiteralMessage',
          data: {
            message: 'This is a very long error mess...',
            errorClass: 'Error'
          },
        }],
      },

      // Assignment (when not in throw statement)
      {
        code: 'const e = new Error("message")',
        errors: [{
          messageId: 'noLiteralMessage',
          data: { message: 'message', errorClass: 'Error' },
        }],
      },

      // TypeError, RangeError, etc.
      {
        code: 'throw new TypeError("Invalid type")',
        errors: [{
          messageId: 'noLiteralMessage',
          data: { message: 'Invalid type', errorClass: 'TypeError' },
        }],
      },

      // RangeError
      {
        code: 'throw new RangeError("Value out of range")',
        errors: [{
          messageId: 'noLiteralMessage',
          data: { message: 'Value out of range', errorClass: 'RangeError' },
        }],
      },

      // Multiple violations in same function
      {
        code: `
          function getUser(id) {
            if (!id) {
              throw new ValidationError("User ID is required");
            }
            const user = db.find(id);
            if (!user) {
              throw new NotFoundError("User not found");
            }
            return user;
          }
        `,
        errors: [
          {
            messageId: 'noLiteralMessage',
            data: { message: 'User ID is required', errorClass: 'ValidationError' },
          },
          {
            messageId: 'noLiteralMessage',
            data: { message: 'User not found', errorClass: 'NotFoundError' },
          },
        ],
      },

      // Template literal in custom error
      {
        code: 'throw new CustomError(`Something went wrong with ${value}`)',
        errors: [{
          messageId: 'noTemplateLiteralMessage',
          data: { errorClass: 'CustomError' },
        }],
      },

      // CallExpression without new - built-in errors with literal
      {
        code: 'throw Error("without new")',
        errors: [{
          messageId: 'noLiteralMessage',
          data: { message: 'without new', errorClass: 'Error' },
        }],
      },

      // TypeError without new
      {
        code: 'throw TypeError("invalid type")',
        errors: [{
          messageId: 'noLiteralMessage',
          data: { message: 'invalid type', errorClass: 'TypeError' },
        }],
      },

      // RangeError without new
      {
        code: 'throw RangeError("out of range")',
        errors: [{
          messageId: 'noLiteralMessage',
          data: { message: 'out of range', errorClass: 'RangeError' },
        }],
      },

      // Assignment with CallExpression
      {
        code: 'const e = Error("assigned error")',
        errors: [{
          messageId: 'noLiteralMessage',
          data: { message: 'assigned error', errorClass: 'Error' },
        }],
      },

      // Template literal with CallExpression
      {
        code: 'throw Error(`template without new ${value}`)',
        errors: [{
          messageId: 'noTemplateLiteralMessage',
          data: { errorClass: 'Error' },
        }],
      },
    ],
  });
});
