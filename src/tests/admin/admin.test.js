const request = require('supertest');
const app = require('../../api/server/index');
const setupTestDB = require('../utils/testDb');
const httpStatus = require('http-status');
const { adminTokens } = require('../fixtures/token.fixtures');
const {
  getProductBidHistoryByProductId,
  getProductById,
  getUserProductById,
  getAllPendingProducts,
} = require('../../api/services/product.service');
const { getUserById } = require('../../api/services/user.service');
const { OrderStatus, ProductBidStatus } = require('../../api/utils');

const apiPath = '/api/v1';

const AdminUrl = {
  LOGIN: apiPath + '/admin/login',
  USERS: apiPath + '/admin/users',
  MAKE_BID: apiPath + '/admin/products/bid',
  BLOCK_USER: apiPath + '/admin/users/block',
  PAY_USER: apiPath + '/admin/products/payout',
};

setupTestDB();

describe('Admin Routes', () => {
  describe('Check admin login /admin/login', () => {
    test('Test Login if credentials match', async () => {
      await request(app)
        .post(AdminUrl.LOGIN)
        .send({ email: 'admin@admin.com', password: 'Test@1234' })
        .expect(httpStatus.OK);
    });

    test('Test Login if credentials not match', async () => {
      await request(app)
        .post(AdminUrl.LOGIN)
        .send({ email: 'admin1@admin.com', password: 'Test@12345' })
        .expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('Get user listing /admin/users', () => {
    test('Fetch users listing', async () => {
      await request(app)
        .get(AdminUrl.USERS)
        .set('Authorization', `Bearer ${adminTokens.accessToken}`)
        .send()
        .expect(httpStatus.OK);
    });
  });

  describe('make bid /admin/products/bid', () => {
    test('Make first bid', async () => {
      const { results } = await getAllPendingProducts({}, {});
      const pendingProduct = results.filter(
        (product) => product.bidStatus === ProductBidStatus.CREATED && product.bidHistory.length === 0,
      );
      if (pendingProduct.length) {
        const bid = await getProductBidHistoryByProductId(pendingProduct[0]._id);
        if (!bid) {
          expect(bid).toBe(null);
        } else {
          await request(app)
            .post(AdminUrl.MAKE_BID)
            .set('Authorization', `Bearer ${adminTokens.accessToken}`)
            .send({ productId, offeredAmount: 1000 })
            .expect(httpStatus.OK);
        }
      }
    });
  });

  describe('Block user /admin/users/block', () => {
    test('Block user', async () => {
      const userId = '63fcf605a381eaf81ee9cbba';

      const user = await getUserById(userId);

      if (!user) {
        expect(user).toBe(null);
      } else {
        await request(app)
          .post(AdminUrl.BLOCK_USER)
          .set('Authorization', `Bearer ${adminTokens.accessToken}`)
          .send({ id: userId, isReported: false, reason: 'User is valid' })
          .expect(httpStatus.OK);
      }
    });
  });

  describe('Pay to user /products/payout', () => {
    test('Pay user api', async () => {
      const userId = '63fcf605a381eaf81ee9cbba';
      const productId = '6420345c41a1d0a69fa0a176';

      const user = await getUserById(userId);
      const product = await getUserProductById(productId);

      if (user && product && product.orderStatus === OrderStatus.PICKED_UP) {
        await request(app)
          .put(AdminUrl.PAY_USER)
          .set('Authorization', `Bearer ${adminTokens.accessToken}`)
          .send({ userId: userId, productId: productId })
          .expect(httpStatus.OK);
      }

      if (user && product && product.bidStatus !== ProductBidStatus.ACCEPTED) {
        await request(app)
          .put(AdminUrl.PAY_USER)
          .set('Authorization', `Bearer ${adminTokens.accessToken}`)
          .send({ userId: userId, productId: productId })
          .expect(httpStatus.NOT_FOUND);
      }

      if (user && product && product.orderStatus !== OrderStatus.PICKED_UP) {
        await request(app)
          .put(AdminUrl.PAY_USER)
          .set('Authorization', `Bearer ${adminTokens.accessToken}`)
          .send({ userId: userId, productId: productId })
          .expect(httpStatus.FORBIDDEN);
      }
    });
  });
});
