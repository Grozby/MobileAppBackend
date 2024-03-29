'use strict';


const fs = require("fs");
const path = require('path');
const uuidv4 = require('uuid/v4');
const config = require('./configHandlers');
const lodash = require('lodash');
const errorParse = require('../../controller/error_parser');
let ObjectId = require('mongoose').Types.ObjectId;

const {ContactMentor} = require("../../models/contact");
const {User, Mentor, Mentee} = require('../../models/user.js');
const {mongoose} = require('../../db/mongoose.js');
mongoose.Promise = require('bluebird');
const baseDirectoryPath = require('../../app').directoryPath;

//-------------------
//  Registration
//-------------------

function saveImage(imageData) {
    if (imageData.includes("assets/images/")) {
        return imageData;
    }

    let imagePath = 'assets/images/' + uuidv4() + ".png";
    let replaceReg = /^data:image\/png;base64,/;
    let replaced = imageData.replace(replaceReg, "");
    fs.writeFile(
        path.join(__dirname, "../../public/", imagePath),
        replaced,
        'base64',
        function (error) {
            console.log(error);
        });

    return imagePath;
}

class Router {
    express = require('express');
    router = this.express.Router();

    constructor(chat) {
        this.router.post("/signup/mentor",
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

        this.router.post("/signup/mentee",
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

        this.router.post("/signup/decide",
            config.checkSignupDecide,
            async function (req, res) {
                let kind = req.body.kind;

                if (req.user.kind === "User" && ["Mentor", "Mentee"].includes(kind)) {
                    req.user.kind = kind;
                    await req.user.save();
                    return res.sendStatus(200);
                }

                return res.sendStatus(400);
            }
        );

//---------------------
//  Profile Information
//---------------------
        this.router.get("/userid",
            config.generalAuth,
            function (req, res) {
                return res.status(200).json({id: req.user.id});
            });
        this.router.get("/minimalprofile",
            config.generalAuth,
            function (req, res) {
                return res.status(200).json(req.user.minimalProfile());
            });

        this.router.get("/profile",
            config.generalAuth,
            function (req, res) {
                return res.json(req.user.toObject());
            });

        this.router.get("/profile/:id",
            config.generalAuth,
            function (req, res) {
                User.findById(req.params.id)
                    .then((profileResponse) =>
                        res.status(200).json(profileResponse == null ? {} : profileResponse.toObject()))
                    .catch((error) => res.status(400).json(error))
            });

        this.router.patch("/profile",
            config.generalAuth,
            async function (req, res) {
                if (req.body.kind !== undefined ||
                    req.body.email !== undefined ||
                    req.body._id !== undefined) {
                    return res.sendStatus(400);
                }

                //Case image data as passed as url
                if (req.body.pictureUrl) {
                    req.body.pictureUrl = saveImage(req.body.pictureUrl);
                }

                if (req.body.currentJob !== undefined &&
                    req.body.currentJob.institution !== undefined &&
                    req.body.currentJob.institution.pictureUrl !== undefined) {
                    req.body.currentJob.institution.pictureUrl = saveImage(req.body.currentJob.institution.pictureUrl);
                }

                if (req.body.experienceList !== undefined) {
                    let experienceList = [];
                    req.body.experienceList.forEach((e) => {
                        if (e.institution !== undefined &&
                            e.institution.pictureUrl !== undefined) {
                            e.institution.pictureUrl = saveImage(e.institution.pictureUrl);
                            experienceList.push(e);
                        }
                    });

                    req.body.experienceList = experienceList;
                }

                if (req.body.educationList !== undefined) {
                    let educationList = [];
                    req.body.educationList.forEach((e) => {
                        if (e.institution !== undefined &&
                            e.institution.pictureUrl !== undefined) {
                            e.institution.pictureUrl = saveImage(e.institution.pictureUrl);
                            educationList.push(e);
                        }
                    });

                    req.body.educationList = educationList;
                }


                await User.findOneAndUpdate(
                    {email: req.user.email},
                    req.body,
                    {new: true, runValidators: true})
                          .then(user => res.json(user))
                          .catch((e) =>
                              res.sendStatus(400)
                          );


            }
        );


        this.router.get("/explore/:work_type?",
            config.generalAuth,
            async function (req, res) {
                let results;

                let availableWorkTypes = [
                    'Software Engineer',
                    'Full-Stack',
                    'Front-End',
                    'Back-End',
                    'Machine Learning',
                    'Python',
                    'C++',
                    'iOS',
                    'Android',
                    'Mobile Dev.'
                ];
                if(req.params.work_type !== undefined && !availableWorkTypes.includes(req.params.work_type)){
                    return res.sendStatus(400);
                }

                switch (req.user.kind) {
                    case "Mentee":
                        let contactedMentorsId = await ContactMentor.find({"menteeId": req.user._id})
                                                                    .then((list) => list.map((e) => ObjectId(e.mentorId)));
                        let matchQueryMentee = {"$match": {
                                "_id": {"$nin": contactedMentorsId}
                            }};
                        if(req.params.work_type !== undefined){
                            matchQueryMentee["$match"]["workingSpecialization"] = {"$in":[req.params.work_type]}
                        }
                        results = await Mentor.aggregate([
                            matchQueryMentee,
                            {$sample: {size: 7}}
                        ]);
                        break;
                    case "Mentor":
                        let contactedMenteesId = await ContactMentor.find({"mentorId": req.user._id, "status": "pending"})
                                                                    .then((list) => list.map((e) => ObjectId(e.menteeId)));
                        results = await Mentee.aggregate([
                            {$match: {"_id": {"$in": contactedMenteesId}}},
                            {
                                $lookup: {
                                    from: "contactmentors",
                                    let: {userId: "$_id"},
                                    pipeline: [
                                        {
                                            $addFields:
                                                {
                                                    "menteeIdBois": {"$toObjectId": "$menteeId"},
                                                    "mentorIdBois": {"$toObjectId": "$mentorId"}
                                                }
                                        },
                                        {
                                            $match:
                                                {
                                                    $expr: {
                                                        $and: [
                                                            {$eq: ["$menteeIdBois", "$$userId"]},
                                                            {$eq: ["$mentorIdBois", req.user._id]}
                                                        ],

                                                    }
                                                }
                                        },
                                    ],
                                    as: "contactInformation"
                                }
                            },
                            {$sample: {size: 7}}
                        ]);
                        break;
                    default:
                        return res.sendStatus(400);
                }

                results.forEach(function (part, index) {
                    part.pastExperiences = [...part.educationList, ...part.experienceList];
                    delete part.educationList;
                    delete part.experienceList;
                    delete part.password;
                    delete part.fcmToken;
                    delete part.email;
                    if(part.contactInformation !== undefined){
                        part.contactInformation = part.contactInformation[0];
                        delete part.contactInformation.mentorIdBois;
                        delete part.contactInformation.menteeIdBois;
                    }

                    this[index] = part;
                }, results);

                return res.status(200).json(results);
            });


        this.router.post(
            "/sendrequest/:mentorid",
            config.generalAuth,
            async function (req, res) {
                if (req.body === undefined || req.body.answers === undefined || req.body.startingMessage === undefined) {
                    return res.status(400).json({"message": "No body."});
                }

                if (req.user.kind !== "Mentee") {
                    return res.status(400).json({"message": "A mentor cannot contact another mentor."});
                }

                let mentor = await User.findById(req.params.mentorid);
                let contact = await ContactMentor.findOne({
                    "mentorId": req.params.mentorid,
                    "menteeId": req.user._id,
                });

                if (mentor == null) {
                    return res.status(400).json({"message": "No mentor"});
                }

                if (contact != null) {
                    return res.status(400).json({"message": "Already contacted."});
                }


                mentor = mentor.toObject();
                let answers = [];
                for (let i = 0; i < mentor.questionsForAcceptingRequest.length; i++) {

                    if (req.body.answers === undefined || req.body.answers[i] === undefined ||
                        (req.body.answers[i].textAnswer === undefined && req.body.answers[i].audioAnswer === undefined)) {
                        return res.status(400).json({"message": "No answers."});
                    }

                    answers.push(
                        {
                            "question": mentor.questionsForAcceptingRequest[i].question,
                            "textAnswer": req.body.answers[i].textAnswer ? req.body.answers[i].textAnswer : "",
                            "audioAnswer": req.body.answers[i].audioAnswer ? req.body.answers[i].audioAnswer : "",
                        }
                    );
                }

                let aq = ContactMentor({
                    "menteeId": req.user._id,
                    "mentorId": req.params.mentorid,
                    "startingMessage": req.body.startingMessage,
                    "answers": answers,
                });
                await aq.save();

                await chat.newContactRequest(aq, req.user);

                return res.sendStatus(200);
            });

        this.router.post(
            "/deciderequest/:idrequest",
            config.generalAuth,
            async function (req, res) {
                if (req.body === undefined) {
                    return res.status(400).json({"message": "No body."});
                }

                if (!["accepted", "refused"].includes(req.body.status)) {
                    return res.status(400).json({"message": "Incorrect status."});
                }

                if (req.user.kind === "Mentee") {
                    return res.status(400).json({"message": "What are you doing here?!"});
                }

                let request = await ContactMentor.findById(req.params.idrequest)
                                                 .catch(_ => null);

                if (request == null) {
                    return res.status(400).json({"message": "No request found."});
                }

                if (request.status !== "pending") {
                    return res.status(400).json({"message": "Can't change what's have been decided."});
                }


                if (!ObjectId(request.mentorId).equals(req.user.toObject()._id)) {
                    return res.status(400).json({"message": "Can't decide other's fate."});
                }

                request.status = req.body.status;
                await request.save();

                await chat.updatedContactRequest(request, req.user);

                return res.sendStatus(200);
            });

        this.router.get("/contactrequest",
            config.generalAuth,
            async function (req, res) {
                let results;
                switch (req.user.kind) {
                    case "Mentee":
                        results = await ContactMentor
                            .find({"menteeId": req.user._id})
                            .then(async (list) => await Promise.all(list.map(async function (e) {
                                    e = e.toObject();
                                    e.user = await Mentor.findById(e.mentorId).then((e) => e.minimalProfile());
                                    delete e.mentorId;
                                    return e;
                                }
                            )));
                        break;
                    case "Mentor":
                        results = await ContactMentor
                            .find({"mentorId": req.user._id})
                            .then(async (list) => await Promise.all(list.map(async function (e) {
                                    e = e.toObject();
                                    e.user = await Mentee.findById(e.menteeId).then((e) => e.minimalProfile());
                                    delete e.menteeId;
                                    return e;
                                }
                            )));
                        break;
                    default:
                        return res.sendStatus(400);
                }

                if (results.messages === undefined) {
                    results.messages = [];
                } else {
                    let previewMessage = results.messages.filter(m => m.userId !== req.user._id && !m.isRead);
                    results.messages = previewMessage.length !== 0
                        ? previewMessage
                        : [results.messages[0]];
                }


                return res.status(200).json(results);
            });

        this.router.get("/contactrequest/:idrequest",
            config.generalAuth,
            async function (req, res) {
                let result = await ContactMentor.findById(req.params.idrequest)
                                                .then(e => e.toObject())
                                                .catch(e => null);
                if (result === null) {
                    return res.sendStatus(400);
                }

                if (req.user.kind === "Mentor") {
                    result.user = await Mentee.findById(result.menteeId).then((e) => e.minimalProfile());
                    delete result.menteeId;
                } else {
                    result.user = await Mentor.findById(result.mentorId).then((e) => e.minimalProfile());
                    delete result.mentorId;
                }
                return res.status(200).json(result);
            });
    }
}

module.exports = {
    startRouter: chat => new Router(chat),
};

