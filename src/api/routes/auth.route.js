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
 *       description: Login using email/Mobile and Password
 *       required: true
 *       schema:
 *         type: object
 *         required:
 *           - password
 *         properties:
 *           email:
 *             type: string
 *           password:
 *             type: string
 *     responses:
 *       200:
 *         description: Return User and Token
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
 *           - password
 *         properties:
 *           name:
 *             type: string
 *           email:
 *             type: string
 *           mobile:
 *             type: number
 *           password:
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

module.exports = router;
