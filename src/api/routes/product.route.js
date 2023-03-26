const express = require('express');
const router = express.Router();
const { productController } = require('../controllers');
const { validate, auth } = require('../middleware');
const { UserRole } = require('../utils');
const { productValidation } = require('../validations');

/**
 * @swagger
 *  /products/pending:
 *   get:
 *     tags: [Products]
 *     security:
 *          - Bearer: []
 *     description: Get Pending Products
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
 *     - name: sort
 *       in: query
 *     - name: page
 *       in: query
 *     responses:
 *       200:
 *         description: Return Message
 */
router.get('/pending', auth(UserRole.ADMIN), productController.getPendingProducts);

/**
 * @swagger
 *  /products:
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
 *     - name: bidStatus
 *       in: query
 *     - name: orderStatus
 *       in: query
 *     - name: minPrice
 *       in: query
 *     - name: maxPrice
 *       in: query
 *     - name: limit
 *       in: query
 *     - name: sort
 *       in: query
 *     - name: page
 *       in: query
 *     responses:
 *       200:
 *         description: Return Message
 */
router.get('/', auth(UserRole.ADMIN), productController.getAllProducts);

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
 * /products/:
 *   put:
 *     tags: [Products]
 *     security:
 *          - Bearer: []
 *     produces:
 *       - application/json
 *     parameters:
 *     - name: body
 *       in: body
 *       description: Edit products
 *       required: true
 *       schema:
 *         type: object
 *         required:
 *           - productId
 *           - categoryId
 *           - type
 *           - title
 *           - description
 *           - purchasedYear
 *           - pickupAddress
 *           - images
 *         properties:
 *           productId:
 *             type: string
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
router.put('/', auth(UserRole.USER), validate(productValidation.updateProduct), productController.editProduct);

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
 *     tags: [Products]
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
 *     tags: [Products]
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
