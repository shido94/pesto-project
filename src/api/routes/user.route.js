const express = require('express');
const router = express.Router();
const { weatherController } = require('../controllers');
const { validate } = require('../middleware');
const { userValidation } = require('../validations');

// /**
//  * @swagger
//  *  /weathers/cities:
//  *   get:
//  *     tags:
//  *       - Users
//  *     produces:
//  *       - application/json
//  *     parameters:
//  *     - name: type
//  *       in: query
//  *     - name: city
//  *       in: query
//  *     - name: limit
//  *       in: query
//  *       description: Get All City Listing
//  *     responses:
//  *       200:
//  *         description: Return Message
//  */
// router.get(
// 	'/cities',
// 	validate(userValidation.cityWeatherQuery),
// 	weatherController.getCities
// );

// /**
//  * @swagger
//  *  /weathers/forecast:
//  *   get:
//  *     tags:
//  *       - Users
//  *     produces:
//  *       - application/json
//  *     parameters:
//  *     - name: type
//  *       in: query
//  *     - name: city
//  *       in: query
//  *     - name: days
//  *       in: query
//  *     - name: limit
//  *       in: query
//  *       description: Get All City Listing
//  *     responses:
//  *       200:
//  *         description: Return Message
//  */
// router.get(
// 	'/forecast',
// 	validate(userValidation.cityWeatherQuery),
// 	weatherController.getCitiesForecast
// );

module.exports = router;
