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


router.get('/google',
    config.authGoogle
);

router.get('/google/callback',
    config.authGoogleCallback,
    function (req, res) {
        res.status(200).json({
            "access_token": res.locals.token,
            "token_type": "Bearer"
        });
    });

router.get(
    '/google/signintoken',
    [],
    async function (req, res)  {
        let token = req.query.token;
        try {
            await authentication.loginWithGoogle(token);
            return res.sendStatus(200);
        } catch (e) {
            res.sendStatus(401);
        }
    });

module.exports = router;