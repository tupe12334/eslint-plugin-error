# error/no-literal-error-message

Disallow creating errors with literal string messages.

## Rule Details

This rule enforces that error messages should be hardcoded inside custom error classes rather than passed as literal strings at the throw site. This makes errors more testable (using `instanceof` checks instead of string matching) and more maintainable.

The rule detects both `new Error("msg")` syntax and `Error("msg")` (without `new`) for built-in error types.

### Why This Rule?

Literal string messages in errors have several problems:

1. **Testing difficulty**: You must match exact strings instead of using `instanceof`
2. **Refactoring risk**: Changing a message breaks tests and error handling
3. **Duplication**: Same message may be repeated in multiple places
4. **Type safety**: No compile-time checking of error types

### Examples

**Incorrect** code for this rule:

```js
// Literal strings in constructors
throw new Error('User not found');
throw new ValidationError('Invalid input');
throw new TypeError('Expected a number');

// Template literals
throw new Error(`User ${userId} not found`);

// Without 'new' keyword (built-in errors)
throw Error('Something went wrong');
throw TypeError('Invalid type');

// Assigned errors
const e = new Error('Failed to connect');
```

**Correct** code for this rule:

```js
// Custom error classes with hardcoded messages
class UserNotFoundError extends Error {
  constructor() {
    super('User not found');
    this.name = 'UserNotFoundError';
  }
}

class InvalidInputError extends Error {
  constructor() {
    super('Invalid input');
    this.name = 'InvalidInputError';
  }
}

// Usage - clean and testable
throw new UserNotFoundError();
throw new InvalidInputError();

// Variable messages are allowed (for dynamic context)
throw new Error(errorMessage);
throw new CustomError(getMessage());

// Re-throwing caught errors
try {
  riskyOperation();
} catch (e) {
  throw e;
}
```

## Options

This rule accepts an options object with the following properties:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `allowedErrorClasses` | `string[]` | `[]` | Error class names allowed to have literal messages |
| `allowedPatterns` | `string[]` | `[]` | Regex patterns for error class names that are allowed |
| `checkTemplateLiterals` | `boolean` | `true` | Whether to also flag template literals |

### allowedErrorClasses

Allow specific error classes to have literal messages:

```js
/* eslint error/no-literal-error-message: ["error", { "allowedErrorClasses": ["Error", "LegacyError"] }] */

// These are now allowed
throw new Error('Allowed message');
throw new LegacyError('Legacy message');
```

### allowedPatterns

Allow error classes matching regex patterns:

```js
/* eslint error/no-literal-error-message: ["error", { "allowedPatterns": ["^Dev.*", "Test.*Error"] }] */

// These are now allowed
throw new DevError('Debug message');
throw new TestValidationError('Test message');
```

### checkTemplateLiterals

Disable detection of template literals:

```js
/* eslint error/no-literal-error-message: ["error", { "checkTemplateLiterals": false }] */

// This is now allowed
throw new Error(`User ${userId} not found`);
```

## When Not To Use It

You might want to disable this rule if:

- Your project doesn't follow the custom error class pattern
- You need dynamic error messages that can't be hardcoded
- You're working with legacy code that would require significant refactoring
- You're writing scripts or one-off tools where testability isn't a concern

## Related Rules

- [error/no-generic-error](../no-generic-error/README.md) - Disallow throwing generic `Error`
- [error/require-custom-error](../require-custom-error/README.md) - Require custom error classes
- [error/require-hardcoded-error-message](../require-hardcoded-error-message/README.md) - Detect repeated error messages
