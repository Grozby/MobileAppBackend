'use strict';

const createError = require('http-errors');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const passport = require('passport');
const app = express();
const fs = require('fs');
const http = require('http');
const path = require('path');


//Passport js
app.use(passport.initialize());
app.use(bodyParser.json({limit: '2mb'}));

let server = http.createServer(
    {
    },
    app
);

const chat = require("./chat/chat").chat(server);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());


//Routes
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users/users').startRouter(chat);
const authRouter = require('./routes/auth/auth');
const contactRouter = require('./routes/contact/contact');
const apiRouter = require('./routes/api/api');

//Add routes
app.use('/', indexRouter);
app.use('/users', usersRouter.router);
app.use('/auth', authRouter);
app.use('/contact', contactRouter);
app.use('/api', apiRouter);

app.use(express.static(path.join(__dirname, 'public')));


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, _next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    return res.sendStatus(err.status || 404);
});

server.listen(5001, function () {
    console.log("Listening on port " + 5001 + " ...");
});

module.exports = {app: app, directoryPath: __dirname};
