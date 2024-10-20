module.exports = {
  env: {
      browser: true,
      es2021: true,
  },
  extends: [
      'eslint:recommended',
      'plugin:angularjs/di'
  ],
  parserOptions: {
      ecmaVersion: 12,
  },
  rules: {
      // Customize your rules here
      'no-unused-vars': 'warn',
      'quotes': ['error', 'single'],
      'indent': ['error', 2],
  },
  plugins: [
      'angularjs'
  ],
};