const { S3Client } = require('@aws-sdk/client-s3');

const constant = require('./constant');

const s3 = new S3Client({
  region: constant.S3.REGION,
  credentials: {
    accessKeyId: constant.S3.ACCESS_KEY,
    secretAccessKey: constant.S3.SECRET_KEY,
  },
  sslEnabled: false,
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
});

module.exports = s3;
