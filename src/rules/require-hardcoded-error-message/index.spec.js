import { describe } from 'vitest';
import { RuleTester } from 'eslint';
import { requireHardcodedErrorMessage } from './index.js';

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
});

describe('require-hardcoded-error-message', () => {
  ruleTester.run('require-hardcoded-error-message', requireHardcodedErrorMessage, {
    valid: [
      // Single occurrence - no violation
      'throw new ValidationError("Validation failed")',

      // Different messages with same error - no violation
      `throw new ValidationError("Field A is invalid");
       throw new ValidationError("Field B is invalid");`,

      // Different error classes with same message - no violation
      `throw new ValidationError("Operation failed");
       throw new NetworkError("Operation failed");`,

      // No message passed - no violation
      `throw new ValidationError();
       throw new ValidationError();`,

      // Template literals - no violation (not literal strings)
      `throw new ValidationError(\`Validation failed for \${field}\`);
       throw new ValidationError(\`Validation failed for \${field}\`);`,

      // Variable messages - no violation
      `const msg = "Validation failed";
       throw new ValidationError(msg);
       throw new ValidationError(msg);`,

      // Base Error class ignored
      `throw new Error("Something went wrong");
       throw new Error("Something went wrong");`,

      // Below threshold (using threshold: 3)
      {
        code: `throw new ValidationError("Validation failed");
               throw new ValidationError("Validation failed");`,
        options: [{ threshold: 3 }],
      },

      // Ignored error class
      {
        code: `throw new CustomError("Custom message");
               throw new CustomError("Custom message");
               throw new CustomError("Custom message");`,
        options: [{ ignoreErrorClasses: ['CustomError'] }],
      },

      // Imported errors not checked when checkImportedErrors: false
      {
        code: `import { ValidationError } from 'validation-lib';
               throw new ValidationError("Validation failed");
               throw new ValidationError("Validation failed");`,
        options: [{ checkImportedErrors: false }],
      },

      // Different imported errors with same message - no violation
      `import { ValidationError } from 'validation-lib';
       throw new ValidationError("Operation failed");
       throw new NetworkError("Operation failed");`,
    ],
    invalid: [
      // Basic violation - same error, same message twice
      {
        code: `throw new ValidationError("Validation failed");
               throw new ValidationError("Validation failed");`,
        errors: [
          {
            messageId: 'repeatedErrorMessage',
            data: { message: 'Validation failed', count: 2, errorClass: 'ValidationError' },
          },
          {
            messageId: 'repeatedErrorMessage',
            data: { message: 'Validation failed', count: 2, errorClass: 'ValidationError' },
          },
        ],
      },

      // Three occurrences
      {
        code: `throw new NotFoundError("User not found");
               throw new NotFoundError("User not found");
               throw new NotFoundError("User not found");`,
        errors: [
          {
            messageId: 'repeatedErrorMessage',
            data: { message: 'User not found', count: 3, errorClass: 'NotFoundError' },
          },
          {
            messageId: 'repeatedErrorMessage',
            data: { message: 'User not found', count: 3, errorClass: 'NotFoundError' },
          },
          {
            messageId: 'repeatedErrorMessage',
            data: { message: 'User not found', count: 3, errorClass: 'NotFoundError' },
          },
        ],
      },

      // Multiple violations in same file
      {
        code: `throw new ValidationError("Invalid input");
               throw new ValidationError("Invalid input");
               throw new NotFoundError("Resource not found");
               throw new NotFoundError("Resource not found");`,
        errors: [
          {
            messageId: 'repeatedErrorMessage',
            data: { message: 'Invalid input', count: 2, errorClass: 'ValidationError' },
          },
          {
            messageId: 'repeatedErrorMessage',
            data: { message: 'Invalid input', count: 2, errorClass: 'ValidationError' },
          },
          {
            messageId: 'repeatedErrorMessage',
            data: { message: 'Resource not found', count: 2, errorClass: 'NotFoundError' },
          },
          {
            messageId: 'repeatedErrorMessage',
            data: { message: 'Resource not found', count: 2, errorClass: 'NotFoundError' },
          },
        ],
      },

      // Check imported errors by default
      {
        code: `import { ValidationError } from 'validation-lib';
               throw new ValidationError("Validation failed");
               throw new ValidationError("Validation failed");`,
        errors: [
          {
            messageId: 'repeatedErrorMessage',
            data: { message: 'Validation failed', count: 2, errorClass: 'ValidationError' },
          },
          {
            messageId: 'repeatedErrorMessage',
            data: { message: 'Validation failed', count: 2, errorClass: 'ValidationError' },
          },
        ],
      },

      // Custom threshold
      {
        code: `throw new CustomError("Error message");
               throw new CustomError("Error message");
               throw new CustomError("Error message");
               throw new CustomError("Error message");`,
        options: [{ threshold: 4 }],
        errors: [
          {
            messageId: 'repeatedErrorMessage',
            data: { message: 'Error message', count: 4, errorClass: 'CustomError' },
          },
          {
            messageId: 'repeatedErrorMessage',
            data: { message: 'Error message', count: 4, errorClass: 'CustomError' },
          },
          {
            messageId: 'repeatedErrorMessage',
            data: { message: 'Error message', count: 4, errorClass: 'CustomError' },
          },
          {
            messageId: 'repeatedErrorMessage',
            data: { message: 'Error message', count: 4, errorClass: 'CustomError' },
          },
        ],
      },

      // Real-world scenario
      {
        code: `
          function validateUser(user) {
            if (!user.name) throw new ValidationError("Name is required");
            if (!user.email) throw new ValidationError("Email is required");
          }

          function validateProduct(product) {
            if (!product.name) throw new ValidationError("Name is required");
            if (!product.price) throw new ValidationError("Price is required");
          }
        `,
        errors: [
          {
            messageId: 'repeatedErrorMessage',
            data: { message: 'Name is required', count: 2, errorClass: 'ValidationError' },
          },
          {
            messageId: 'repeatedErrorMessage',
            data: { message: 'Name is required', count: 2, errorClass: 'ValidationError' },
          },
        ],
      },
    ],
  });
});
