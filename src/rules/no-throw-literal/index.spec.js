import { describe } from 'vitest';
import { RuleTester } from 'eslint';
import { noThrowLiteral } from './index.js';

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
});

describe('no-throw-literal', () => {
  ruleTester.run('no-throw-literal', noThrowLiteral, {
    valid: [
      'throw new Error("message")',
      'throw new CustomError("message")',
      'throw new ValidationError("message")',
      {
        code: 'throw { message: "error" }',
        options: [{ allowThrowingObjects: true }],
      },
      {
        code: 'throw unknownVariable',
        options: [{ allowThrowingUnknown: true }],
      },
    ],
    invalid: [
      {
        code: 'throw "error message"',
        errors: [{
          messageId: 'literal',
        }],
        output: 'throw new Error("error message")',
      },
      {
        code: 'throw 42',
        errors: [{
          messageId: 'literal',
        }],
        output: 'throw new Error(42)',
      },
      {
        code: 'throw true',
        errors: [{
          messageId: 'literal',
        }],
        output: 'throw new Error(true)',
      },
      {
        code: 'throw `template literal`',
        errors: [{
          messageId: 'literal',
        }],
        output: 'throw new Error(`template literal`)',
      },
      {
        code: 'throw undefined',
        errors: [{
          messageId: 'undef',
        }],
      },
      {
        code: 'throw { message: "error" }',
        errors: [{
          messageId: 'object',
        }],
      },
      {
        code: 'throw -1',
        errors: [{
          messageId: 'literal',
        }],
        output: 'throw new Error(-1)',
      },
      {
        code: 'throw errorVariable',
        errors: [{
          messageId: 'object',
        }],
      },
    ],
  });
});