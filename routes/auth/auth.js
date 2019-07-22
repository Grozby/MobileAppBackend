'use strict';

let express = require('express');
let router = express.Router();
const config = require('./configHandlers');

/**
 * --- Login ---
 *
 * Example form url encoded
 * username: <email>
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

module.exports = router;