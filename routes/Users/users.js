'use strict';

let express = require('express');
let router = express.Router();
const jwt = require('./jwt');

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
    if (process.env.NODE_ENV){
        res.json(signupMentor);
    } else {

    }
});

router.post("/login", function (req, res, next) {
    if (!bodyHasCredentials(req.body)){
        return res.sendStatus(400);
    }

    if(isUserPresent(req.body)){
        return res.json({
            "token": jwt.login(req.body)
        });
    } else {
        return res.sendStatus(401);
    }
});

router.post("/verifyToken", function (req, res, next) {
    let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
    if (token.startsWith('Bearer ')) {
        // Remove Bearer from string
        token = token.slice(7, token.length);
    }

    res.json({"token": token});
});

router.get("/profile", function (req, res, next) {
    if (process.env.NODE_ENV){
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

function isUserPresent(credentials){
    return true;
}

function bodyHasCredentials(credentials){
    return credentials["email"] !== undefined && credentials["password"] !== undefined;
}