const { multer } = require('../utils');

const uploadMany = multer.array('files');

module.exports = uploadMany;
