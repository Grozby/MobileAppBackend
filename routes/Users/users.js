'use strict';

let express = require('express');
let router = express.Router();
const config = require('./configHandlers');
const lodash = require('lodash');
const errorParse = require('../../controller/error_parser');

const {User, Mentor, Mentee} = require('../../models/user.js');
const {mongoose} = require('../../db/mongoose.js');
mongoose.Promise = require('bluebird');

//-------------------
//  Registration
//-------------------

router.post("/signup_complete/mentor",
    config.checkSignupMentor,
    function (req, res) {
        req.body = lodash.pick(req.body, ['email', 'password', 'name', 'surname', 'referralCompany','workingRole','state','experienceList','educationList',
            'questionList','tagList','contactOpt'
        ]);
        let mentor = new Mentor(req.body);

        mentor.save()
            .then(() => { //if user not present in the Database, we add it
                return res.sendStatus(201);
            })
            .catch(error => { //Otherwise, we proceed in sending what went wrong.
                return res.status(400).json(errorParse.parseRegistrationError(error));
            });
    });

router.post("/signup/mentor",
    config.checkSignupMentor,
    function (req, res) {
        req.body = lodash.pick(req.body, ['email', 'password', 'name', 'surname', 'referralCompany']);
        let mentor = new Mentor(req.body);

        mentor.save()
              .then(() => { //if user not present in the Database, we add it
                  return res.sendStatus(201);
              })
              .catch(error => { //Otherwise, we proceed in sending what went wrong.
                  return res.status(400).json(errorParse.parseRegistrationError(error));
              });
    });

router.post("/signup/mentee",
    config.checkSignupMentee,
    function (req, res) {
        req.body = lodash.pick(req.body, ['email', 'password', 'name', 'surname']);
        let mentee = new Mentee(req.body);

        mentee.save()
              .then(() => { //if user not present in the Database, we add it
                  return res.sendStatus(201);
              })
              .catch(error => { //Otherwise, we proceed in sending what went wrong.
                  return res.status(400).json(errorParse.parseRegistrationError(error));
              });
    }
);

//---------------------
//  Profile Information
//---------------------
router.get("/minimalprofile",
    config.generalAuth,
    function (req, res) {
        return res.json({
            user_id: req.user.id,
            name: req.user.email,
            profilePicture: req.user._doc.profilePicture,
            scope: req.authInfo.scope
        })
    });

router.get("/profile",
    config.generalAuth,
    function (req, res) {
    User.getProfile(req.user.id)
        .then((profileResponse)=> res.status(201).json(profileResponse))
        .catch((error)=> res.status(400).json(error))
});

router.get("/profile/:id",
    function (req,res) {
    User.getProfile(req.params.id)
        .then((profileResponse)=> res.status(201).json(profileResponse))
        .catch((error)=> res.status(400).json(error))
});

router.get("/explore",
    config.generalAuth,
    function (req, res) {
    User.exploreSection(req.user.id)
        .then((exploreResponse) => res.status(201).json(exploreResponse))
        .catch((error) => res.status(400).json(error))
});

module.exports = router;

