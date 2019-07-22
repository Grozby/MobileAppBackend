'use strict';

const auth = require('../../controller/authentication/authentication');

exports.checkLogin = [
    auth.passport.authenticate(['local'], {session: false}),
    auth.oauth2Server.serverToken,
    auth.oauth2Server.errorHandler
];

exports.authGoogle = [
    auth.passport.authenticate('google', {session: false}),
];

exports.authGoogleCallback = [
    auth.passport.authenticate('google', {session: false}),
    auth.oauth2Server.generateToken
];
