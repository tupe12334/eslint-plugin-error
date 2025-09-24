# error/require-custom-error

Require custom error classes that extend Error.

## Rule Details

This rule enforces the use of custom error classes instead of generic error constructors and ensures that custom error classes follow proper inheritance and naming conventions.

❌ Examples of **incorrect** code for this rule:

```js
// Throwing generic errors
throw new Error('Something went wrong');
throw new TypeError('Invalid type');

// Custom error classes without Error suffix
throw new Custom('message');
throw new Validation('message');

// Error classes that don't extend Error
class CustomError {}
class ValidationError extends SomeOtherClass {}
```

✅ Examples of **correct** code for this rule:

```js
// Using custom error classes
throw new CustomError('Something went wrong');
throw new ValidationError('Validation failed');

// Proper error class definitions
class CustomError extends Error {}
class ValidationError extends Error {}
class NetworkError extends CustomError {}
```

## Options

This rule accepts an options object with the following properties:

- `allowedBaseErrors` (array of strings): Base error classes that are not allowed to be thrown directly. Default: `["Error"]`
- `requireErrorSuffix` (boolean): Whether custom error class names should end with "Error". Default: `true`

### allowedBaseErrors

Examples of **correct** code for this rule with the `{ "allowedBaseErrors": [] }` option:

```js
throw new Error('This is now allowed'); // Error is not in the forbidden list
```

### requireErrorSuffix

Examples of **correct** code for this rule with the `{ "requireErrorSuffix": false }` option:

```js
throw new CustomException('message'); // Suffix requirement disabled
class Custom extends Error {} // Suffix requirement disabled
```

## Auto-fixing

This rule provides automatic fixes for:

- Adding "Error" suffix to custom error class names when `requireErrorSuffix` is enabled
- Converting `throw new Custom('message')` to `throw new CustomError('message')`

## When Not To Use It

If your project:
- Uses generic error classes by design
- Has different naming conventions for error classes
- Uses third-party libraries that throw generic errors

You can disable this rule or configure the options to match your project's requirements.