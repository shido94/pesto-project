const express = require('express');
const router = express.Router();
const { userController } = require('../controllers');
const { validate, auth } = require('../middleware');
const { UserRole } = require('../utils');
const { userValidation } = require('../validations');

/**
 * @swagger
 *  /users/:
 *   get:
 *     tags: [Users]
 *     security:
 *          - Bearer: []
 *     description: Get User Profile
 *     produces:
 *       - application/json
 *     parameters:
 *     - name: type
 *       in: query
 *     - name: city
 *       in: query
 *     - name: days
 *       in: query
 *     - name: limit
 *       in: query
 *     responses:
 *       200:
 *         description: Return Message
 */
router.get('/', auth(UserRole.USER), userController.getUserprofile);

module.exports = router;
