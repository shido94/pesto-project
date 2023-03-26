const { s3 } = require('../utils');

const uploadFile = async ({ path, data }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const params = {
        Bucket: config.BUCKET_NAME,
        Key: path,
        Body: data,
        ACL: 'public-read',
      };

      const file = await s3.upload(params).promise();

      if (!file) {
        reject(false);
      } else {
        resolve(file);
      }
    } catch (err) {
      logger.error('Error inside uploadFile', err);
      reject(err);
    }
  });
};

const deleteFile = async function (file) {
  try {
    const params = { Bucket: config.BUCKET_NAME, Key: file };

    const found = await s3.headObject(params).promise();

    if (found) {
      await s3.deleteObject(params).promise();
      logger.debug('file deleted Successfully');
      return;
    }
  } catch (error) {
    logger.error('Image not found in aws', error);
    return;
  }
};

const getFile = async function (file) {
  try {
    const params = { Bucket: config.BUCKET_NAME, Key: file };

    const found = await s3.getObject(params).promise();
    logger.debug('file fetched Successfully');

    return found;
  } catch (error) {
    logger.error('Image not found in aws', error);
    return;
  }
};

module.exports = {
  uploadFile,
  deleteFile,
  getFile,
};
