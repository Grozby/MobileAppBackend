'use strict';

let express = require('express');
let router = express.Router();
const config = require('./configHandlers');
const lodash = require('lodash');
const errorParse = require('../../controller/error_parser');
//

const {User, Mentor, Mentee} = require('../../models/user.js');
const {mongoose} = require('../../db/mongoose.js');
mongoose.Promise = require('bluebird');

//-------------------
//  Registration
//-------------------

router.post("/signup_complete/mentor",
    config.checkSignupMentor,
    function (req, res) {
        req.body = lodash.pick(req.body, ['email', 'password', 'name', 'surname', 'referralCompany', 'workingRole', 'state', 'experienceList', 'educationList',
            'questionList', 'tagList', 'contactOpt'
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
            kind: req.user.kind,
            name: req.user.email,
            profilePicture: req.user.pictureUrl,
        })
    });

router.get("/profile",
    config.generalAuth,
    function (req, res) {

        let socialAccountList = [
            "twitter", "github", "facebook", "linkedin", "instagram"
        ];

        return res.json({
            kind: req.user.kind,
            name: req.user.name,
            surname: req.user.surname,
            pictureUrl: req.user.pictureUrl,
            location: req.user.location,
            bio: req.user.bio,
            currentJob: req.user.currentJob,
            pastExperiences: [...req.user.educationList, ...req.user.experienceList],
            questions: req.user.questionList,
            tokenWallet: req.user.tokens_wallet,
            socialAccounts: socialAccountList
                .map((e) => {
                    if (req.user[e] != null) {
                        return {
                            "type": e,
                            "urlAccount": req.user[e]
                        }
                    }
                })
                .filter(e => e != null),
        })
    });

router.get("/profile/:id",
    function (req, res) {
        User.getProfile(req.params.id)
            .then((profileResponse) =>
                res.status(200).json(profileResponse == null ? {} : profileResponse))
            .catch((error) => res.status(400).json(error))
    });


router.get("/explore",
    config.generalAuth,
    function (req, res) {
        User.exploreSection(req.user.id)
            .then((exploreResponse) => res.status(201).json(exploreResponse))
            .catch((error) => res.status(400).json(error))
    });

//Stub call to check if everything is working with the network connectivity of the app.
router.get("/explorestub",
    config.generalAuth, async function (req, res) {
        if (req.user.kind === "Mentee") {
            let mentors = await Mentor.aggregate([{$sample: {size: 7}}])
                                      .then(function (ms) {
                                              return ms;
                                          }
                                      );
            mentors.forEach(function(part, index) {
                part.pastExperiences = part.educationList.concat(part.experienceList);
                delete part.educationList;
                delete part.experienceList;
                this[index] = part;
            }, mentors);

            return res.status(200).json(mentors);
        } else if (req.user.kind === "Mentor") {
            let mentees = await Mentee.aggregate([{$sample: {size: 5}}])
                                      .then(function (ms) {
                                              return ms;
                                          }
                                      );

            return res.status(200).json(mentees);
        }

        return res.sendStatus(404);
    })
;

module.exports = router;

