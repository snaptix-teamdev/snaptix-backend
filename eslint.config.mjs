// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import { readdirSync } from 'fs';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const MICROSERVICES = readdirSync(new URL('./apps', import.meta.url), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

const CROSS_SERVICE_MESSAGE =
  'Direct imports between microservices are forbidden. Use @snaptix/contracts, @snaptix/common, or @snaptix/core instead.';

const crossServiceRules = MICROSERVICES.map((app) => ({
  files: [`apps/${app}/**/*.ts`],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: MICROSERVICES.filter((other) => other !== app).map((other) => ({
          group: [`**/${other}`, `**/${other}/**`],
          message: CROSS_SERVICE_MESSAGE,
        })),
      },
    ],
  },
}));

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      ecmaVersion: 5,
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
    },
  },
  {
    files: ['libs/**/*.ts'],
    rules: {
      '@typescript-eslint/no-namespace': 'off',
    },
  },
  {
    ignores: ['node_modules/'],
  },
  ...crossServiceRules,
  {
    files: ['libs/contracts/src/constants/errors/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@snaptix/contracts',
              message:
                'Import directly from the source file (e.g. @snaptix/contracts/constants/errors/common.errors) to avoid circular dependencies through barrel exports.',
            },
            {
              name: '@snaptix/contracts/constants',
              message:
                'Import directly from the source file (e.g. @snaptix/contracts/constants/errors/common.errors) to avoid circular dependencies through barrel exports.',
            },
          ],
        },
      ],
    },
  },
);
