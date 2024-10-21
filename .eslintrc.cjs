// @ts-check
/** @type {import('eslint').Linter.Config} */
module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/jsx-runtime',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript'
  ],
  ignorePatterns: [
    'build', // Ignore build directory
    '.eslintrc.cjs' // Ignore this file
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    ecmaFeatures: { jsx: true },
    sourceType: 'module'
  },
  plugins: ['react', '@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'react/react-in-jsx-scope': 'off',
    'prettier/prettier': 'warn',
    'import/newline-after-import': 'warn',
    'react/jsx-boolean-value': ['warn', 'never', { always: ['value'] }],
    'react/jsx-filename-extension': ['error', { 'allow': 'as-needed', 'extensions': ['.jsx', '.tsx'] }],
    'react/self-closing-comp': 'error',
    'import/no-unresolved': ['error', { 'ignore': ['^\\S+\\?(raw|data-url)$'] }],
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
}
