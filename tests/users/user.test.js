const request = require('supertest');
const app = require('../../src/api/server/index');
const setupTestDB = require('../utils/testDb');
const httpStatus = require('http-status');
const { faker } = require('@faker-js/faker/locale/de');
const { adminTokens, userTokens } = require('../fixtures/token.fixtures');
const { getNotificationById } = require('../../src/api/services/notification.service');
const { getUserByEmailOrMobile } = require('../../src/api/services/user.service');
const apiPath = '/api/v1';

const UserUrl = {
  USERS_LISTING: apiPath + '/users',
  PRODUCTS: apiPath + '/users/products',
  PROFILE: apiPath + '/users/profile',
  NOTIFICATIONS: apiPath + '/users/notifications',
  UNREAD_NOTIFICATION: apiPath + '/users/notifications/unread/count',
  UPDATE_FUNDS: apiPath + '/users/fund',
  UPDATE_PROFILE: apiPath + '/users/profile',
};

setupTestDB();

describe('User Routes', () => {
  describe('Get listing /users', () => {
    test('Fetch user listing', async () => {
      await request(app)
        .get(UserUrl.USERS_LISTING)
        .set('Authorization', `Bearer ${adminTokens.accessToken}`)
        .send()
        .expect(httpStatus.OK);
    });
  });

  describe('Get User profile /users/profile', () => {
    test('Fetching user profile', async () => {
      await request(app)
        .get(UserUrl.PROFILE)
        .set('Authorization', `Bearer ${userTokens.accessToken}`)
        .send()
        .expect(httpStatus.OK);
    });
  });

  describe('Get user products /users/products', () => {
    test('Fetching user products', async () => {
      await request(app)
        .get(UserUrl.PRODUCTS)
        .set('Authorization', `Bearer ${userTokens.accessToken}`)
        .send()
        .expect(httpStatus.OK);
    });
  });

  describe('Get user notifications /users/notifications', () => {
    test('Fetching user notifications', async () => {
      await request(app)
        .get(UserUrl.NOTIFICATIONS)
        .set('Authorization', `Bearer ${userTokens.accessToken}`)
        .send()
        .expect(httpStatus.OK);
    });
  });

  describe('Get unread notifications count /users/notifications/unread/count', () => {
    test('Fetching unread notifications count', async () => {
      await request(app)
        .get(UserUrl.UNREAD_NOTIFICATION)
        .set('Authorization', `Bearer ${userTokens.accessToken}`)
        .send()
        .expect(httpStatus.OK);
    });
  });

  describe('Delete notifications /users/notifications', () => {
    test('Delete user notifications', async () => {
      await request(app)
        .delete(UserUrl.NOTIFICATIONS)
        .set('Authorization', `Bearer ${userTokens.accessToken}`)
        .send()
        .expect(httpStatus.OK);
    });
  });

  describe('Delete notifications by id /users/notifications/:id', () => {
    let id = '63fcf605a381eaf81ee9cbba';

    test('Delete single notifications by id', async () => {
      let notification = await getNotificationById(id);
      if (!notification) {
        expect(notification).toBe(null);
      } else {
        await request(app)
          .delete(UserUrl.NOTIFICATIONS + '/' + id)
          .set('Authorization', `Bearer ${userTokens.accessToken}`)
          .send()
          .expect(httpStatus.OK);
      }
    });
  });

  describe('Update user funds /users/fund', () => {
    let accountFund;
    let upiFund;

    beforeEach(() => {
      accountFund = {
        bankAccountNumber: '765432123456789',
        ifscCode: 'HDFC0000053',
        accountHolderName: 'Gaurav Kumar',
      };

      upiFund = { UPI: 'gaurav.kumar@exampleupi' };
    });

    test('Update user fund if valid account number', async () => {
      await request(app)
        .put(UserUrl.UPDATE_FUNDS)
        .set('Authorization', `Bearer ${userTokens.accessToken}`)
        .send(accountFund)
        .expect(httpStatus.OK);
    });

    test('Update user fund if valid UPI', async () => {
      await request(app)
        .put(UserUrl.UPDATE_FUNDS)
        .set('Authorization', `Bearer ${userTokens.accessToken}`)
        .send(upiFund)
        .expect(httpStatus.OK);
    });
  });

  describe('Get user details /users/:id', () => {
    let id = '63fcf605a381eaf81ee9cbba';
    test('Get user details by id', async () => {
      await request(app)
        .get(UserUrl.USERS_LISTING + '/' + id)
        .set('Authorization', `Bearer ${userTokens.accessToken}`)
        .expect(httpStatus.OK);
    });

    test('Give error if id is not valid', async () => {
      id = '63fcf605a381eaf81ee9cbbb';
      await request(app)
        .get(UserUrl.USERS_LISTING + '/' + id)
        .set('Authorization', `Bearer ${userTokens.accessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('Update user profile /users/profile', () => {
    let profile;

    beforeEach(() => {
      profile = {
        name: faker.internet.userName(),
        email: faker.internet.email().toLowerCase(),
        identityProofType: 1,
        identityProofNumber: 'string',
        identityProofImageUri: 'https://anynewurl',
        addressLine1: 'A tower- 101',
        landmark: 'panOasis',
        city: 'Noida',
        state: 'UP',
        zipCode: '201301',
        country: 'India',
      };
    });

    test('Add user if data is valid', async () => {
      const user = await getUserByEmailOrMobile(profile.email);

      if (!user) {
        await request(app)
          .put(UserUrl.UPDATE_PROFILE)
          .set('Authorization', `Bearer ${userTokens.accessToken}`)
          .send(profile)
          .expect(httpStatus.OK);
      } else {
        await request(app).put(UserUrl.UPDATE_PROFILE).send(profile).expect(httpStatus.BAD_REQUEST);
      }
    });

    test('Should return 400 if email is not valid', async () => {
      profile.email = 'invalidEmail';
      await request(app)
        .put(UserUrl.UPDATE_PROFILE)
        .set('Authorization', `Bearer ${userTokens.accessToken}`)
        .send(profile)
        .expect(httpStatus.BAD_REQUEST);
    });
  });
});
