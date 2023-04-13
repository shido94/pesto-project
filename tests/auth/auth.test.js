const request = require('supertest');
const app = require('../../src/api/server/index');
const setupTestDB = require('../utils/testDb');
const { faker } = require('@faker-js/faker/locale/de');
const httpStatus = require('http-status');
const { getUserByEmailOrMobile } = require('../../src/api/services/user.service');

const apiPath = '/api/v1';

const AuthUrl = {
  LOGIN: apiPath + '/auth/login',
  SIGNUP: apiPath + '/auth/signup',
  FORGOT_PASSWORD: apiPath + '/auth/forgot-password',
  RESET_PASSWORD: apiPath + '/auth/reset-password',
  RESEND_OTP: apiPath + '/auth/resend-otp',
};

setupTestDB();

describe('Auth Routes', () => {
  describe('POST /auth/signup', () => {
    let newUser;

    beforeEach(() => {
      newUser = {
        name: 'TestRupeshTesting',
        email: faker.internet.email().toLowerCase(),
        mobile: `${faker.datatype.number({
          min: 6000000000,
          max: 9999999999,
        })}`,
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
        password: 'Test@1234',
        accountHolderName: 'Gaurav Kumar',
      };
    });

    test('Add user if data is valid', async () => {
      const user = await getUserByEmailOrMobile(newUser.email, newUser.mobile);

      if (!user) {
        await request(app).post(AuthUrl.SIGNUP).send(newUser).expect(httpStatus.OK);
      } else {
        expect(user).toBe(null);
      }
    });

    test('Should return 400 if email is not valid', async () => {
      newUser.email = 'invalidEmail';
      await request(app).post(AuthUrl.SIGNUP).send(newUser).expect(httpStatus.BAD_REQUEST);
    });

    test('Check if mobile exists', async () => {
      newUser.mobile = '5555555555';
      await request(app).post(AuthUrl.SIGNUP).send(newUser).expect(httpStatus.BAD_GATEWAY);
    });
  });

  describe('Check User login /auth/login', () => {
    test('Test Login if mobile found', async () => {
      await request(app)
        .post(AuthUrl.LOGIN)
        .send({ mobile: '5555555555', password: 'Test@1234' })
        .expect(httpStatus.OK);
    });

    test('Test Login if mobile not found', async () => {
      await request(app)
        .post(AuthUrl.LOGIN)
        .send({ mobile: '5555555553', password: 'Test@1234' })
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('Forgot Password /auth/login', () => {
    test('Test Login if mobile not found', async () => {
      await request(app).post(AuthUrl.FORGOT_PASSWORD).send({ mobile: '5555565555' }).expect(httpStatus.NOT_FOUND);
    });

    test('Forgot password if every thing is okay', async () => {
      await request(app).post(AuthUrl.FORGOT_PASSWORD).send({ mobile: '5555555555' }).expect(httpStatus.OK);
    });

    test('Reset Password should return 400 if otp is not valid', async () => {
      await request(app)
        .post(AuthUrl.RESET_PASSWORD)
        .send({ userId: '63fcf605a381eaf81ee9cbba', otp: '12345', password: 'Test@1234' })
        .expect(httpStatus.BAD_REQUEST);
    });

    test('Resend otp 404 error if user not found', async () => {
      await request(app)
        .post(AuthUrl.RESEND_OTP)
        .send({ userId: '63fcf605a381eaf81ee9cbbb' })
        .expect(httpStatus.NOT_FOUND);
    });

    test('Resend otp if valid request', async () => {
      await request(app).post(AuthUrl.RESEND_OTP).send({ userId: '63fcf605a381eaf81ee9cbba' }).expect(httpStatus.OK);
    });

    test('Reset Password if token is valid', async () => {
      await request(app)
        .post(AuthUrl.RESET_PASSWORD)
        .send({ userId: '63fcf605a381eaf81ee9cbba', otp: '1234', password: 'Test@1234' })
        .expect(httpStatus.OK);
    });

    test('Resend otp 400 error, if password has been already updated', async () => {
      await request(app)
        .post(AuthUrl.RESEND_OTP)
        .send({ userId: '63fcf605a381eaf81ee9cbba' })
        .expect(httpStatus.BAD_REQUEST);
    });
  });
});
