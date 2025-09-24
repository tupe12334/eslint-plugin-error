# eslint-plugin-error

An ESLint plugin that enforces best practices for JavaScript and TypeScript error handling.

## Installation

```bash
npm install eslint-plugin-error --save-dev
# or
pnpm add eslint-plugin-error --save-dev
# or
yarn add eslint-plugin-error --dev
```

## Usage

### ESLint 9+ (Flat Config)

Add the plugin to your `eslint.config.js`:

```javascript
import errorPlugin from 'eslint-plugin-error';

export default [
  {
    plugins: {
      error: errorPlugin,
    },
    rules: {
      'error/no-generic-error': 'error',
      'error/require-custom-error': 'error',
      'error/no-throw-literal': 'error',
    },
  },
  // Or use the recommended configuration
  errorPlugin.configs.recommended,
];
```

### ESLint 8 (Legacy Config)

Add `error` to your ESLint plugins list and configure the rules:

```json
{
  "plugins": ["error"],
  "rules": {
    "error/no-generic-error": "error",
    "error/require-custom-error": "error",
    "error/no-throw-literal": "error"
  }
}
```

Or use the recommended configuration:

```json
{
  "extends": ["plugin:error/recommended"]
}
```

## Rules

### `error/no-generic-error`

Disallows throwing generic `Error` instances and suggests appropriate custom error types based on the error message.

❌ Bad:
```javascript
throw new Error('Validation failed');
throw new Error('User not found');
```

✅ Good:
```javascript
throw new ValidationError('Validation failed');
throw new NotFoundError('User not found');
```

### `error/require-custom-error`

Requires the use of custom error classes that extend `Error` and enforces naming conventions.

❌ Bad:
```javascript
throw new Error('Something went wrong');
class CustomError {} // doesn't extend Error
throw new Custom('message'); // missing Error suffix
```

✅ Good:
```javascript
throw new CustomError('Something went wrong');
class CustomError extends Error {}
throw new ValidationError('message');
```

### `error/no-throw-literal`

Disallows throwing literals, primitives, or objects that are not error instances.

❌ Bad:
```javascript
throw 'error message';
throw 404;
throw { message: 'error' };
throw undefined;
```

✅ Good:
```javascript
throw new Error('error message');
throw new CustomError('Not found');
throw errorInstance;
```

## Configuration Options

### `error/no-generic-error`

```json
{
  "error/no-generic-error": ["error", {
    "allowedErrorNames": ["Error"] // Allow specific error names
  }]
}
```

### `error/require-custom-error`

```json
{
  "error/require-custom-error": ["error", {
    "allowedBaseErrors": ["Error"], // Allowed base error classes
    "requireErrorSuffix": true // Require Error suffix in class names
  }]
}
```

### `error/no-throw-literal`

```json
{
  "error/no-throw-literal": ["error", {
    "allowThrowingObjects": false, // Allow throwing plain objects
    "allowThrowingUnknown": false // Allow throwing unknown variables
  }]
}
```


## License

MIT