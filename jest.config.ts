module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '.*\\.spec\\.ts$',
  moduleFileExtensions: ['ts', 'json', 'js'],
  roots: ['<rootDir>/src'],
  moduleDirectories: ['node_modules', 'src'], // baseUrl ./src 를 설정
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1', // 경로 별칭을 처리
    '^dist/(.*)$': '<rootDir>/dist/$1',
  },
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
};
