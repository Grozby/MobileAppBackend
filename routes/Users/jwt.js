'use strict';

const fs = require('fs');
const jwt = require('jsonwebtoken');
const privateKey = fs.readFileSync('config/private.key', 'utf8');
const publicKey = fs.readFileSync('config/public.key', 'utf8');

const options = {
    issuer: 'ADP corp.',
    algorithm: "RS256"
};

exports.login = function (credentials) {
    return jwt.sign(credentials, privateKey, options);
};

exports.verifyJwt = function (token) {
    try {
        return jwt.verify(token, publicKey, options);
    } catch (err) {
        return false;
    }
};