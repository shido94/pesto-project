const express = require('express');
const router = express.Router();
const { adminController } = require('../controllers');
const { validate, auth } = require('../middleware');
const { UserRole } = require('../utils');
const { userValidation } = require('../validations');

/**
 * @swagger
 * /admin/login:
 *   post:
 *     tags: [Admin]
 *     produces:
 *       - application/json
 *     parameters:
 *     - name: body
 *       in: body
 *       description: Login using email and Password
 *       required: true
 *       schema:
 *         type: object
 *         required:
 *           - email
 *         properties:
 *           email:
 *             type: string
 *           password:
 *             type: string
 *     responses:
 *       200:
 *         description: Return User and Token
 */
router.post('/login', adminController.login);

module.exports = router;
