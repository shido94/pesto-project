const multer = require('multer');
const multerS3 = require('multer-s3');
const random = require('../utils/random');
const s3 = require('./s3');
const constant = require('./constant');

const storage = multerS3({
  s3: s3,
  bucket: constant.S3.BUCKET_NAME,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  acl: 'public-read',
  key: function (req, file, cb) {
    cb(null, renameWithExt(req, file));
  },
});

function renameWithExt(req, file) {
  const ext = file.mimetype.split('/')[1]; // parse the extension type

  const name = new Date().getTime() + random.randomToken().replace('.', '') + `.${ext}`;
  return name;
}

module.exports = multer({
  storage: storage,
});
