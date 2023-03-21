const express = require('express');
const router = express.Router();
const { hookController } = require('../controllers');

router.post('/', hookController.manageHooks);

module.exports = router;
