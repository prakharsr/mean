import mongoose from 'mongoose';
import util from 'util';


// config should be imported before importing any other file
import config from './server/config/config';
import app from './server/config/express';

var cors = require('cors');
// var express = require('express');
// var app  = express();
// var mongoose = require('mongoose');
// var config = require('./config');
// var port = config.PORT;
var morgan = require('morgan');
var bodyParser = require('body-parser');
var path = require('path');

var corsOptions = {
  "origin": "*",
  "responseHeader": "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  "method": "POST, GET, PUT,PATCH, DELETE, OPTIONS",
  "maxAgeSeconds": 120
}

app.use(cors(corsOptions));

var jwt = require('jsonwebtoken');

var passport = require("passport");
var passportJWT = require("passport-jwt");

var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;


app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
app.use(express.static(__dirname + '/server/public'));
app.use('/api', cors(corsOptions), require('./server/api/routes/router'));
const debug = require('debug')('express-mongoose-es6-rest-api:index');

// make bluebird default Promise
Promise = require('bluebird'); // eslint-disable-line no-global-assign

// plugin bluebird promise in mongoose
mongoose.Promise = Promise;

// connect to mongo db
const mongoUri = config.mongo.host;
mongoose.connect('mongodb://prakharsr:lambo@ds147882.mlab.com:47882/zaaadb', { server: { socketOptions: { keepAlive: 1 } } });
mongoose.connection.on('error', () => {
  throw new Error(`unable to connect to database: ${mongoUri}`);
});

// print mongoose logs in dev env
if (config.MONGOOSE_DEBUG) {
  mongoose.set('debug', (collectionName, method, query, doc) => {
    debug(`${collectionName}.${method}`, util.inspect(query, false, 20), doc);
  });
}
app.get('*', function(req,res){
	res.sendFile(path.join(__dirname + '/server/public/app/views/index.html'));
});
// module.parent check is required to support mocha watch
// src: https://github.com/mochajs/mocha/issues/1912

  // listen on port config.port
  app.listen(config.port, () => {
    console.info(`server started on port ${config.port} (${config.env})`); // eslint-disable-line no-console
  });

export default app;
