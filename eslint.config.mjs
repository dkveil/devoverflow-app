import antfu from '@antfu/eslint-config';
import nextPlugin from '@next/eslint-plugin-next';
import jestDom from 'eslint-plugin-jest-dom';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import playwright from 'eslint-plugin-playwright';
import testingLibrary from 'eslint-plugin-testing-library';

export default antfu({
  type: 'app',
  react: true,
  typescript: true,
  lessOpinionated: true,
  isInEditor: false,

  stylistic: {
    indent: 2,
    semi: true,
    quotes: 'single',
    jsx: 'single',
  },

  formatters: true,

  ignores: [
    'migrations/**/*',
    'next-env.d.ts',
  ],
}, jsxA11y.flatConfigs.recommended, {
  plugins: {
    '@next/next': nextPlugin,
  },
  rules: {
    ...nextPlugin.configs.recommended.rules,
    ...nextPlugin.configs['core-web-vitals'].rules,
  },
}, {
  files: [
    '**/*.test.ts?(x)',
  ],
  ...testingLibrary.configs['flat/react'],
  ...jestDom.configs['flat/recommended'],
}, {
  files: [
    '**/*.spec.ts',
    '**/*.e2e.ts',
  ],
  ...playwright.configs['flat/recommended'],
}, {
  rules: {
    'antfu/no-top-level-await': 'off', // Allow top-level await
    'style/brace-style': ['error', '1tbs'], // Use the default brace style
    'ts/consistent-type-definitions': ['error', 'type'], // Use `type` instead of `interface`
    'react/prefer-destructuring-assignment': 'off', // Vscode doesn't support automatically destructuring, it's a pain to add a new variable
    'node/prefer-global/process': 'off', // Allow using `process.env`
    'test/padding-around-all': 'error', // Add padding in test files
    'test/prefer-lowercase-title': 'off', // Allow using uppercase titles in test titles
    'ts/no-redeclare': 'off', // Allow variable redeclarations in TypeScript
    'no-console': ['warn'], // Warn when console statements are used
    'node/no-process-env': ['off'], // Disallow the use of process.env directly
    'perfectionist/sort-imports': ['error', {
      tsconfigRootDir: '.',
    }], // Sort imports according to TypeScript config
    'unicorn/filename-case': ['error', {
      case: 'kebabCase',
      ignore: ['README.md'],
    }], // Enforce kebab-case for filenames
    'style/quotes': ['error', 'single'], // Enforce single quotes
    'curly': 'off', // Disable curly rule
  },
});
