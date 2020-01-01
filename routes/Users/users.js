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
            .then((profileResponse) => res.status(201).json(profileResponse))
            .catch((error) => res.status(400).json(error))
    });

router.get("/profile/:id",
    function (req, res) {
        User.getProfile(req.params.id)
            .then((profileResponse) => res.status(201).json(profileResponse))
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
    [], function (req, res) {
        let mentors = [
            {
                name: "Bob",
                surname: "Ross",
                bio:
                    "\"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\"",
                location: "Mountain View, US",
                company: "Google",
                pictureUrl:
                    "https://images.csmonitor.com/csm/2015/06/913184_1_0610-larry_standard.jpg?alias=standard_900x600",
                questions: [
                    {
                        question: "Favorite programming languages...",
                        answer: "Java, Python, C++",
                    },
                    {
                        question: "Dragoni volanti",
                        answer: "E dove trovarli",
                    }
                ],
                "pastExperiences": [
                    {
                        type: "OldJob",
                        company: "Apple",
                        workingRole: "Software engineer",
                    },
                    {
                        "type": "AcademicDegree",
                        degreeLevel: "Ph.D",
                        fieldOfStudy: "Computer Science",
                        university: "Stanford University",
                    },
                    {
                        "type": "AcademicDegree",
                        degreeLevel: "Ph.D",
                        fieldOfStudy: "Computer Science",
                        university: "Stanford University",
                    },
                    {
                        "type": "AcademicDegree",
                        degreeLevel: "Ph.D",
                        fieldOfStudy: "Computer Science",
                        university: "Stanford University",
                    }
                ],
                jobType: "Software Engineer",
                workingSpecialization: ["Software Engineer", "Front End", "Backend"],
                companyImageUrl:
                    "https://freeiconshop.com/wp-content/uploads/edd/google-flat.png",


            }
        ];

        res.status(200).json(mentors);
    });

module.exports = router;

