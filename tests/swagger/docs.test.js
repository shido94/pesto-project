const request = require('supertest');
const app = require('../../src/api/server/index');
const httpStatus = require('http-status');
const { environment } = require('../../src/api/config');

describe('Swagger Routes', () => {
  describe('POST /v1/docs', () => {
    test('Should return 400 when running in production', async () => {
      environment.ENV = 'production';
      await request(app).get('/v1/docs').send().expect(httpStatus.NOT_FOUND);
      environment.ENV = process.env.NODE_ENV;
    });
  });
});
