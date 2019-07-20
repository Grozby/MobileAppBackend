'use strict';

let express = require('express');
let router = express.Router();
const {check, validationResult} = require('express-validator');
const jwt = require('../../controller/authentication/jwt');

const {User,Mentor,Mentee} = require('./../../models/user.js');

let signupMentor = require("./stubs/signupMentor");
let explore = {};

router.get("/signup/mentee",
    [
        check('name'),
        check('surname'),
        check('email').isEmail(),
        check('password').isLength({min: 8}),
        bodyValidated
    ],
    function (req, res, next) {
        if (!isUserPresent(req.body["email"])) {
            registerMentee(req.body);
            return res.sendStatus(200);
        } else {
            return res.sendStatus(409)
                      .json({
                          message: "Email already used!"
                      })
        }
    });

router.get("/signup/mentor",
    [
        check('name'),
        check('surname'),
        check('email').isEmail(),
        check('password').isLength({min: 8}),
        check('company'),
        bodyValidated
    ],
    function (req, res, next) {
        if (!isUserPresent(req.body["email"]) && isEmailCompany(req.body["email"])) {
            registerMentor(req.body);
            return res.sendStatus(200);
        } else {
            return res.sendStatus(409)
                      .json({
                          message: "Email already used!"
                      })
        }
    }
);


router.post("/login",
    [
        check('email').isEmail(),
        check('password').isLength({min: 8}),
        bodyValidated
    ],
    function (req, res, next) {
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

router.get("/profile", [jwt.verifyJwt], function (req, res, next) {
    return res.json(getProfileInfo(res.locals.payload["email"]));
});


router.get("/explore", [jwt.verifyJwt], function (req, res, next) {
    if (process.env.NODE_ENV)
        res.json(signupMentor);
});

module.exports = router;


/**
 * Error function that acts after the various checks done on the body.
 * @param req
 * @param res
 * @param next
 * @returns {createServer.NextHandleFunction | * | Response | Promise<any>}
 */
function bodyValidated(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }
    next();
}

//---------------------------
//  STUB FUNCTIONS
//---------------------------
function isUserPresent(email) {
    return true;
}

function isEmailCompany(email){
    return true;
}

function registerMentee(body) {

}

function registerMentor(body) {

}

function getProfileInfo(email){

}
