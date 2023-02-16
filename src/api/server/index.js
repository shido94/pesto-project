const express = require('express');
const morganLogger = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const compression = require('compression');
const uuid = require('uuid').v4;
const { logger, swagger } = require('../utils');
const path = require('path');
const methodOverRide = require('method-override');
const apiError = require('../utils/apiError');
const { error } = require('../middleware');
const httpStatus = require('http-status');
const helmet = require('helmet');
require('../../../db/index');

/**
 * Assign the express server to app
 */
const app = express();
app.use(function (req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept'
	);
	res.header('Access-Control-Allow-Credentials', true);
	res.header('Access-Control-Allow-Methods', 'Content-Type');
	next();
});

/**
 * Set Globals
 */
global.logger = logger;

app.set('view engine', 'ejs');
app.set('debug', require('debug')('app'));
app.set('trust proxy', 1); // trust first proxy

app.use(cors());
app.use(express.static(path.join(__dirname, '/public')));
app.use(morganLogger('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // To parse the incoming requests with JSON payloads
app.use(cookieParser());
app.use(methodOverRide());

app.use(compression());
app.use(cors());
app.use(helmet());

process.on('SIGINT', () => {
	logger.log('stopping the server', 'info');
	process.exit();
});

app.use('/api/docs', swagger.router);

app.use((req, res, next) => {
	req.identifier = uuid();
	const logString = `A request has been made with the following uuid [${
		req.identifier
	}] ${req.url} ${req.headers['user-agent']} ${JSON.stringify(req.body)}`;
	logger.log(logString, 'info');
	next();
});

app.use('/api/v1', require('../routes'));

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
	next(new apiError(httpStatus.NOT_FOUND, 'Route Not found'));
});

// convert error to apiError, if needed
app.use(error.errorConverter);

// handle error
app.use(error.errorHandler);

module.exports = app;
