# error/no-generic-error

Disallow throwing generic Error instances.

## Rule Details

This rule disallows the use of generic `Error` constructor and suggests appropriate custom error types based on the error message content.

❌ Examples of **incorrect** code for this rule:

```js
throw new Error('Validation failed');
throw new Error('User not found');
throw new Error('Unauthorized access');
throw new Error('Connection timeout');
throw new Error('Network error');
```

✅ Examples of **correct** code for this rule:

```js
throw new ValidationError('Validation failed');
throw new NotFoundError('User not found');
throw new UnauthorizedError('Unauthorized access');
throw new TimeoutError('Connection timeout');
throw new NetworkError('Network error');
throw new CustomError('Something went wrong');
```

## Options

This rule accepts an options object with the following properties:

- `allowedErrorNames` (array of strings): Error class names that are allowed to be used. Default: `[]`

### allowedErrorNames

Examples of **correct** code for this rule with the `{ "allowedErrorNames": ["Error"] }` option:

```js
throw new Error('This is allowed');
```

## Auto-fixing

This rule provides automatic fixes that suggest appropriate error types based on the error message:

- Messages containing "validation" or "invalid" → `ValidationError`
- Messages containing "not found" or "missing" → `NotFoundError`
- Messages containing "unauthorized" or "permission" → `UnauthorizedError`
- Messages containing "timeout" or "time out" → `TimeoutError`
- Messages containing "network" or "connection" → `NetworkError`
- Other messages → `CustomError`

## When Not To Use It

If your project doesn't use custom error classes or you need to throw generic errors in certain cases, you can disable this rule or use the `allowedErrorNames` option to specify exceptions.