const request = require('supertest');
const app = require('../../api/server/index');
const setupTestDB = require('../utils/testDb');
const { faker } = require('@faker-js/faker/locale/de');
const httpStatus = require('http-status');

const apiPath = '/api/v1';

const AuthUrl = {
  LOGIN: apiPath + '/auth/login',
  SIGNUP: apiPath + '/auth/signup',
};

setupTestDB();

describe('Auth Routes', () => {
  describe('POST /auth/signup', () => {
    let newUser;

    beforeEach(() => {
      newUser = {
        name: faker.internet.userName(),
        email: faker.internet.email().toLowerCase(),
        mobile: faker.datatype.number({
          min: 6000000000,
          max: 9999999999,
        }),
        identityProofType: 1,
        identityProofNumber: 'string',
        identityProofImageUri: 'https://anynewurl',
        addressLine1: 'A tower- 101',
        landmark: 'panOasis',
        city: 'Noida',
        state: 'UP',
        zipCode: '201301',
        country: 'India',
        bankAccountNumber: '765432123456789',
        ifscCode: 'HDFC0000053',
        accountHolderName: 'Gaurav Kumar',
      };
    });

    test('Should return 400 if email is not valid', async () => {
      newUser.email = 'invalidEmail';
      await request(app).post(AuthUrl.SIGNUP).send(newUser).expect(httpStatus.BAD_REQUEST);
    });

    test('Check if mobile exists', async () => {
      newUser.mobile = '5555555555';
      await request(app).post(AuthUrl.SIGNUP).send(newUser).expect(httpStatus.CONFLICT);
    });
  });

  describe('POST /auth/login', () => {
    test('Test Login if mobile found', async () => {
      await request(app)
        .post(apiPath + '/auth/login')
        .send({ mobile: '5555555555' })
        .expect(httpStatus.OK);
    });

    test('Test Login if mobile not found', async () => {
      await request(app)
        .post(apiPath + '/auth/login')
        .send({ mobile: '5555555553' })
        .expect(httpStatus.NOT_FOUND);
    });
  });
});
