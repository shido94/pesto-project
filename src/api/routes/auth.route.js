const express = require('express');
const router = express.Router();
const { authController } = require('../controllers');
const { validate, auth } = require('../middleware');
const { UserRole } = require('../utils');
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
 *       description: Login using Mobile
 *       required: true
 *       schema:
 *         type: object
 *         required:
 *           - mobile
 *         properties:
 *           mobile:
 *             type: string
 *             default: 5555555555
 *     responses:
 *       200:
 *         description: Return User
 */
router.post(
  '/login',
  validate(authValidation.validateMobile),
  authController.login
);

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
 *           mobile:
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
 *           bankAccountNumber:
 *             type: string
 *           ifscCode:
 *             type: string
 *           accountHolderName:
 *             type: string
 *           UPI:
 *             type: string
 *     responses:
 *       200:
 *         description: Return User
 */
router.post(
  '/signup',
  validate(authValidation.signup),
  authController.register
);

/**
 * @swagger
 * /auth/verify-otp:
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
router.post(
  '/verify-otp',
  validate(authValidation.verifyAuthOtp),
  authController.verifyAuthOtp
);

module.exports = router;
