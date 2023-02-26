const router = require('express').Router();
const user = require('./user.route');
const auth = require('./auth.route');

router.use('/auth', auth);
router.use('/users', user);

module.exports = router;
