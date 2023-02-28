const express = require('express');
const router = express.Router();
const { productController } = require('../controllers');
const { validate, auth } = require('../middleware');
const { UserRole } = require('../utils');
const { userValidation } = require('../validations');

/**
 * @swagger
 *  /products/:
 *   get:
 *     tags: [Products]
 *     security:
 *          - Bearer: []
 *     description: Get Products Listing
 *     produces:
 *       - application/json
 *     parameters:
 *     - name: category
 *       in: query
 *     - name: minPrice
 *       in: query
 *     - name: maxPrice
 *       in: query
 *     - name: limit
 *       in: query
 *     responses:
 *       200:
 *         description: Return Message
 */
router.get('/', auth(UserRole.USER), productController.getProducts);

/**
 * @swagger
 *  /products/categories:
 *   get:
 *     tags: [Products]
 *     security:
 *          - Bearer: []
 *     description: Get Categories Listing
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Return Message
 */
router.get(
  '/categories',
  auth(UserRole.USER, UserRole.ADMIN),
  productController.getCategories
);

module.exports = router;
