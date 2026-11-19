// Jest config for mutation testing (Stryker): the regular config from package.json,
// but ts-jest transpiles each file on its own (isolatedModules) instead of type-checking the whole repo.
// Every Stryker worker otherwise holds a full TypeScript program in memory (~4 GB each).
// Types are still checked by `pnpm typecheck` in verify.
const { jest } = require('./package.json');

module.exports = {
  ...jest,
  rootDir: __dirname,
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      { tsconfig: '<rootDir>/tsconfig.stryker.json' },
    ],
  },
};
