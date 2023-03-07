const express = require("express");
const router = express.Router();
const { userController } = require("../controllers");
const { validate, auth } = require("../middleware");
const { UserRole } = require("../utils");

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
router.get("/", auth(UserRole.ADMIN), userController.getUsers);

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
router.get(
  "/:id",
  auth(UserRole.USER, UserRole.ADMIN),
  userController.getUserProfile
);

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
router.get(
  "/:id",
  auth(UserRole.USER, UserRole.ADMIN),
  userController.getUserByUserId
);

module.exports = router;
