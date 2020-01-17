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
            .then((profileResponse) => res.status(200).json(profileResponse))
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
                    kind: "Mentor",
                    name: "Bob",
                    surname: "Ross",
                    bio:
                        "\"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\"",
                    location: "Mountain View, US",
                    company: "Google",
                    pictureUrl:
                        "https://images.csmonitor.com/csm/2015/06/913184_1_0610-larry_standard.jpg?alias=standard_900x600",
                    currentJob: {
                        kind: "Job",
                        institution: {
                            name: "Google",
                            pictureUrl:
                                "https://freeiconshop.com/wp-content/uploads/edd/google-flat.png",
                        },
                        workingRole: "Software Engineer",
                        fromDate: "2019-03-01 00:00:00.000Z",
                    },
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
                    pastExperiences:
                        [
                            {
                                kind: "Job",
                                institution: {
                                    name: "Apple",
                                    pictureUrl:
                                        "https://i.pinimg.com/originals/1c/aa/03/1caa032c47f63d50902b9d34492e1303.jpg",
                                },
                                workingRole: "Software Engineer",
                                fromDate: "2019-03-01 00:00:00.000Z",
                                toDate: "2019-09-01 00:00:00.000Z",
                            },
                            {
                                kind: "Education",
                                institution: {
                                    name: "Stanford University",
                                    pictureUrl:
                                        "https://identity.stanford.edu/img/block-s-2color.png",
                                },
                                degreeLevel: "Ph.D",
                                fieldOfStudy: "Computer Science",
                                fromDate: "2015-07-01 00:00:00.000Z",
                                toDate: "2018-07-01 00:00:00.000Z",
                            },
                            {
                                kind: "Education",
                                institution: {
                                    name: "Politecnico di Milano",
                                    pictureUrl:
                                        "https://identity.stanford.edu/img/block-s-2color.png",
                                },
                                degreeLevel: "Ph.D",
                                fieldOfStudy: "Computer Science",
                                fromDate: "2015-07-01 00:00:00.000Z",
                                toDate: "2018-07-01 00:00:00.000Z",
                            },
                            {
                                kind: "Education",
                                institution: {
                                    name: "Politecnico di Milano",
                                    pictureUrl:
                                        "https://identity.stanford.edu/img/block-s-2color.png",
                                },
                                degreeLevel: "Ph.D",
                                fieldOfStudy: "Computer Science",
                                fromDate: "2015-07-01 00:00:00.000Z",
                                toDate: "2018-07-01 00:00:00.000Z",
                            },
                        ],
                    socialAccounts: [],
                    questionsForAcceptingRequest: [
                        {
                            question: "In Software Engineering,briefly explain what the patter Wrapper is used for?",
                            availableTime: 120,
                        },
                        {
                            question: "Ma sei megaminchia?",
                            availableTime: 60,
                        }
                    ],
                    workingSpecialization:
                        ["Software Engineer", "Front End", "Backend"],


                },
                {
                    kind: "Mentor",
                    name: "Bobberino",
                    surname: "Ross",
                    bio:
                        "\"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\"",
                    location: "Mountain View, US",
                    company: "Google",
                    pictureUrl:
                        "https://b.thumbs.redditmedia.com/7Zlnm0CUqYG2VIdqpc8QA08cvoINPKTvOZDL2kjfmsI.png",
                    currentJob: {
                        kind: "Job",
                        institution: {
                            name: "Google",
                            pictureUrl:
                                "https://freeiconshop.com/wp-content/uploads/edd/google-flat.png",
                        },
                        workingRole: "Software Engineer",
                        fromDate: "2019-03-01 00:00:00.000Z",
                    },
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
                    pastExperiences:
                        [
                            {
                                kind: "Job",
                                institution: {
                                    name: "Apple",
                                    pictureUrl:
                                        "https://i.pinimg.com/originals/1c/aa/03/1caa032c47f63d50902b9d34492e1303.jpg",
                                },
                                workingRole: "Software Engineer",
                                fromDate: "2019-03-01 00:00:00.000Z",
                                toDate: "2019-09-01 00:00:00.000Z",
                            },
                            {
                                kind: "Education",
                                institution: {
                                    name: "Stanford University",
                                    pictureUrl:
                                        "https://identity.stanford.edu/img/block-s-2color.png",
                                },
                                degreeLevel: "Ph.D",
                                fieldOfStudy: "Computer Science",
                                fromDate: "2015-07-01 00:00:00.000Z",
                                toDate: "2018-07-01 00:00:00.000Z",
                            },
                            {
                                kind: "Education",
                                institution: {
                                    name: "Politecnico di Milano",
                                    pictureUrl:
                                        "https://identity.stanford.edu/img/block-s-2color.png",
                                },
                                degreeLevel: "Ph.D",
                                fieldOfStudy: "Computer Science",
                                fromDate: "2015-07-01 00:00:00.000Z",
                                toDate: "2018-07-01 00:00:00.000Z",
                            }
                        ],
                    socialAccounts: [],
                    questionsForAcceptingRequest: [],
                    workingSpecialization:
                        ["Software Engineer"],


                },
                {
                    kind: "Mentor",
                    name: "Bob",
                    surname: "Ross",
                    bio:
                        "\"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\"",
                    location: "Mountain View, US",
                    company: "Google",
                    pictureUrl:
                        "https://images.csmonitor.com/csm/2015/06/913184_1_0610-larry_standard.jpg?alias=standard_900x600",
                    currentJob: {
                        kind: "Job",
                        institution: {
                            name: "Google",
                            pictureUrl:
                                "https://freeiconshop.com/wp-content/uploads/edd/google-flat.png",
                        },
                        workingRole: "Software Engineer",
                        fromDate: "2019-03-01 00:00:00.000Z",
                    },
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
                    pastExperiences:
                        [
                            {
                                kind: "Job",
                                institution: {
                                    name: "Apple",
                                    pictureUrl:
                                        "https://i.pinimg.com/originals/1c/aa/03/1caa032c47f63d50902b9d34492e1303.jpg",
                                },
                                workingRole: "Software Engineer",
                                fromDate: "2019-03-01 00:00:00.000Z",
                                toDate: "2019-09-01 00:00:00.000Z",
                            },
                            {
                                kind: "Education",
                                institution: {
                                    name: "Stanford University",
                                    pictureUrl:
                                        "https://identity.stanford.edu/img/block-s-2color.png",
                                },
                                degreeLevel: "Ph.D",
                                fieldOfStudy: "Computer Science",
                                fromDate: "2015-07-01 00:00:00.000Z",
                                toDate: "2018-07-01 00:00:00.000Z",
                            },
                            {
                                kind: "Education",
                                institution: {
                                    name: "Politecnico di Milano",
                                    pictureUrl:
                                        "https://identity.stanford.edu/img/block-s-2color.png",
                                },
                                degreeLevel: "Ph.D",
                                fieldOfStudy: "Computer Science",
                                fromDate: "2015-07-01 00:00:00.000Z",
                                toDate: "2018-07-01 00:00:00.000Z",
                            },
                            {
                                kind: "Education",
                                institution: {
                                    name: "Politecnico di Milano",
                                    pictureUrl:
                                        "https://identity.stanford.edu/img/block-s-2color.png",
                                },
                                degreeLevel: "Ph.D",
                                fieldOfStudy: "Computer Science",
                                fromDate: "2015-07-01 00:00:00.000Z",
                                toDate: "2018-07-01 00:00:00.000Z",
                            },
                        ],
                    socialAccounts: [],
                    questionsForAcceptingRequest: [],
                    workingSpecialization:
                        ["Software Engineer", "Front End", "Backend"],


                },

            ]
        ;


        res.status(200).json(mentors);
    })
;

module.exports = router;

