const express = require("express");
const router = express.Router();
const { productController } = require("../controllers");
const { validate, auth } = require("../middleware");
const { UserRole } = require("../utils");
const { productValidation } = require("../validations");

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
 *     - name: sort
 *       in: query
 *     - name: page
 *       in: query
 *     responses:
 *       200:
 *         description: Return Message
 */
router.get("/", auth(UserRole.USER), productController.getProducts);

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
router.post(
  "/",
  auth(UserRole.USER),
  validate(productValidation.sellProduct),
  productController.addSellProductRequest
);

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
  "/categories",
  auth(UserRole.USER, UserRole.ADMIN),
  productController.getCategories
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
router.get(
  "/:id",
  auth(UserRole.ADMIN, UserRole.USER),
  productController.getProductDetails
);

module.exports = router;
