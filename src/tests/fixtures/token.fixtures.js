const { tokenService } = require('../../api/services');

const userTokens = await tokenService.generateAuthTokens('63fcf605a381eaf81ee9cbba');
const adminTokens = await tokenService.generateAuthTokens('63fcf605a381eaf81ee9cbba');
