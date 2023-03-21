const router = require('express').Router();
const user = require('./user.route');
const auth = require('./auth.route');
const product = require('./product.route');
const admin = require('./admin.route');

router.use('/auth', auth);
router.use('/users', user);
router.use('/products', product);
router.use('/admin', admin);

module.exports = router;
