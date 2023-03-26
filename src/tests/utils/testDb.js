const mongoose = require('mongoose');
const { constant } = require('../../api/utils');

const setupTestDB = () => {
  beforeAll(async () => {
    await mongoose.connect(constant.DATABASE);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });
};

module.exports = setupTestDB;
