const express = require('express');
const router = express.Router();
const { userController } = require('../controllers');
const { validate, auth } = require('../middleware');
const { UserRole } = require('../utils');
const { userValidation, authValidation } = require('../validations');

/**
 * @swagger
 *  /users/:
 *   get:
 *     tags: [Users]
 *     security:
 *          - Bearer: []
 *     description: Get Users Listing
 *     produces:
 *       - application/json
 *     parameters:
 *     - name: search
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
router.get('/', auth(UserRole.ADMIN), userController.getUsers);

/**
 * @swagger
 *  /users/profile:
 *   get:
 *     tags: [Users]
 *     security:
 *          - Bearer: []
 *     description: Get User Profile
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Return Message
 */
router.get('/profile', auth(UserRole.USER, UserRole.ADMIN), userController.getUserProfile);

/**
 * @swagger
 * /users/profile:
 *   put:
 *     tags:
 *       - Users
 *     produces:
 *       - application/json
 *     security:
 *          - Bearer: []
 *     parameters:
 *     - name: body
 *       in: body
 *       description: Update user profile
 *       required: true
 *       schema:
 *         type: object
 *         required:
 *           - name
 *           - email
 *           - identityProofNumber
 *           - identityProofImageUri
 *           - addressLine1
 *           - city
 *           - state
 *           - zipCode
 *           - country
 *         properties:
 *           name:
 *             type: string
 *           email:
 *             type: string
 *           identityProofNumber:
 *             type: string
 *           identityProofImageUri:
 *             type: string
 *           addressLine1:
 *             type: string
 *           landmark:
 *             type: string
 *           city:
 *             type: string
 *           state:
 *             type: string
 *           zipCode:
 *             type: string
 *           country:
 *             type: string
 *     responses:
 *       200:
 *         description: Return User
 */
router.put(
  '/profile',
  auth(UserRole.USER, UserRole.ADMIN),
  validate(userValidation.updateProfile),
  userController.updateProfile,
);

/**
 * @swagger
 * /users/mobile:
 *   put:
 *     tags:
 *       - Users
 *     produces:
 *       - application/json
 *     security:
 *          - Bearer: []
 *     parameters:
 *     - name: body
 *       in: body
 *       description: Update mobile number
 *       required: true
 *       schema:
 *         type: object
 *         required:
 *           - mobile
 *         properties:
 *           mobile:
 *             type: string
 *     responses:
 *       200:
 *         description: Return User
 */
router.put('/mobile', auth(UserRole.USER), validate(userValidation.updateMobile), userController.updateMobile);

/**
 * @swagger
 * /users/verify-mobile-otp:
 *   post:
 *     tags:
 *       - Users
 *     produces:
 *       - application/json
 *     parameters:
 *     - name: body
 *       in: body
 *       description: Verify signup otp
 *       required: true
 *       schema:
 *         type: object
 *         required:
 *           - userId
 *           - otp
 *         properties:
 *           userId:
 *             type: string
 *             default: 63fcf605a381eaf81ee9cbba
 *           otp:
 *             type: string
 *             default: 1234
 *     responses:
 *       200:
 *         description: Return User and Token
 */
router.post('/verify-mobile-otp', validate(authValidation.verifyAuthOtp), userController.verifyAuthOtp);

/**
 * @swagger
 *  /users/products:
 *   get:
 *     tags: [Users]
 *     security:
 *          - Bearer: []
 *     description: Get Users Products Listing
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
router.get('/products', auth(UserRole.USER), userController.getUserProducts);

/**
 * @swagger
 *  /users/{id}:
 *   get:
 *     tags: [Users]
 *     security:
 *          - Bearer: []
 *     description: Get User Details
 *     produces:
 *       - application/json
 *     parameters:
 *     - name: id
 *       in: path
 *     responses:
 *       200:
 *         description: Return Message
 */
router.get('/:id', auth(UserRole.USER, UserRole.ADMIN), userController.getUserByUserId);

module.exports = router;
