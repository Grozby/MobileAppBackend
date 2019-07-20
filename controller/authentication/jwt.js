'use strict';

const fs = require('fs');
const jwt = require('jsonwebtoken');
const privateKey = fs.readFileSync('config/private.key', 'utf8');
const publicKey = fs.readFileSync('config/public.key', 'utf8');

const options = {
    issuer: 'ADP corp.',
    algorithm: "RS256"
};

exports.login = function (payload) {
    return jwt.sign(payload, privateKey, options);
};

exports.verifyJwt = (req, res, next) => {
    let token = req.headers['x-access-token'] || req.headers['authorization'];
    if (token === undefined)
        return res.sendStatus(401);

    if (token.startsWith('Bearer '))
        token = token.slice(7, token.length);

    try {
        let payload = jwt.verify(token, publicKey, options);
        let allowedKeys = ["email"];
        res.locals.payload =
            Object.keys(payload)
                .filter(key => allowedKeys.includes(key))
                .reduce((obj, key) => {
                    obj[key] = payload[key];
                    return obj;
                }, {});
        next();
    } catch (err) {
        return res.sendStatus(401);
    }
};