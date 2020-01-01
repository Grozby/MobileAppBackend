'use strict';

let express = require('express');
let router = express.Router();
const config = require('./configHandlers');
const authentication = require('../../controller/authentication/authentication');

/**
 * --- Login ---
 *
 * Example form url encoded
 * messageSender: <email>
 * password: <password>
 * grant_type: password
 */
router.post("/login",
    config.checkLogin,
    function (req, res) {
        return res.sendStatus(200);
    });

router.get(
    '/google/signintoken',
    config.checkGoogleLogin,
    function (req, res) {
        res.status(200).json({
            "access_token": res.locals.token,
            "token_type": "Bearer"
        });
    });

router.get(
    '/checkauth',
    config.checkAuth,
    function (req, res) {
    res.sendStatus(200);
});

module.exports = router;