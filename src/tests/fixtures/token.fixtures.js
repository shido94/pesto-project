const { tokenService } = require('../../api/services');
const { UserRole } = require('../../api/utils');

const userTokens = tokenService.generateAuthTokens('63fcf605a381eaf81ee9cbba');
const adminTokens = tokenService.generateAuthTokens('64204e29ef2615d31e0fc23d', UserRole.ADMIN);

module.exports = {
  userTokens,
  adminTokens,
};
