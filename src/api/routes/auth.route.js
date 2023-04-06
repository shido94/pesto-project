const express = require('express');
const router = express.Router();
const { authController } = require('../controllers');
const { validate } = require('../middleware');
const { authValidation } = require('../validations');

/**
 * Swagger Description
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     produces:
 *       - application/json
 *     parameters:
 *     - name: body
 *       in: body
 *       description: Login using Email/Mobile
 *       required: true
 *       schema:
 *         type: object
 *         required:
 *           - password
 *         properties:
 *           mobile:
 *             type: string
 *             default: 5555555555
 *           email:
 *             type: string
 *             default: rupesh@yopmail.com
 *           password:
 *             type: string
 *             default: Test@1234
 *     responses:
 *       200:
 *         description: Return User
 */
router.post('/login', validate(authValidation.login), authController.login);

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     tags:
 *       - Auth
 *     produces:
 *       - application/json
 *     parameters:
 *     - name: body
 *       in: body
 *       description: Signup User using email, Mobile and Password
 *       required: true
 *       schema:
 *         type: object
 *         required:
 *           - name
 *           - email
 *           - mobile
 *           - password
 *           - identityProofType
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
 *             default: test123@test.com
 *           mobile:
 *             type: string
 *           password:
 *             type: string
 *             default: Test@1234
 *           identityProofType:
 *             type: number
 *             default: 1
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
 *           bankAccountNumber:
 *             type: string
 *             default: 765432123456789
 *           ifscCode:
 *             type: string
 *             default: HDFC0000053
 *           accountHolderName:
 *             type: string
 *             default: Gaurav Kumar
 *           UPI:
 *             type: string
 *     responses:
 *       200:
 *         description: Return User
 */
router.post('/signup', validate(authValidation.signup), authController.register);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     tags:
 *       - Auth
 *     produces:
 *       - application/json
 *     parameters:
 *     - name: body
 *       in: body
 *       description: Forgot Password
 *       required: true
 *       schema:
 *         type: object
 *         required:
 *           - mobile
 *         properties:
 *           mobile:
 *             type: string
 *             default: 5555555555
 *           email:
 *             type: string
 *             default: rupesh@yopmail.com
 *     responses:
 *       200:
 *         description: Return User and Token
 */
router.post('/forgot-password', validate(authValidation.forgotPassword), authController.forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     tags:
 *       - Auth
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
 *           - password
 *         properties:
 *           userId:
 *             type: string
 *             default: 63fcf605a381eaf81ee9cbba
 *           otp:
 *             type: string
 *             default: 1234
 *           password:
 *             type: string
 *             default: Test@1234
 *     responses:
 *       200:
 *         description: Return User and Token
 */
router.post('/reset-password', validate(authValidation.resetPassword), authController.resetPassword);

/**
 * @swagger
 * /auth/resend-otp:
 *   post:
 *     tags:
 *       - Auth
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
 *         properties:
 *           userId:
 *             type: string
 *             default: 63fcf605a381eaf81ee9cbba
 *     responses:
 *       200:
 *         description: Return User and Token
 */
router.post('/resend-otp', validate(authValidation.resendResetOtp), authController.resendResetOtp);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     tags:
 *       - Auth
 *     produces:
 *       - application/json
 *     parameters:
 *     - name: body
 *       in: body
 *       description: Generate refresh token
 *       required: true
 *       schema:
 *         type: object
 *         required:
 *           - token
 *         properties:
 *           token:
 *             type: string
 *     responses:
 *       200:
 *         description: Return User and Token
 */
router.post('/refresh-token', validate(authValidation.refreshToken), authController.getRefreshToken);

module.exports = router;
