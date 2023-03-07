const httpStatus = require("http-status");
const { pick, catchAsync, responseMessage, UserRole } = require("../utils");
const { userService } = require("../services");
const { responseHandler } = require("../handlers");

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["search"]);
  const options = pick(req.query, ["limit", "page", "sort"]);

  /** Remove admin from list */
  filter.role = { $ne: UserRole.ADMIN };

  const users = await userService.getUsers(filter, options);

  return responseHandler.sendSuccess(
    res,
    httpStatus.OK,
    responseMessage.SUCCESS,
    { users }
  );
});

const getUserProfile = catchAsync(async (req, res) => {
  /** Add user to DB */
  const user = await userService.getUserprofile(req.user.sub);

  return responseHandler.sendSuccess(
    res,
    httpStatus.OK,
    responseMessage.SUCCESS,
    { user }
  );
});

const getUserByUserId = catchAsync(async (req, res) => {
  /** Add user to DB */
  const params = pick(req.params, ["id"]);

  const user = await userService.getUserprofile(params.id);

  return responseHandler.sendSuccess(
    res,
    httpStatus.OK,
    responseMessage.SUCCESS,
    { user }
  );
});

module.exports = {
  getUsers,
  getUserProfile,
  getUserByUserId,
};
