'use strict';

let express = require('express');
let router = express.Router();
const lodash = require('lodash');
const {check, validationResult} = require('express-validator');
const jwt = require('../../controller/authentication/jwt');

const {User, Mentor, Mentee} = require('../../models/user.js');
const {Contact} = require('../../models/contact');
const {mongoose} = require('../../db/mongoose.js');
mongoose.Promise = require('bluebird');

//-------------------
//  Registration
//-------------------
router.post("/signup/mentor",
    [
        check('name'),
        check('surname'),
        check('email').isEmail(),
        check('password').isLength({min: 8}),
        check('referralCompany'),
        bodyValidated
    ],
    function (req, res) {
        req.body = lodash.pick(req.body, ['email', 'password', 'name', 'surname', 'referralCompany']);
        let mentor = new Mentor(req.body);

        mentor.save()
              .then(() => { //if user not present in the Database, we add it
                  return res.sendStatus(201);
              })
              .catch(error => { //Otherwise, we proceed in sending what went wrong.
                  return res.status(400).json(error);
              });
    });


router.post("/signup/mentee",
    [
        check('name'),
        check('surname'),
        check('email').isEmail(),
        check('password').isLength({min: 8}),
        bodyValidated
    ],
    function (req, res) {
        req.body = lodash.pick(req.body, ['email', 'password', 'name', 'surname']);
        let mentee = new Mentee(req.body);

        mentee.save()
              .then(() => { //if user not present in the Database, we add it
                  return res.sendStatus(201);
              })
              .catch(error => { //Otherwise, we proceed in sending what went wrong.
                  return res.status(400).json(error);
              });
    }
);

//-------------------
//  Login
//-------------------
router.post("/login",
    [
        check('email').isEmail(),
        check('password').isLength({min: 8}),
        bodyValidated
    ],
    function (req, res, next) {
        User.findByCredentials(req.body["email"], req.body["password"])
            .then(result => {
                let payload = {
                    "email": result["email"]
                };
                return res.json({
                    "token": jwt.login(payload)
                });
            })
            .catch(() => {
                return res.status(401).json({
                    "error": "Incorrect username or password."
                });
            });
    });

//---------------------
//  Profile Information
//---------------------
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


function isEmailCompany(email) {
    return true;
}

function registerMentee(body) {

}

function registerMentor(body) {

}

function getProfileInfo(email) {

}
