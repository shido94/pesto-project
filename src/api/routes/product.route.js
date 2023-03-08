const express = require('express');
const router = express.Router();
const { productController } = require('../controllers');
const { validate, auth } = require('../middleware');
const { UserRole } = require('../utils');
const { productValidation } = require('../validations');

/**
 * @swagger
 * /products/:
 *   post:
 *     tags: [Products]
 *     security:
 *          - Bearer: []
 *     produces:
 *       - application/json
 *     parameters:
 *     - name: body
 *       in: body
 *       description: Add products
 *       required: true
 *       schema:
 *         type: object
 *         required:
 *           - categoryId
 *           - type
 *           - title
 *           - description
 *           - purchasedYear
 *           - pickupAddress
 *           - images
 *         properties:
 *           categoryId:
 *             type: string
 *           type:
 *             type: string
 *           title:
 *             type: string
 *           description:
 *             type: string
 *           brand:
 *             type: string
 *           purchasedYear:
 *             type: string
 *           distanceDriven:
 *             type: string
 *           pickupAddress:
 *             type: string
 *           images:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 uri:
 *                   type: string
 *                 isDefault:
 *                   type: boolean
 *     responses:
 *       200:
 *         description: Return User
 */
router.post('/', auth(UserRole.USER), validate(productValidation.sellProduct), productController.addSellProductRequest);

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
router.get('/categories', auth(UserRole.USER, UserRole.ADMIN), productController.getCategories);

/**
 * @swagger
 *  /products/bid:
 *   put:
 *     tags: [Product]
 *     security:
 *          - Bearer: []
 *     description: Update a bid status
 *     produces:
 *       - application/json
 *     parameters:
 *     - name: body
 *       in: body
 *       description: Mandatory fields
 *       required: true
 *       schema:
 *         type: object
 *         required:
 *           - bidId
 *           - status
 *           - offeredAmount
 *           - notes
 *         properties:
 *           bidId:
 *             type: string
 *             default: 6405eb24145451264ed1859d
 *           status:
 *             type: number
 *             default: 2
 *           offeredAmount:
 *             type: number
 *             default: 100
 *           notes:
 *             type: string
 *     responses:
 *       200:
 *         description: Return Message
 */
router.put(
  '/bid',
  auth(UserRole.USER, UserRole.ADMIN),
  validate(productValidation.updateBid),
  productController.updateBid,
);

/**
 * @swagger
 *  /products/{id}:
 *   get:
 *     tags: [Product]
 *     security:
 *          - Bearer: []
 *     description: Get Product Details
 *     produces:
 *       - application/json
 *     parameters:
 *     - name: id
 *       in: path
 *     responses:
 *       200:
 *         description: Return Message
 */
router.get('/:id', auth(UserRole.ADMIN, UserRole.USER), productController.getProductDetails);

module.exports = router;
