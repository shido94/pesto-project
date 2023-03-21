const { hookService } = require('../services');
const { catchAsync } = require('../utils');

const manageHooks = catchAsync(async (req, res) => {
  await hookService.manageHooks(req.body);
});

module.exports = {
  manageHooks,
};
