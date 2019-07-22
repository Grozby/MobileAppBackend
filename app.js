'use strict';

const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const passport = require('passport');
const oauth2 = require('./controller/authentication/oauth2');
const app = express();

//Passport js
app.use(passport.initialize());

//Routes
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users/users');
const authRouter = require('./routes/auth/auth');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

//Add routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    return res.sendStatus(err.status || 500);
});

app.listen(5000, function () {
    console.log("Listening on port " + 5000 + " ...");
});

module.exports = app;
