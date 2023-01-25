module.exports = {
  extends: ['@valora/eslint-config-typescript'],
  parserOptions: {
    project: './tsconfig.test.json',
  },
  rules: {
    'no-console': ['error', { allow: ['none'] }],
  },
}
