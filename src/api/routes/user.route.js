const express = require('express');
const router = express.Router();
const { userController } = require('../controllers');
const { validate, auth } = require('../middleware');
const { UserRole } = require('../utils');
const { userValidation, authValidation } = require('../validations');
const { uploadMany } = require('../middleware');

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
 *     security:
 *          - Bearer: []
 *     parameters:
 *     - name: body
 *       in: body
 *       description: Verify signup otp
 *       required: true
 *       schema:
 *         type: object
 *         required:
 *           - otp
 *         properties:
 *           otp:
 *             type: string
 *             default: 1234
 *     responses:
 *       200:
 *         description: Return User and Token
 */
router.post(
  '/verify-mobile-otp',
  validate(userValidation.verifyUserOtp),
  auth(UserRole.USER),
  userController.verifyMobileUpdateOtp,
);

/**
 * @swagger
 * /users/resend-mobile-otp:
 *   get:
 *     tags:
 *       - Users
 *     produces:
 *       - application/json
 *     security:
 *          - Bearer: []
 *     responses:
 *       200:
 *         description: Return User and Token
 */
router.get('/resend-mobile-otp', auth(UserRole.USER), userController.resendChangeMobileOtp);

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
router.get('/products', auth(UserRole.USER), userController.getUserProducts);

/**
 * @swagger
 * /users/fund:
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
 *       description: Update user fund details
 *       required: true
 *       schema:
 *         type: object
 *         properties:
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
router.put('/fund', auth(UserRole.USER), validate(userValidation.updateFund), userController.updateFundDetails);

/**
 * @swagger
 * /users/update-password:
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
 *       description: Update user password
 *       required: true
 *       schema:
 *         type: object
 *         required:
 *           - currentPassword
 *           - newPassword
 *         properties:
 *           currentPassword:
 *             type: string
 *             default: Test@1234
 *           newPassword:
 *             type: string
 *             default: Test@123
 *     responses:
 *       200:
 *         description: Return User
 */
router.put(
  '/update-password',
  auth(UserRole.USER, UserRole.ADMIN),
  validate(userValidation.updatePassword),
  userController.updatePassword,
);

/**
 * @swagger
 *  /users/image:
 *   post:
 *     tags: [Users]
 *     description: Upload files
 *     produces:
 *       - application/json
 *     parameters:
 *     - name: files
 *       in: formData
 *       type: file
 *       description: The file to upload.
 *     responses:
 *       200:
 *         description: Return Message
 */
router.post('/image', uploadMany, userController.uploadImages);

/**
 * @swagger
 * /users/notifications:
 *   get:
 *     tags:
 *       - Users
 *     security:
 *          - Bearer: []
 *     description: Get Notifications Listing
 *     produces:
 *       - application/json
 *     parameters:
 *     - name: limit
 *       in: query
 *     - name: page
 *       in: query
 *     responses:
 *       200:
 *         description: return obj
 */
router.get('/notifications', auth(UserRole.USER, UserRole.ADMIN), userController.getNotifications);

/**
 * @swagger
 * /users/notifications/unread/count:
 *   get:
 *     tags:
 *       - Users
 *     security:
 *          - Bearer: []
 *     description: Get Unread Notifications Count
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: return obj
 */
router.get(
  '/notifications/unread/count',
  auth(UserRole.USER, UserRole.ADMIN),
  userController.getUnreadNotificationCount,
);

/**
 * @swagger
 * /users/notifications:
 *   delete:
 *     tags:
 *       - Users
 *     security:
 *          - Bearer: []
 *     description: Delete Notifications
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: return obj
 */
router.delete('/notifications/', auth(UserRole.USER, UserRole.ADMIN), userController.deleteAllNotification);

/**
 * @swagger
 * /users/notifications/{id}:
 *   delete:
 *     tags:
 *       - Users
 *     security:
 *          - Bearer: []
 *     description: Delete Notifications
 *     produces:
 *       - application/json
 *     parameters:
 *     - name: id
 *       in: path
 *     responses:
 *       200:
 *         description: return obj
 */
router.delete('/notifications/:id', auth(UserRole.USER, UserRole.ADMIN), userController.deleteNotification);

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
