# error/require-hardcoded-error-message

Require repeated error messages to be hardcoded in the error class constructor.

## Rule Details

This rule detects when the same literal error message is passed at multiple `throw new SomeError('message')` call sites for the same error class. When a message is repeated, it should instead be hardcoded inside the error class's own constructor so there is a single source of truth.

❌ Examples of **incorrect** code for this rule:

```js
throw new ValidationError('Name is required');
// ... elsewhere in the code
throw new ValidationError('Name is required'); // repeated message
```

✅ Examples of **correct** code for this rule:

```js
class NameRequiredError extends Error {
  constructor() {
    super('Name is required');
  }
}

throw new NameRequiredError();
// ... elsewhere in the code
throw new NameRequiredError(); // no repeated message
```

## Options

This rule accepts an options object with the following properties:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `threshold` | `number` | `2` | Minimum number of occurrences of the same message before it is reported |
| `ignoreErrorClasses` | `string[]` | `[]` | Error class names to skip checking |
| `checkImportedErrors` | `boolean` | `true` | Whether to also check error classes that were imported |

### threshold

```js
/* eslint error/require-hardcoded-error-message: ["warn", { "threshold": 3 }] */

// Only reported once the same message is used 3+ times with the same error class
```

### ignoreErrorClasses

```js
/* eslint error/require-hardcoded-error-message: ["warn", { "ignoreErrorClasses": ["LegacyError"] }] */

throw new LegacyError('Repeated message'); // allowed, not checked
throw new LegacyError('Repeated message');
```

### checkImportedErrors

```js
/* eslint error/require-hardcoded-error-message: ["warn", { "checkImportedErrors": false }] */

import { ValidationError } from './errors.js';

// Not checked, because ValidationError is imported and checkImportedErrors is false
throw new ValidationError('Repeated message');
throw new ValidationError('Repeated message');
```

## When Not To Use It

You might want to disable this rule if:

- Your project intentionally reuses the same message string across multiple throw sites
- You have not yet adopted a hardcoded-message error class pattern

## Related Rules

- [error/no-literal-error-message](../no-literal-error-message/README.md) - Disallow literal string messages in error constructors
- [error/no-generic-error](../no-generic-error/README.md) - Disallow throwing generic `Error`
- [error/require-custom-error](../require-custom-error/README.md) - Require custom error classes
