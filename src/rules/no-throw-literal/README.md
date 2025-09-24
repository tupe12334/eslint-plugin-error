# error/no-throw-literal

Disallow throwing literals as exceptions.

## Rule Details

This rule disallows throwing literals, primitives, or plain objects as exceptions. Only error objects should be thrown to ensure proper error handling and stack trace information.

❌ Examples of **incorrect** code for this rule:

```js
throw 'error message';
throw 404;
throw true;
throw undefined;
throw `template literal error`;
throw { message: 'error', code: 404 };
throw -1;
```

✅ Examples of **correct** code for this rule:

```js
throw new Error('error message');
throw new CustomError('Something went wrong');
throw new ValidationError('Invalid input');
throw errorVariable; // assuming errorVariable is an Error instance
```

## Options

This rule accepts an options object with the following properties:

- `allowThrowingObjects` (boolean): Allow throwing plain objects. Default: `false`
- `allowThrowingUnknown` (boolean): Allow throwing unknown variables. Default: `false`

### allowThrowingObjects

Examples of **correct** code for this rule with the `{ "allowThrowingObjects": true }` option:

```js
throw { message: 'error', code: 404 }; // Plain objects are allowed
```

### allowThrowingUnknown

Examples of **correct** code for this rule with the `{ "allowThrowingUnknown": true }` option:

```js
throw someUnknownVariable; // Unknown variables are allowed
```

## Auto-fixing

This rule provides automatic fixes for literal values:

- `throw 'message'` → `throw new Error('message')`
- `throw 42` → `throw new Error(42)`
- `throw true` → `throw new Error(true)`
- `throw \`template\`` → `throw new Error(\`template\`)`
- `throw -1` → `throw new Error(-1)`

## Why This Rule Exists

Throwing non-Error values can lead to:

- Poor debugging experience due to missing stack traces
- Inconsistent error handling patterns
- Difficulty in error identification and categorization
- Problems with error monitoring tools that expect Error objects

## When Not To Use It

If your codebase:
- Has established patterns of throwing non-Error values
- Uses libraries that expect specific non-Error thrown values
- Has performance constraints where Error object creation is expensive

You can disable this rule or configure the options to allow specific patterns.