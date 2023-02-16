const config = require('../src/api/utils/constant');
const mongoose = require('mongoose');

/**
 * Connecting to database
 */

var option = {
	useNewUrlParser: true,
	useUnifiedTopology: true,
};

mongoose.Promise = global.Promise;
mongoose.connect(config.DATABASE, option, (err, data) => {});

mongoose.set('debug', true);

mongoose.connection.on('error', (error) =>
	console.error('Mongo connection error:', error)
);

mongoose.connection.once('open', () => {
	logger.info('Database connection established');
});

module.exports = mongoose;
