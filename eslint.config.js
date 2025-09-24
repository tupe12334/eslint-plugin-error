export default [
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        exports: 'writable',
        global: 'readonly',
        module: 'writable',
        require: 'readonly',
      },
    },
    rules: {
      'prefer-const': 'error',
      'no-unused-vars': 'error',
      'no-undef': 'error',
    },
    files: ['src/**/*.js'],
  },
];