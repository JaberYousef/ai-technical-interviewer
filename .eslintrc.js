module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/prefer-const': 'error',
    'no-console': 'off', // Allow console.log in development
    'prefer-const': 'error',
    'no-var': 'error',
  },
  overrides: [
    {
      files: ['**/*.test.{ts,tsx,js,jsx}', '**/*.spec.{ts,tsx,js,jsx}'],
      env: {
        jest: true,
        vitest: true,
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
    {
      files: ['apps/web/**/*'],
      extends: [
        'eslint:recommended',
        '@typescript-eslint/recommended',
        'prettier',
      ],
      env: {
        browser: true,
        node: false,
      },
    },
    {
      files: ['apps/extension/**/*'],
      extends: [
        'eslint:recommended',
        '@typescript-eslint/recommended',
        'prettier',
      ],
      env: {
        webextensions: true,
        browser: true,
        node: false,
      },
      globals: {
        chrome: 'readonly',
      },
    },
  ],
  ignorePatterns: [
    'dist/',
    'node_modules/',
    '.next/',
    'coverage/',
    'test-results/',
    'playwright-report/',
  ],
};
