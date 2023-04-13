const request = require('supertest');
const app = require('../../src/api/server/index');
const setupTestDB = require('../utils/testDb');
const httpStatus = require('http-status');
const { adminTokens } = require('../fixtures/token.fixtures');
const {
  getProductBidHistoryByProductId,
  getUserProductById,
  getAllPendingProducts,
  getCategoriesByQuery,
  getProductsByQuery,
} = require('../../src/api/services/product.service');
const { getUserById } = require('../../src/api/services/user.service');
const { OrderStatus, ProductBidStatus } = require('../../src/api/utils');

const apiPath = '/api/v1';

const AdminUrl = {
  LOGIN: apiPath + '/admin/login',
  USERS: apiPath + '/admin/users',
  MAKE_BID: apiPath + '/admin/products/bid',
  BLOCK_USER: apiPath + '/admin/users/block',
  PAY_USER: apiPath + '/admin/products/payout',
  CATEGORY: apiPath + '/admin/products/category',
  UPDATE_PICKUP_DATE: apiPath + '/admin/products/picked-up/date',
  UPDATE_PICKUP: apiPath + '/admin/products/picked-up',
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
          .expect(httpStatus.BAD_REQUEST);
      }
    });
  });

  describe('Add Category /admin/products/category', () => {
    let newCategory;

    beforeEach(() => {
      newCategory = {
        name: 'TestCategory',
        isActive: false,
      };
    });

    test('Add test Category', async () => {
      await request(app)
        .post(AdminUrl.CATEGORY)
        .set('Authorization', `Bearer ${adminTokens.accessToken}`)
        .send(newCategory)
        .expect(httpStatus.OK);
    });
  });

  describe('Delete Category /admin/products/category', () => {
    test('Delete 400 error if category is not valid', async () => {
      await request(app)
        .delete(AdminUrl.CATEGORY)
        .set('Authorization', `Bearer ${adminTokens.accessToken}`)
        .send({ categoryId: '63fcf605a381eaf81ee9cbba' })
        .expect(httpStatus.BAD_REQUEST);
    });

    test('Delete test Category if category is valid', async () => {
      const categories = await getCategoriesByQuery({
        isActive: false,
      });

      if (categories.length) {
        await request(app)
          .delete(AdminUrl.CATEGORY)
          .set('Authorization', `Bearer ${adminTokens.accessToken}`)
          .send({ categoryId: categories[0]._id.toString() })
          .expect(httpStatus.OK);
      }
    });
  });

  // describe('make bid /admin/products/bid', () => {
  //   test('Make first bid', async () => {
  //     const { results } = await getAllPendingProducts({}, {});
  //     console.log('results =', results);
  //     const pendingProduct = results.filter(
  //       (product) =>
  //         product.bidStatus === ProductBidStatus.CREATED && (!product.bidHistory || product.bidHistory.length === 0),
  //     );
  //     console.log('pendingProduct => ', pendingProduct);
  //     if (pendingProduct.length) {
  //       await request(app)
  //         .post(AdminUrl.MAKE_BID)
  //         .set('Authorization', `Bearer ${adminTokens.accessToken}`)
  //         .send({ productId: pendingProduct[0]._id.toString(), offeredAmount: 1000 })
  //         .expect(httpStatus.OK);
  //     }
  //   });
  // });

  describe('Change Pick-up date status after bid accepted', () => {
    test('Update Pickup 404 error if product is not found', async () => {
      await request(app)
        .put(AdminUrl.UPDATE_PICKUP_DATE)
        .set('Authorization', `Bearer ${adminTokens.accessToken}`)
        .send({ productId: '63fcf605a381eaf81ee9cbba', estimatedPickedUpDate: '20 Nov 2022' })
        .expect(httpStatus.NOT_FOUND);
    });

    test('Return 400 error if product bid is pending', async () => {
      const { results } = await getAllPendingProducts({}, {});
      const pendingProduct = results.filter((product) => product.bidStatus === ProductBidStatus.CREATED);

      if (pendingProduct.length) {
        await request(app)
          .put(AdminUrl.UPDATE_PICKUP_DATE)
          .set('Authorization', `Bearer ${adminTokens.accessToken}`)
          .send({ productId: pendingProduct[0]._id.toString(), estimatedPickedUpDate: '20 Nov 2022' })
          .expect(httpStatus.BAD_REQUEST);
      }
    });

    test('Return 400 error if the product is already picked-up', async () => {
      const products = await getProductsByQuery({
        orderStatus: { $in: [OrderStatus.PICKED_UP, OrderStatus.PAID] },
      });

      if (products.length) {
        await request(app)
          .put(AdminUrl.UPDATE_PICKUP_DATE)
          .set('Authorization', `Bearer ${adminTokens.accessToken}`)
          .send({ productId: products[0]._id.toString(), estimatedPickedUpDate: '20 Nov 2022' })
          .expect(httpStatus.BAD_REQUEST);
      }
    });

    test('Update pick-up date 200 if the data is valid', async () => {
      const products = await getProductsByQuery({
        bidStatus: ProductBidStatus.ACCEPTED,
        orderStatus: { $in: [OrderStatus.PENDING, OrderStatus.PICKED_UP_DATE_ESTIMATED] },
      });

      if (products.length) {
        await request(app)
          .put(AdminUrl.UPDATE_PICKUP_DATE)
          .set('Authorization', `Bearer ${adminTokens.accessToken}`)
          .send({ productId: products[0]._id.toString(), estimatedPickedUpDate: '20 Nov 2022' })
          .expect(httpStatus.OK);
      }
    });
  });

  describe('Update Pickup status ', () => {
    test('Return 404 error if product is not found', async () => {
      await request(app)
        .put(AdminUrl.UPDATE_PICKUP)
        .set('Authorization', `Bearer ${adminTokens.accessToken}`)
        .send({ productId: '63fcf605a381eaf81ee9cbba' })
        .expect(httpStatus.NOT_FOUND);
    });

    test('Return 400 error if product bid is pending', async () => {
      const { results } = await getAllPendingProducts({}, {});
      const pendingProduct = results.filter((product) => product.bidStatus === ProductBidStatus.CREATED);

      if (pendingProduct.length) {
        await request(app)
          .put(AdminUrl.UPDATE_PICKUP)
          .set('Authorization', `Bearer ${adminTokens.accessToken}`)
          .send({ productId: pendingProduct[0]._id.toString() })
          .expect(httpStatus.BAD_REQUEST);
      }
    });

    test('Return 400 error if the product is already picked-up', async () => {
      const products = await getProductsByQuery({
        bidStatus: ProductBidStatus.ACCEPTED,
        orderStatus: { $ne: OrderStatus.PICKED_UP_DATE_ESTIMATED },
      });

      if (products.length) {
        await request(app)
          .put(AdminUrl.UPDATE_PICKUP)
          .set('Authorization', `Bearer ${adminTokens.accessToken}`)
          .send({ productId: products[0]._id.toString() })
          .expect(httpStatus.BAD_REQUEST);
      }
    });

    test('Update Order pick-up status 200 if the data is valid', async () => {
      const products = await getProductsByQuery({
        bidStatus: ProductBidStatus.ACCEPTED,
        orderStatus: { $eq: OrderStatus.PICKED_UP_DATE_ESTIMATED },
      });

      if (products.length) {
        await request(app)
          .put(AdminUrl.UPDATE_PICKUP)
          .set('Authorization', `Bearer ${adminTokens.accessToken}`)
          .send({ productId: products[0]._id.toString() })
          .expect(httpStatus.OK);
      }
    });
  });
});
