import recommendedIncremental from 'eslint-config-agent/recommended-incremental'

export default [
  ...recommendedIncremental,
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**'],
  },
]
