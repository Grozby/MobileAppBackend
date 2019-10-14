'use strict';

const auth = require('../../controller/authentication/authentication');

exports.checkLogin = [
    auth.passport.authenticate(['local'], {session: false}),
    auth.oauth2Server.serverToken,
    auth.oauth2Server.errorHandler
];

exports.checkGoogleLogin = [
    auth.loginWithGoogle,
    auth.oauth2Server.generateToken
];

exports.checkAuth = [
    auth.passport.authenticate('bearer')
];
