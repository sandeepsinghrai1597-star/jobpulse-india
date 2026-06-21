module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testPathIgnorePatterns: ['<rootDir>/e2e/', '<rootDir>/playwright-report/', '<rootDir>/test-results/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^server-only$': '<rootDir>/test/__mocks__/server-only.ts',
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
};
