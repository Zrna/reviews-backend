module.exports = {
  parserOptions: {
    sourceType: 'module',
  },
  env: { es6: true, node: true },
  extends: ['plugin:prettier/recommended', 'eslint:recommended'],
  plugins: ['simple-import-sort'],
  rules: {
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'no-var': 'error',
    quotes: [
      2,
      'single',
      {
        avoidEscape: true,
        allowTemplateLiterals: false,
      },
    ],
    'no-multi-spaces': 'error',
    eqeqeq: ['error', 'always'],
    'rest-spread-spacing': ['error', 'never'],
    'prefer-const': 'error',
    'spaced-comment': ['error', 'always'],
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
      },
    ],
  },
};
