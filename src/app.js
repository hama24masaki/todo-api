const express = require('express');
const path = require('path');
const logger = require('morgan');
const models = require("./models");
const env = process.env.NODE_ENV || 'development';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// route with versioning
const beta_v1 = express.Router();
app.use('/beta-v1', beta_v1);
// app.use('/', beta_v1); // for development only!
beta_v1.use('/tasks', require("./routes/tasks"));
beta_v1.use('/users', require("./routes/users"));

if (env === "development")
    app.use(logger('dev'));
else 
    app.use(logger('combined'));


module.exports = app;
