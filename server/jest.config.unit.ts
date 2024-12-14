export default {
  verbose: true,
  preset: 'ts-jest',
  collectCoverageFrom: ['src/**'],
  coverageDirectory: 'coverage/unit',
  coverageReporters: ['lcov', 'text'],
  setupFilesAfterEnv: ['jest-extended/all'],
  testMatch: ['**/tests/unit/**/?(*.)@(spec|test).[tj]s?(x)'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        isolatedModules: true,
      },
    ],
  },
};