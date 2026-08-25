import { fileURLToPath } from 'node:url';

import { baseConfig } from '@chapchap/eslint-config/base';
import pluginQuery from '@tanstack/eslint-plugin-query';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import boundaries from 'eslint-plugin-boundaries';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import storybook from 'eslint-plugin-storybook';
import { defineConfig } from 'eslint/config';
import globals from 'globals';

const tsconfigPath = fileURLToPath(new URL('./tsconfig.app.json', import.meta.url));

export default defineConfig([
  {
    ignores: [
      'src/features/*/apis/clients.ts',
      'src/features/*/apis/queryKeys.ts',
      'src/features/*/apis/queries.ts',
      'src/features/*/apis/mutations.ts',
      'src/features/*/apis/dto.ts',
    ],
  },
  ...baseConfig,
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
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
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          project: tsconfigPath,
        },
      },
      'import-x/resolver-next': [
        createTypeScriptImportResolver({
          project: tsconfigPath,
        }),
      ],
      'boundaries/root-path': import.meta.dirname,
      'boundaries/include': ['src/**/*.{ts,tsx}'],
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app', partialMatch: false },
        { type: 'pages', pattern: 'src/pages', partialMatch: false },
        {
          type: 'features',
          pattern: 'src/features/*',
          capture: ['featureName'],
          partialMatch: false,
        },
        { type: 'shared', pattern: 'src/shared', partialMatch: false },
      ],
    },
    rules: {
      ...boundaries.configs.recommended.rules,
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'error',
      'react/jsx-key': 'error',
      'react/self-closing-comp': 'warn',
      'react/jsx-pascal-case': 'error',
      'react/prop-types': 'off',
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
]);
