const mongoose = require('mongoose');
const { constant } = require('../../src/api/utils');

const setupTestDB = () => {
  beforeAll(async () => {
    await mongoose.connect(constant.DATABASE);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
};

module.exports = setupTestDB;
