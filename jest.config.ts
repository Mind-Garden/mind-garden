export default {
  testEnvironment: "node",
  preset: "ts-jest",
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { isolatedModules: true }], // Transforms TypeScript files
  },
  collectCoverage: true,
  coverageReporters: ["json", "lcov", "text", "clover"],
}