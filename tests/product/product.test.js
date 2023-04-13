const request = require('supertest');
const app = require('../../src/api/server/index');
const setupTestDB = require('../utils/testDb');
const httpStatus = require('http-status');
const { adminTokens, userTokens } = require('../fixtures/token.fixtures');
const { getProductDetailsById } = require('../../src/api/services/product.service');

const apiPath = '/api/v1';

const ProductUrl = {
  PENDING_REQUEST: apiPath + '/products/pending',
  GET_PRODUCTS: apiPath + '/products',
  ADD_PRODUCTS: apiPath + '/products',
  EDIT_PRODUCTS: apiPath + '/products',
  GET_CATEGORIES: apiPath + '/products/categories',
};

setupTestDB();

describe('Product Routes', () => {
  describe('Fetch pending products /products/pending', () => {
    test('fetch pending products', async () => {
      await request(app)
        .get(ProductUrl.PENDING_REQUEST)
        .set('Authorization', `Bearer ${adminTokens.accessToken}`)
        .send()
        .expect(httpStatus.OK);
    });
  });

  describe('Fetch all products /products', () => {
    test('fetch pending products', async () => {
      await request(app)
        .get(ProductUrl.GET_PRODUCTS)
        .set('Authorization', `Bearer ${adminTokens.accessToken}`)
        .query({ bidStatus: 1, orderStatus: 1 })
        .expect(httpStatus.OK);
    });
  });

  describe('Add product /products', () => {
    let newProduct;

    beforeEach(() => {
      newProduct = {
        categoryId: '641fe3d2ef2615d31e0fc236',
        type: 'Bed',
        title: 'selling bed',
        description: 'Selling a new bid',
        brand: 'Samsung',
        purchasedYear: 'string',
        pickupAddress: 'Noida',
        images: [
          {
            uri: 'https://cdn.shopify.com/s/files/1/0085/5513/5039/products/01_2f252fa4-d6e1-4e43-8dd8-54af32d2581d_800x.jpg?v=1581528005',
            isDefault: true,
          },
        ],
      };
    });

    // test('Should return 200 if data is valid', async () => {
    //   await request(app)
    //     .post(ProductUrl.ADD_PRODUCTS)
    //     .set('Authorization', `Bearer ${userTokens.accessToken}`)
    //     .send(newProduct)
    //     .expect(httpStatus.OK);
    // });

    test('Should return 400 if category is not valid', async () => {
      newProduct.categoryId = 'InvalidCategory';
      await request(app)
        .post(ProductUrl.ADD_PRODUCTS)
        .set('Authorization', `Bearer ${userTokens.accessToken}`)
        .send(newProduct)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('Edit product /products', () => {
    let newProduct;

    beforeEach(() => {
      newProduct = {
        productId: '641ff01975d438bb000841d6',
        categoryId: '641fe3d2ef2615d31e0fc236',
        type: 'Bed',
        title: 'selling bed',
        description: 'Selling a new bid',
        brand: 'Samsung',
        purchasedYear: 'string',
        pickupAddress: 'Noida',
        images: [
          {
            uri: 'https://cdn.shopify.com/s/files/1/0085/5513/5039/products/01_2f252fa4-d6e1-4e43-8dd8-54af32d2581d_800x.jpg?v=1581528005',
            isDefault: true,
          },
        ],
      };
    });

    test('Should return 400 if category is not valid', async () => {
      newProduct.categoryId = 'InvalidCategory';
      await request(app)
        .put(ProductUrl.ADD_PRODUCTS)
        .set('Authorization', `Bearer ${userTokens.accessToken}`)
        .send(newProduct)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('Should return 400 if category not found', async () => {
      newProduct.categoryId = '641fe3d2ef2615d31e0fc266';
      await request(app)
        .put(ProductUrl.ADD_PRODUCTS)
        .set('Authorization', `Bearer ${userTokens.accessToken}`)
        .send(newProduct)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('Should return 200 data is valid', async () => {
      const product = await getProductDetailsById(newProduct.productId);

      if (product && !product.bidHistory.length) {
        await request(app)
          .put(ProductUrl.ADD_PRODUCTS)
          .set('Authorization', `Bearer ${userTokens.accessToken}`)
          .send(newProduct)
          .expect(httpStatus.OK);
      }
    });
  });

  describe('Fetch categories /products/categories', () => {
    test('fetch all categories', async () => {
      await request(app)
        .get(ProductUrl.GET_CATEGORIES)
        .set('Authorization', `Bearer ${adminTokens.accessToken}`)
        .send()
        .expect(httpStatus.OK);
    });
  });
});
