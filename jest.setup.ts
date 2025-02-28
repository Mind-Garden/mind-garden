/* eslint-disable @typescript-eslint/no-explicit-any */
import * as jwt from 'jsonwebtoken';
import SuperTest from 'supertest';

// Helper function to assert response status codes in tests
export const assertStatusCode = (
  res: SuperTest.Response,
  expectedStatus: number = 200,
): SuperTest.Response => {
  if (res.status === expectedStatus) {
    console.log(`Response body: ${JSON.stringify(res.body)}`);
    return res;
  }

  const reqData = JSON.parse(JSON.stringify(res)).req;
  throw new Error(`
  request-method  : ${JSON.stringify(reqData.method)} 
  request-url     : ${JSON.stringify(reqData.url)}
  request-data    : ${JSON.stringify(reqData.data)}
  request-headers : ${JSON.stringify(reqData.headers)}
  response-status  : ${JSON.stringify(res.status)}
  response-body    : ${JSON.stringify(res.body)}
  `);
};

// Create a user token for authentication in tests
function createUserToken(
  userId: number,
  secretKey: string,
  options: jwt.SignOptions,
) {
  return jwt.sign({ userId }, secretKey, options);
}

// Global setup before all tests
beforeAll(async () => {
  console.log('Jest setup: initializing test environment...');
});

// Global teardown after all tests
afterAll(async () => {
  console.log('Jest teardown: cleaning up...');
});

export { createUserToken };
