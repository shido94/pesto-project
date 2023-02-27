const httpStatus = require('http-status');
const { pick, catchAsync, responseMessage } = require('../utils');
const { userService } = require('../services');
const { responseHandler } = require('../handlers');

const getUserprofile = catchAsync(async (req, res) => {
  /** Add user to DB */
  const user = {
    name: 'rupesh',
  };

  return responseHandler.sendSuccess(
    res,
    httpStatus.OK,
    responseMessage.SUCCESS,
    { user }
  );
});

module.exports = {
  getUserprofile,
};
