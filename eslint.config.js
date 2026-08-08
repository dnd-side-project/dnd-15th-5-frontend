// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import { fileURLToPath } from 'node:url';

import storybook from 'eslint-plugin-storybook';

import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import react from 'eslint-plugin-react';
import importX from 'eslint-plugin-import-x';
import unusedImports from 'eslint-plugin-unused-imports';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import tseslint from 'typescript-eslint';
import pluginQuery from '@tanstack/eslint-plugin-query';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import boundaries from 'eslint-plugin-boundaries';
import { defineConfig, globalIgnores } from 'eslint/config';

const webTsconfigPath = fileURLToPath(new URL('./apps/web/tsconfig.app.json', import.meta.url));

export default defineConfig([
  globalIgnores(['**/dist/**', '**/storybook-static/**', '**/.turbo/**']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      ...pluginQuery.configs['flat/recommended'],
    ],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: {
      boundaries,
      react,
      'import-x': importX,
      'unused-imports': unusedImports,
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          project: webTsconfigPath,
        },
      },
      'import-x/resolver-next': [
        createTypeScriptImportResolver({
          project: webTsconfigPath,
        }),
      ],
      'boundaries/root-path': import.meta.dirname,
      'boundaries/include': ['apps/web/src/**/*.{ts,tsx}'],
      'boundaries/elements': [
        { type: 'app', pattern: 'apps/web/src/app', partialMatch: false },
        { type: 'pages', pattern: 'apps/web/src/pages', partialMatch: false },
        {
          type: 'features',
          pattern: 'apps/web/src/features/*',
          capture: ['featureName'],
          partialMatch: false,
        },
        { type: 'shared', pattern: 'apps/web/src/shared', partialMatch: false },
      ],
    },
    rules: {
      ...boundaries.configs.recommended.rules,
      'no-var': 'error',
      'no-console': 'warn',
      'no-debugger': 'warn',
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'error',
      'react/jsx-key': 'error',
      'react/self-closing-comp': 'warn',
      'react/jsx-pascal-case': 'error',
      'react/prop-types': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      'import-x/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'type'],
          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal',
              position: 'before',
            },
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            {
              from: { element: { type: 'app' } },
              allow: {
                to: {
                  element: {
                    types: { anyOf: ['app', 'pages', 'features', 'shared'] },
                  },
                },
              },
            },
            {
              from: { element: { type: 'pages' } },
              allow: {
                to: {
                  element: {
                    types: { anyOf: ['pages', 'features', 'shared'] },
                  },
                },
              },
            },
            {
              from: { element: { type: 'features' } },
              allow: {
                to: [
                  {
                    element: {
                      type: 'features',
                      captured: {
                        featureName: '{{ from.element.captured.featureName }}',
                      },
                    },
                  },
                  { element: { type: 'shared' } },
                ],
              },
            },
            {
              from: { element: { type: 'shared' } },
              allow: {
                to: { element: { type: 'shared' } },
              },
            },
          ],
        },
      ],
    },
  },
  ...storybook.configs['flat/recommended'],
  eslintConfigPrettier,
  {
    rules: {
      curly: 'error',
    },
  },
]);
