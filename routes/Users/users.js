'use strict';

let express = require('express');
let router = express.Router();
const jwt = require('../../controller/authentication/jwt');

let signupMentee = require("./stubs/signupMentee");
let signupMentor = require("./stubs/signupMentor");
let explore = {};

router.get("/signup/mentee", function (req, res, next) {

    if (process.env.NODE_ENV) {
        res.json(signupMentee);
    } else {

    }
});

router.get("/signup/mentor", function (req, res, next) {
    if (process.env.NODE_ENV) {
        res.json(signupMentor);
    } else {

    }
});

router.post("/login", function (req, res, next) {
    if (!bodyHasCredentials(req.body))
        return res.sendStatus(400);

    if (isUserPresent(req.body))
        return res.json({
            "token": jwt.login(req.body)
        });
    else
        return res.sendStatus(401);
});

router.post("/minimalprofile", [jwt.verifyJwt], function (req, res, next) {
    res.json(res.locals.payload);
});


router.get("/profile", function (req, res, next) {
    if (process.env.NODE_ENV) {
        res.json(signupMentor);
    } else {

    }
});

//Auth
router.get("/explore", function (req, res, next) {
    if (process.env.NODE_ENV)
        res.json(signupMentor);
});

module.exports = router;


function isUserPresent(credentials) {
    return true;
}

function bodyHasCredentials(body) {
    return "email" in body && "password" in body;
}

function bodyHasMenteeFields(body) {
    return "name" in body &&
        "surname" in body &&
        "email" in body &&
        "password" in body
}